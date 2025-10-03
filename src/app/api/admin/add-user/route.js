import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

export const runtime = 'nodejs';

const SALT_ROUNDS = 10;

export async function POST(request) {
  let connection;
  try {
    // Establish connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      ssl: { rejectUnauthorized: false }
    });

    const body = await request.json();
    const { firstName, lastName, email, password, number, user_type } = body;
    console.log(body);

    // Validation
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      password.length < 8 ||
      !number ||
      number.length < 5 ||
      !user_type
    ) {
      return NextResponse.json(
        { message: 'Please fill out all fields. Password must be at least 8 characters and phone at least 5.' },
        { status: 400 }
      );
    }

    // Restrict user_type to only "agent" or "manager"
    if (!['agent', 'manager'].includes(user_type.toLowerCase())) {
      return NextResponse.json(
        { message: 'Invalid user_type. Only "agent" or "manager" are allowed.' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert into DB
    const query = `
      INSERT INTO users (first_name, last_name, email_id, password_hash, phone_number, user_type) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [firstName, lastName, email, hashedPassword, number, user_type.toLowerCase()];

    await connection.execute(query, values);

    return NextResponse.json({ message: 'User created successfully!' }, { status: 201 });

  } catch (error) {
    console.error(error);

    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { message: 'An account with this email or phone number already exists.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: 'An internal server error occurred.' },
      { status: 500 }
    );

  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
