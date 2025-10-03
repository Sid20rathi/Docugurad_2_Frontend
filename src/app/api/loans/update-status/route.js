import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export const runtime = 'nodejs';

export async function PUT(request) {
  const { loanId, documentType, status } = await request.json();

  if (!loanId || !documentType || !status) {
    return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
  }


  const allowedDocumentTypes = {
    modt: 'modt_approval_status',
    noi_index2: 'noi_index2_approval_status'
  };

  const columnToUpdate = allowedDocumentTypes[documentType];

  if (!columnToUpdate) {
    return NextResponse.json({ message: 'Invalid document type.' }, { status: 400 });
  }

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

    const query = `UPDATE loan_master SET ${columnToUpdate} = ? WHERE id = ?`;
    const [result] = await connection.execute(query, [status, loanId]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: 'Loan not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Status updated successfully!' }, { status: 200 });

  } catch (error) {
    console.error('Failed to update status:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}