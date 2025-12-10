
import pool from '../config/db';

const addLocationColumn = async () => {
    const query = `
    ALTER TABLE users
    ADD COLUMN location VARCHAR(255) NULL;
  `;

    try {
        const connection = await pool.getConnection();
        // Check if column exists first to avoid error? Or just try-catch.
        // Simple way: just run it. If it exists, it errors, we catch it.
        await connection.query(query);
        console.log('Location column added successfully.');
        connection.release();
        process.exit(0);
    } catch (error: any) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('Location column already exists.');
            process.exit(0);
        }
        console.error('Error adding location column:', error);
        process.exit(1);
    }
};

addLocationColumn();
