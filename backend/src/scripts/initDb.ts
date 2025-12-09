
import pool from '../config/db';

const createUsersTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      role ENUM('student', 'professor', 'admin') DEFAULT 'student',
      filiere VARCHAR(50) NULL,
      year VARCHAR(10) NULL,
      subjects JSON NULL,
      avatar VARCHAR(255) NULL,
      bio TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

    try {
        const connection = await pool.getConnection();
        await connection.query(query);
        console.log('Users table created or already exists.');
        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('Error creating users table:', error);
        process.exit(1);
    }
};

createUsersTable();
