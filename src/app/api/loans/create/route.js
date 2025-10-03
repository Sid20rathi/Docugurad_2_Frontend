import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { put } from '@vercel/blob';

export const runtime = 'nodejs';

const uploadToBlob = async (file, folder = 'uploads') => {
  if (!file || file.size === 0) return null;

  const filename = `${folder}/${Date.now()}-${file.name.replaceAll(' ', '_')}`;
  const { url } = await put(filename, file, { access: 'public' });
  return url; // permanent URL to the file
};

export async function POST(request) {
  let connection;
  try {
    const formData = await request.formData();
    const loanAccountNumber = formData.get('loanAccountNumber');
    const userEmail = formData.get('userEmail');
    const modtFile = formData.get('modt');
    const noi_data_entry_page = formData.get('noi_data_entry_page');
    const noiReceiptFile = formData.get('noi_receipt');
    const noiIndex2File = formData.get('noi_index2');

    if (!loanAccountNumber || !userEmail) {
      return NextResponse.json(
        { message: 'Loan Account Number and User Email are required.' },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      ssl: { rejectUnauthorized: false }
    });

    const [users] = await connection.execute(
      'SELECT id FROM users WHERE email_id = ?',
      [userEmail]
    );
    if (users.length === 0) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }
    const userId = users[0].id;

    const allFilesUploaded =
      modtFile?.size > 0 &&
      noiReceiptFile?.size > 0 &&
      noiIndex2File?.size > 0 &&
      noi_data_entry_page?.size > 0;

    const status = allFilesUploaded ? 'upload completed' : 'pending';

    // Upload to Vercel Blob
    const modtUrl = await uploadToBlob(modtFile);
    const noiDataEntryUrl = await uploadToBlob(noi_data_entry_page);
    const noiReceiptUrl = await uploadToBlob(noiReceiptFile);
    const noiIndex2Url = await uploadToBlob(noiIndex2File);

    const query = `
      INSERT INTO loan_master 
      (loan_account_number, modt, noi_data_entry_page, noi_receipt, noi_index2, status, user_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      loanAccountNumber,
      modtUrl,
      noiDataEntryUrl,
      noiReceiptUrl,
      noiIndex2Url,
      status,
      userId
    ];

    await connection.execute(query, values);

    return NextResponse.json({ message: 'Loan created successfully!' }, { status: 201 });
  } catch (error) {
    console.error('Failed to create loan:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { message: 'A loan with this account number already exists.' },
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
