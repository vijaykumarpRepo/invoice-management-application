import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Allow access to login and register routes without authentication
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    return NextResponse.next();
  }

  // Redirect to login if no token is found (user is not logged in or session expired)
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("error", "sessionExpired"); // Optional: Pass error message
    return NextResponse.redirect(loginUrl);
  }

  // If token is valid, allow the request to continue
  return NextResponse.next();
}

// Apply middleware to all routes except public assets and Next.js internals
export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)", // Exclude public assets and internal paths
  ],
};
