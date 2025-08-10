const pool = require('../config/db');

const eventController = {
    createEvent: async (req, res) => {
        try {
            const { title, description, start_time, end_time, reminder_time } = req.body;
            const userId = req.user.id;

           // console.log('Creating event:', { title, start_time, end_time }); // Debug log

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

            const result = await pool.query(
                `INSERT INTO events 
                (user_id, title, description, start_time, end_time, reminder_time)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *`,
                [userId, title, description, start_time, end_time, reminder_time]
            );

        //    console.log('Created event:', result.rows[0]); // Debug log
            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Create event error:', error);
            res.status(500).json({ error: `Create event failed: ${error.message}` });
        }
    },

    getEvents: async (req, res) => {
        try {
            const userId = req.user.id;
            const result = await pool.query(
                `SELECT id, title, description, 
                        start_time, end_time, reminder_time,
                        created_at, updated_at
                FROM events 
                WHERE user_id = $1 
                ORDER BY start_time ASC`,
                [userId]
            );

          //  console.log('Fetched events:', result.rows); // Debug log
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
                'SELECT * FROM events WHERE id = $1 AND user_id = $2',
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
            const { title, description, start_time, end_time, reminder_time } = req.body;
            const userId = req.user.id;

            const result = await pool.query(
                `UPDATE events 
                SET title = $1, description = $2, start_time = $3, 
                    end_time = $4, reminder_time = $5
                WHERE id = $6 AND user_id = $7 
                RETURNING *`,
                [title, description, start_time, end_time, reminder_time, id, userId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Event not found' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    deleteEvent: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const result = await pool.query(
                'DELETE FROM events WHERE id = $1 AND user_id = $2 RETURNING *',
                [id, userId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Event not found' });
            }

            res.json({ message: 'Event deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = eventController;