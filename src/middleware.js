import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose'; 

export async function middleware(request) {
  const token = request.cookies.get('authToken')?.value;
  const { pathname } = request.nextUrl;

 
  if (token) {
    if (pathname.startsWith('/signin') || pathname.startsWith('/signup')) {
      return NextResponse.redirect(new URL('/verification', request.url));
    }
  }


  if (!token) {
    if (pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }
  }
  if (!token) {
    if (pathname.startsWith('/signup')) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }
  }


  try {
    if (token) {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
    }
  } catch (error) {

    const response = NextResponse.redirect(new URL('/signin', request.url));
    response.cookies.delete('authToken');
    return response;
  }

  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/signin', '/signup','/verification/:path*'],
};