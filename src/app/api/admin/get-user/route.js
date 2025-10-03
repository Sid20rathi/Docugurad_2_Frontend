import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export const runtime = 'nodejs';

export async function GET(request) {
  // NOTE: The email search parameter is no longer needed, as we are fetching all users.

  let connection;
  try {
    // Database connection logic is the same as your original file.
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      ssl: { rejectUnauthorized: false }
    });

    // CHANGED: The SQL query now selects all users instead of filtering by email.
    // An ORDER BY clause is added for a consistent, alphabetical list.
    const query = 'SELECT id, first_name, last_name, email_id, phone_number , user_type FROM users ORDER BY first_name, last_name';
    
    // The query is executed without any parameters.
    const [rows] = await connection.execute(query);

    // CHANGED: The entire 'rows' array is returned to the frontend.
    // Your component will handle the case where the array is empty.
    return NextResponse.json(rows, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}