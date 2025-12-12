# Backend API

## Prerequisites

- Node.js (v14 or higher)
- MySQL

## Installation

1.  Clone the repository and navigate to the `backend` directory.
2.  Install dependencies:
    ```bash
    npm install
    ```

## Configuration

1.  Create a `.env` file based on the example:
    ```bash
    cp .env.example .env
    ```
2.  The `.env` file should contain your database credentials and the `DATABASE_URL` for Prisma (replace placeholders with your own values and keep this file out of version control):
    ```ini
    PORT=5000
    DB_HOST=localhost
    DB_USER=<DB_USER>
    DB_PASSWORD=<DB_PASSWORD>
    DB_NAME=projetjs_db
    JWT_SECRET=<JWT_SECRET>
    # Prisma connection string
    DATABASE_URL="mysql://<DB_USER>:<DB_PASSWORD>@<HOST>:<PORT>/<DB_NAME>"
    ```

If any credential was ever committed, rotate it immediately (DB user/password, JWT secret) and invalidate old values.

## Database Migration (Prisma)

We use Prisma ORM to manage the database.

1.  **Run Migrations:** This will create the tables in your MySQL database.
    ```bash
    npx prisma migrate dev
    ```

2.  **Generate Client:** (Happens automatically after migrate, but if needed)
    ```bash
    npx prisma generate
    ```

3.  **Visualise Database:** (Optional)
    ```bash
    npx prisma studio
    ```

## Running the Server

### Development Mode
Runs the server with `nodemon` for hot-reloading.
```bash
npm run dev
```

### Production Mode
Builds the TypeScript code and starts the server.
```bash
npm run build
npm start
```
