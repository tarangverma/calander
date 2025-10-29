const pool = require('./db');

const initDatabase = async () => {
    try {
        // Wrap in a transaction to keep schema consistent
        await pool.query('BEGIN');

        // Create users table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS people (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create events table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS events (
                id SERIAL PRIMARY KEY,
                user_id INTEGER,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                start_time TIMESTAMP NOT NULL,
                end_time TIMESTAMP NOT NULL,
                reminder_time TIMESTAMP,
                reminder_sent BOOLEAN DEFAULT FALSE,
                location TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create event_attendees table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS event_attendees (
                id SERIAL PRIMARY KEY,
                event_id INTEGER NOT NULL,
                email VARCHAR(255) NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(event_id, email)
            )
        `);

        // Ensure the correct FK exists for events (handles legacy schemas)
        await pool.query(`
            DO $$
            BEGIN
                -- Drop existing FK if present (regardless of referenced table)
                IF EXISTS (
                    SELECT 1 FROM information_schema.table_constraints tc
                    WHERE tc.table_name = 'events'
                      AND tc.constraint_type = 'FOREIGN KEY'
                      AND tc.constraint_name = 'events_user_id_fkey'
                ) THEN
                    ALTER TABLE events DROP CONSTRAINT events_user_id_fkey;
                END IF;

                -- Add desired FK referencing people(id)
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints tc
                    WHERE tc.table_name = 'events'
                      AND tc.constraint_type = 'FOREIGN KEY'
                      AND tc.constraint_name = 'events_user_id_fkey'
                ) THEN
                    ALTER TABLE events
                    ADD CONSTRAINT events_user_id_fkey
                    FOREIGN KEY (user_id) REFERENCES people(id) ON DELETE CASCADE;
                END IF;
            END $$;
        `);

        // Ensure FK exists for event_attendees
        await pool.query(`
            DO $$
            BEGIN
                -- Drop existing FK if present
                IF EXISTS (
                    SELECT 1 FROM information_schema.table_constraints tc
                    WHERE tc.table_name = 'event_attendees'
                      AND tc.constraint_type = 'FOREIGN KEY'
                      AND tc.constraint_name = 'event_attendees_event_id_fkey'
                ) THEN
                    ALTER TABLE event_attendees DROP CONSTRAINT event_attendees_event_id_fkey;
                END IF;

                -- Add FK referencing events(id)
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints tc
                    WHERE tc.table_name = 'event_attendees'
                      AND tc.constraint_type = 'FOREIGN KEY'
                      AND tc.constraint_name = 'event_attendees_event_id_fkey'
                ) THEN
                    ALTER TABLE event_attendees
                    ADD CONSTRAINT event_attendees_event_id_fkey
                    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;
                END IF;
            END $$;
        `);

        // Optional: enforce NOT NULL on user_id now that FK is correct
        await pool.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'events' 
                    AND column_name = 'user_id' 
                    AND is_nullable = 'NO'
                ) THEN
                    ALTER TABLE events ALTER COLUMN user_id SET NOT NULL;
                END IF;
            END $$;
        `);

        // Create indexes for events
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
            CREATE INDEX IF NOT EXISTS idx_events_reminder_time 
            ON events(reminder_time) WHERE reminder_sent = FALSE;
            CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
        `);

        // Create indexes for event_attendees
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_event_attendees_event_id ON event_attendees(event_id);
            CREATE INDEX IF NOT EXISTS idx_event_attendees_email ON event_attendees(email);
            CREATE INDEX IF NOT EXISTS idx_event_attendees_status ON event_attendees(status);
        `);

        // Create function to update updated_at timestamp
        await pool.query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';
        `);

        // Create trigger to automatically update updated_at
        await pool.query(`
            DROP TRIGGER IF EXISTS update_events_updated_at ON events;
            CREATE TRIGGER update_events_updated_at
                BEFORE UPDATE ON events
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        `);

        await pool.query('COMMIT');
        console.log('Database initialized successfully');
        
        // Verify tables were created
        const tables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('people', 'events', 'event_attendees')
        `);
        
        console.log('Created tables:', tables.rows.map(row => row.table_name));
        
    } catch (error) {
        console.error('Error initializing database:', error);
        try { await pool.query('ROLLBACK'); } catch (_) {}
        throw error;
    }
};

// Run the initialization
initDatabase().catch(console.error);

module.exports = initDatabase;