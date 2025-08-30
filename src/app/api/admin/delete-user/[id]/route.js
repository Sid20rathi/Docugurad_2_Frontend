import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export const runtime = 'nodejs';

export async function DELETE(request, { params }) {
  // FIX: Explicitly parse the ID from the URL params into an integer.
  const id = parseInt(params.id, 10);

  // Add validation to ensure the ID is a valid number.
  if (!id || isNaN(id)) {
    return NextResponse.json({ message: 'A valid User ID is required.' }, { status: 400 });
  }

  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      ssl: { "rejectUnauthorized": true }
    });

    await connection.beginTransaction();

    // The numeric 'id' is now used in the queries.
    const deleteLoansQuery = 'DELETE FROM loan_master WHERE user_id = ?';
    await connection.execute(deleteLoansQuery, [id]);

    const deleteUserQuery = 'DELETE FROM users WHERE id = ?';
    const [userResult] = await connection.execute(deleteUserQuery, [id]);

    if (userResult.affectedRows === 0) {
      await connection.rollback();
      // This 404 will now only trigger if the user truly does not exist.
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    await connection.commit();

    return NextResponse.json({ message: 'User and associated data deleted successfully.' }, { status: 200 });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Transaction failed:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
