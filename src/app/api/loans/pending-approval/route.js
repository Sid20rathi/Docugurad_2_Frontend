import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export const runtime = 'nodejs';

export async function GET(request) {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      ssl: { rejectUnauthorized: false }
    });

    const query = `
      SELECT 
        id, 
        loan_account_number, 
        modt, 
        noi_index2,
        modt_approval_status,
        noi_index2_approval_status,
        title_document_status,
        created_at
      FROM 
        loan_master
      WHERE
        (modt_approval_status = 'pending' OR noi_index2_approval_status = 'pending' OR title_document_status = 'pending')
      ORDER BY 
        created_at ASC;
    `;

    const [rows] = await connection.execute(query);
    return NextResponse.json(rows, { status: 200 });

  } catch (error) {
    console.error('Failed to fetch pending loans:', error);
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