import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export const runtime = 'nodejs';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const email = searchParams.get('email');

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

  
    let query = `
      SELECT 
        lm.id, 
        lm.loan_account_number, 
        lm.modt, 
        lm.noi_data_entry_page,
        lm.noi_receipt, 
        lm.noi_index2, 
        lm.created_at, 
        lm.status,
        lm.modt_approval_status,
        lm.noi_index2_approval_status,
        lm.title_document_status
      FROM 
        loan_master lm
      JOIN 
        users u ON lm.user_id = u.id
    `;
    const values = [];
    const conditions = [];

    if (status) {
      conditions.push('lm.status = ?');
      values.push(status);
    }

    if (email) {
      conditions.push('u.email_id = ?');
      values.push(email);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY lm.created_at ASC';

    const [rows] = await connection.execute(query, values);
    return NextResponse.json(rows, { status: 200 });

  } catch (error) {
    console.error('Failed to fetch loans:', error);
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