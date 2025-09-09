import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise'; 

export const runtime = 'nodejs';

export async function POST(request) {
 
  const body = await request.json();
  const { loanAccountNumber,status } = body;

 
  if (!loanAccountNumber ||  !status) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (status !== 'approved' && status !== 'rejected') {
    return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
  }

 
  let columnToUpdate = 'title_document_status';
 

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


    const sqlQuery = `
      UPDATE loan_master 
      SET ${columnToUpdate} = ? 
      WHERE loan_account_number = ?
    `;
    

    const [result] = await connection.execute(sqlQuery, [status, loanAccountNumber]);


    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Loan account number not found' }, { status: 404 });
    }

 
    return NextResponse.json({ message: 'Status updated successfully' }, { status: 200 });

  } catch (error) {
    console.error('DATABASE ERROR:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {

    if (connection) {
      await connection.end();
    }
  }
}