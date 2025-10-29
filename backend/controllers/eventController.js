const pool = require('../config/db');
const { Resend } = require('resend');

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

const eventController = {
    createEvent: async (req, res) => {
        try {
            const { title, description, start_time, end_time, reminder_time, attendees, location } = req.body;
            const userId = req.user.id;

            // Debug log
            console.log('Creating event:', { title, start_time, end_time, attendees, location });

            // Sanity checks to avoid FK violations and provide clearer errors
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized: missing user context' });
            }

            const { rows: userRows } = await pool.query(
                'SELECT id FROM people WHERE id = $1',
                [userId]
            );
            if (userRows.length === 0) {
                return res.status(401).json({ error: 'User not found. Please log in again.' });
            }

            console.log('Attempting to create event for user_id:', userId);

            // Start a transaction
            const client = await pool.connect();
            try {
                await client.query('BEGIN');

                // Insert the main event
                const eventResult = await client.query(
                    `INSERT INTO events 
                    (user_id, title, description, start_time, end_time, reminder_time, location)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    RETURNING *`,
                    [userId, title, description, start_time, end_time, reminder_time, location]
                );

                const event = eventResult.rows[0];

                // Insert attendees if provided
                if (attendees && attendees.length > 0) {
                    const attendeeValues = attendees.map((email, index) => 
                        `($1, $${index + 2}, 'pending')`
                    ).join(', ');

                    const attendeeParams = [event.id, ...attendees];
                    
                    await client.query(
                        `INSERT INTO event_attendees (event_id, email, status)
                         VALUES ${attendeeValues}`,
                        attendeeParams
                    );
                }

                await client.query('COMMIT');
                
                console.log('Created event:', event);
                res.status(201).json({
                    ...event,
                    attendees: attendees || []
                });

            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }

        } catch (error) {
            console.error('Create event error:', error);
            res.status(500).json({ error: `Create event failed: ${error.message}` });
        }
    },

    getEvents: async (req, res) => {
        try {
            const userId = req.user.id;
            const result = await pool.query(
                `SELECT e.id, e.title, e.description, 
                        e.start_time, e.end_time, e.reminder_time, e.location,
                        e.created_at, e.updated_at,
                        COALESCE(
                            json_agg(
                                DISTINCT jsonb_build_object(
                                    'email', ea.email,
                                    'status', ea.status
                                )
                            ) FILTER (WHERE ea.email IS NOT NULL),
                            '[]'
                        ) as attendees
                FROM events e
                LEFT JOIN event_attendees ea ON e.id = ea.event_id
                WHERE e.user_id = $1 
                GROUP BY e.id
                ORDER BY e.start_time ASC`,
                [userId]
            );

            console.log('Fetched events:', result.rows.length);
            res.json(result.rows);
        } catch (error) {
            console.error('Get events error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    getEvent: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const result = await pool.query(
                `SELECT e.*,
                        COALESCE(
                            json_agg(
                                DISTINCT jsonb_build_object(
                                    'email', ea.email,
                                    'status', ea.status
                                )
                            ) FILTER (WHERE ea.email IS NOT NULL),
                            '[]'
                        ) as attendees
                FROM events e
                LEFT JOIN event_attendees ea ON e.id = ea.event_id
                WHERE e.id = $1 AND e.user_id = $2
                GROUP BY e.id`,
                [id, userId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Event not found' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    updateEvent: async (req, res) => {
        try {
            const { id } = req.params;
            const { title, description, start_time, end_time, reminder_time, attendees, location } = req.body;
            const userId = req.user.id;

            const client = await pool.connect();
            try {
                await client.query('BEGIN');

                // Update the main event
                const eventResult = await client.query(
                    `UPDATE events 
                    SET title = $1, description = $2, start_time = $3, 
                        end_time = $4, reminder_time = $5, location = $6
                    WHERE id = $7 AND user_id = $8 
                    RETURNING *`,
                    [title, description, start_time, end_time, reminder_time, location, id, userId]
                );

                if (eventResult.rows.length === 0) {
                    await client.query('ROLLBACK');
                    return res.status(404).json({ error: 'Event not found' });
                }

                const event = eventResult.rows[0];

                // Update attendees - first remove existing, then add new
                await client.query(
                    'DELETE FROM event_attendees WHERE event_id = $1',
                    [id]
                );

                if (attendees && attendees.length > 0) {
                    const attendeeValues = attendees.map((email, index) => 
                        `($1, $${index + 2}, 'pending')`
                    ).join(', ');

                    const attendeeParams = [id, ...attendees];
                    
                    await client.query(
                        `INSERT INTO event_attendees (event_id, email, status)
                         VALUES ${attendeeValues}`,
                        attendeeParams
                    );
                }

                await client.query('COMMIT');

                res.json({
                    ...event,
                    attendees: attendees || []
                });

            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    deleteEvent: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const client = await pool.connect();
            try {
                await client.query('BEGIN');

                // First delete attendees
                await client.query(
                    'DELETE FROM event_attendees WHERE event_id = $1',
                    [id]
                );

                // Then delete the event
                const result = await client.query(
                    'DELETE FROM events WHERE id = $1 AND user_id = $2 RETURNING *',
                    [id, userId]
                );

                if (result.rows.length === 0) {
                    await client.query('ROLLBACK');
                    return res.status(404).json({ error: 'Event not found' });
                }

                await client.query('COMMIT');
                res.json({ message: 'Event deleted successfully' });

            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    sendEmailInvites: async (req, res) => {
        try {
            const { eventId } = req.params;
            const userId = req.user.id;

            // Verify event belongs to user and get event details
            const eventResult = await pool.query(
                `SELECT e.*, 
                        COALESCE(
                            json_agg(
                                DISTINCT jsonb_build_object(
                                    'email', ea.email,
                                    'status', ea.status
                                )
                            ) FILTER (WHERE ea.email IS NOT NULL),
                            '[]'
                        ) as attendees
                FROM events e
                LEFT JOIN event_attendees ea ON e.id = ea.event_id
                WHERE e.id = $1 AND e.user_id = $2
                GROUP BY e.id`,
                [eventId, userId]
            );

            if (eventResult.rows.length === 0) {
                return res.status(404).json({ error: 'Event not found' });
            }

            const event = eventResult.rows[0];

            if (!event.attendees || event.attendees.length === 0) {
                return res.status(400).json({ error: 'No attendees found for this event' });
            }

            // Generate ICS content
            const icsContent = generateIcsContent(event);

            // Send emails to all attendees
            const emailResults = [];
            const errors = [];

            for (const attendee of event.attendees) {
                try {
                    const { data, error } = await resend.emails.send({
                        from: 'Your Scheduling App <onboarding@resend.dev>', // Replace with your verified domain
                        to: [attendee.email],
                        subject: `Invitation: ${event.title}`,
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <h2 style="color: #333;">You're invited to: ${event.title}</h2>
                                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
                                    <p><strong>When:</strong> ${new Date(event.start_time).toLocaleString()} - ${new Date(event.end_time).toLocaleString()}</p>
                                    ${event.location ? `<p><strong>Where:</strong> ${event.location}</p>` : ''}
                                    ${event.description ? `<p><strong>Description:</strong> ${event.description}</p>` : ''}
                                </div>
                                <p style="margin-top: 20px;">Please use the attached calendar file to add this event to your calendar.</p>
                                <p style="color: #666; font-size: 14px; margin-top: 20px;">
                                    This invitation was sent via Your Scheduling App.
                                </p>
                            </div>
                        `,
                        attachments: [
                            {
                                filename: `invite-${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`,
                                content: Buffer.from(icsContent).toString('base64'),
                            },
                        ],
                    });

                    if (error) {
                        errors.push({ email: attendee.email, error: error.message });
                    } else {
                        emailResults.push({ email: attendee.email, success: true });
                        
                        // Update attendee status to 'invited'
                        await pool.query(
                            'UPDATE event_attendees SET status = $1 WHERE event_id = $2 AND email = $3',
                            ['invited', eventId, attendee.email]
                        );
                    }
                } catch (error) {
                    errors.push({ email: attendee.email, error: error.message });
                }
            }

            res.json({
                success: true,
                sent: emailResults.length,
                failed: errors.length,
                results: emailResults,
                errors: errors
            });

        } catch (error) {
            console.error('Send email invites error:', error);
            res.status(500).json({ error: 'Failed to send email invites' });
        }
    }
};

// Helper function to generate ICS content
function generateIcsContent(event) {
    const formatDate = (date) => {
        const d = new Date(date);
        return d.toISOString().replace(/-|:|\.\d+/g, '');
    };
    
    const start = formatDate(event.start_time);
    const end = formatDate(event.end_time);
    const created = formatDate(new Date());

    const attendees = event.attendees.map(attendee => 
        `ATTENDEE;RSVP=TRUE:mailto:${attendee.email}`
    ).join('\r\n');

    return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//YourApp//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:REQUEST',
        'BEGIN:VEVENT',
        `UID:${created}-${Math.random().toString(36).substr(2, 9)}@yourapp.com`,
        `DTSTAMP:${created}`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${event.description || 'No description'}`,
        `LOCATION:${event.location || 'Online'}`,
        `ORGANIZER:mailto:organizer@yourapp.com`,
        attendees,
        'STATUS:CONFIRMED',
        'SEQUENCE:0',
        'TRANSP:OPAQUE',
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');
}

module.exports = eventController;