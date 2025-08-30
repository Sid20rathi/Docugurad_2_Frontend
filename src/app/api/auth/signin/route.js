import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; 
import { serialize } from 'cookie'; 

export const runtime = 'nodejs';

// 1 week in seconds
const TOKEN_EXPIRATION = 60 * 60 * 24 * 7; 

export async function POST(request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
  }

  // Ensure you have a mechanism to handle connection pooling in a real app
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: { rejectUnauthorized: true }
  });

  try {
    const query = 'SELECT * FROM users WHERE email_id = ?';
    const [rows] = await connection.execute(query, [email]);

    if (rows.length === 0) {
      await connection.end();
      return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      await connection.end();
      return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
    }

    // --- UPDATED TOKEN PAYLOAD ---
    const tokenPayload = {
      userId: user.id,
      email: user.email_id,
      user_type: user.user_type,
      firstName: user.first_name,
      lastName: user.last_name,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: TOKEN_EXPIRATION,
    });

    const cookie = serialize('authToken', token, {
      httpOnly: true,    
      secure: process.env.NODE_ENV === 'production', 
      maxAge: TOKEN_EXPIRATION,
      sameSite: 'strict',  
      path: '/',           
    });

    // --- UPDATED RESPONSE ---
    // This now includes the user's name to be used by the frontend
    const response = NextResponse.json({ 
        message: 'Sign-in successful!',
        email: user.email_id,
        user_type: user.user_type,
        firstName: user.first_name,
        lastName: user.last_name,
    });
    
    response.headers.set('Set-Cookie', cookie);
    
    return response;

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}