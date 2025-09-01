import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { put } from '@vercel/blob';

export const runtime = 'nodejs';

export async function POST(request) {
  let connection;
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const loanId = formData.get('loanId');
    const documentType = formData.get('documentType');

    // --- 1. Validation ---
    if (!file || !loanId || !documentType) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }

    // --- 2. Security: Whitelist document types ---
    const allowedColumns = ['modt', 'noi_data_entry_page', 'noi_receipt', 'noi_index2'];
    if (!allowedColumns.includes(documentType)) {
      return NextResponse.json({ message: 'Invalid document type.' }, { status: 400 });
    }

    // --- 3. File Handling: Upload to Vercel Blob ---
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${file.name.replaceAll(' ', '_')}`;

    // Upload file to Vercel Blob
    const { url } = await put(filename, buffer, {
      access: 'public', // 👈 makes file accessible via URL
    });

    const fileUrl = url; // Use Blob URL instead of local path

    // --- 4. Database Update ---
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      ssl: { rejectUnauthorized: true }
    });

    // Update the column for the uploaded file
    const updateQuery = `UPDATE loan_master SET \`${documentType}\` = ? WHERE id = ?`;
    await connection.execute(updateQuery, [fileUrl, loanId]);

    // --- NEW LOGIC: Check if all documents are present and update status ---
    const [rows] = await connection.execute(
      'SELECT modt, noi_data_entry_page, noi_receipt, noi_index2 FROM loan_master WHERE id = ?',
      [loanId]
    );

    if (rows.length > 0) {
      const loan = rows[0];
      // Check if all documents exist
      if (loan.modt && loan.noi_data_entry_page && loan.noi_receipt && loan.noi_index2) {
        await connection.execute(
          "UPDATE loan_master SET status = 'upload completed' WHERE id = ?",
          [loanId]
        );
      }
    }

    return NextResponse.json(
      { message: 'File uploaded to Vercel Blob and record updated successfully!', fileUrl },
      { status: 200 }
    );

  } catch (error) {
    console.error('Upload failed:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
