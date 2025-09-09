// File: app/api/loans/route.js

import { NextResponse } from 'next/server';

import mysql from 'mysql2/promise';


const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: { "rejectUnauthorized": true }
};


export async function GET() {
  let connection;
  try {
    
    connection = await mysql.createConnection(dbConfig);

   
    const query = `
      SELECT 
        id,
        loan_account_number,
        modt,
        noi_receipt,
        noi_data_entry_page,
        noi_index2,
        created_at,
        status,
        modt_approval_status,
        noi_index2_approval_status,
        title_document_status,
        user_id
      FROM 
        loan_master 
      ORDER BY 
        created_at DESC;
    `;

  
    const [rows] = await connection.execute(query);

  
    await connection.end();


    return NextResponse.json(rows, { status: 200 });

  } catch (error) {
    console.error('DATABASE_ERROR:', error); 

  
    if (connection) {
      await connection.end();
    }

 
    return NextResponse.json(
      { message: "An error occurred while fetching loan data." },
      { status: 500 }
    );
  }
}
