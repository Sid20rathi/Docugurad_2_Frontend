import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export const runtime = 'nodejs';


export async function DELETE(request, { params }) {
  const { id } = params; 

  if (!id) {
    return NextResponse.json({ message: 'User ID is required.' }, { status: 400 });
  }
  console.log("the id id", id);

  let connection;
  console.log("the 1");
  try {
   
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      ssl: { rejectUnauthorized: false }
    });
    console.log("the 2");

   
    await connection.beginTransaction();
    console.log("the 3");

 
    const deleteLoansQuery = 'DELETE FROM loan_master WHERE user_id = ?';
    const [loanResult] = await connection.execute(deleteLoansQuery, [id]);
    console.log(`Deleted ${loanResult.affectedRows} loan records for user ID ${id}.`);
    console.log("the 4");

    const deleteUserQuery = 'DELETE FROM users WHERE id = ?';
    const [userResult] = await connection.execute(deleteUserQuery, [id]);
    console.log("the 5");

  
    if (userResult.affectedRows === 0) {
      console.log("the 6");
  
      await connection.rollback();
      console.log("the 7");
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
      
    }
    console.log("the 8");


  
    await connection.commit();
    console.log("the 9");

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
