import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import toast, { Toaster } from 'react-hot-toast';

export const runtime = 'nodejs'; 

const SALT_ROUNDS = 10;

export async function POST(request) {

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: { rejectUnauthorized: true } 
  });


  
  try {
    const body = await request.json();
    const { firstName, lastName, email, password ,number} = body;

    if (!firstName || !lastName || !email || !password || password.length < 8 || !number || number.length<5) {
      return NextResponse.json(
        { message: 'Please fill out all fields. Password must be at least 8 characters.' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const query = 'INSERT INTO users (first_name, last_name, email_id, password_hash, phone_number) VALUES (?, ?, ?, ?, ?)';
    const values = [firstName, lastName, email, hashedPassword,number];
    
    await connection.execute(query, values);

    return NextResponse.json({ message: 'User created successfully!' }, { status: 201 });

  } catch (error) {
    console.error(error); 
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { message: 'An account with this email already exists.' },
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