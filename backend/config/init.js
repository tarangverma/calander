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
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Ensure the correct FK exists (handles legacy schemas)
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
                ALTER TABLE events
                ADD CONSTRAINT events_user_id_fkey
                FOREIGN KEY (user_id) REFERENCES people(id) ON DELETE CASCADE;
            END $$;
        `);

        // Optional: enforce NOT NULL on user_id now that FK is correct
        await pool.query(`
            ALTER TABLE events
            ALTER COLUMN user_id SET NOT NULL;
        `);

        // Create indexes
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
            CREATE INDEX IF NOT EXISTS idx_events_reminder_time 
            ON events(reminder_time) WHERE reminder_sent = FALSE;
        `);

        await pool.query('COMMIT');
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        try { await pool.query('ROLLBACK'); } catch (_) {}
        throw error;
    }
};

// Run the initialization
initDatabase().catch(console.error);

module.exports = initDatabase;
