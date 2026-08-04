import { auth } from "@/auth";
import { NextResponse } from "next/server";

// This runs on Vercel's servers BEFORE the dashboard page is ever sent to
// a browser. If there is no signed-in session, the request is redirected
// to /signin server-side — the dashboard's HTML is never generated or
// transmitted to an unauthenticated visitor.
//
// (Next.js 16 renamed this file convention from "middleware.js" to
// "proxy.js" — same job, new name. If you ever see a leftover
// middleware.js file in this project, delete it: Next.js will silently
// stop running the old one and this file is the one that matters.)
export default auth((req) => {
  if (!req.auth) {
    const signInUrl = new URL("/signin", req.url);
    return NextResponse.redirect(signInUrl);
  }
  return NextResponse.next();
});

// Only the dashboard itself ("/") is gated. The sign-in page, the
// access-denied page, and next-auth's own API routes must stay reachable
// or no one (including allowed users) could ever sign in.
export const config = {
  matcher: ["/"],
};
