// This route handles GET requests to fetch all non-blocked users.

import { NextResponse } from 'next/server';
// Note: You need a database connection utility.
// The path might be different based on your project structure.
// import { pool } from '@/lib/db'; 

export async function GET() {
  try {
    // --- Replace this with your actual database connection and query ---
    // Example using a hypothetical 'pool.query' function:
    // const [users] = await pool.query(
    //   `SELECT id, first_name, last_name, email_id FROM users WHERE blocked = FALSE ORDER BY first_name ASC`
    // );
    
    // --- Mock data for demonstration if you don't have a DB connection set up ---
    const users = [
        { id: 1, first_name: 'John', last_name: 'Doe', email_id: 'john.d@example.com' },
        { id: 2, first_name: 'Jane', last_name: 'Smith', email_id: 'jane.s@example.com' },
    ];
    // --- End of mock data ---

    return NextResponse.json(users);

  } catch (error) {
    console.error('API GET Error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch users.', error: error.message },
      { status: 500 }
    );
  }
}