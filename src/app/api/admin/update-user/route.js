import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export const runtime = 'nodejs';

export async function PUT(request) {
  let connection;
  try {
    const body = await request.json();
   
    const { firstName, lastName, number, email } = body;


    if (!firstName || !lastName || !number || !email) {
      return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
    }

    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      ssl: { rejectUnauthorized: false }
    });

  
    const query = 'UPDATE users SET first_name = ?, last_name = ?, phone_number = ? WHERE email_id = ?';
    const values = [firstName, lastName, number, email];

    const [result] = await connection.execute(query, values);

    
    if (result.affectedRows === 0) {
      return NextResponse.json({ message: 'User not found or no changes made.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User updated successfully!' }, { status: 200 });

  } catch (error) {
    console.error(error);
   
    if (error.code === 'ER_DUP_ENTRY') {
        return NextResponse.json({ message: 'This phone number is already in use by another account.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}