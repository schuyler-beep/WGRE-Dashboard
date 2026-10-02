import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/* ======================================================================
 * GUEST LIST — edit this and only this to control who can sign in.
 * Add or remove email addresses below. Use the exact Google account
 * email address for each person. Lowercase doesn't matter — everything
 * is compared in lowercase automatically.
 * ==================================================================== */
export const ALLOWED_EMAILS = [
  "schuyler@wgrouprealestate.com",
];
/* ==================================================================== */

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],

  // JWT sessions: no database required. The session is stored in an
  // encrypted cookie, signed with AUTH_SECRET.
  session: { strategy: "jwt" },

  pages: {
    signIn: "/signin",
    error: "/access-denied",
  },

  callbacks: {
    // Runs on the server every time someone finishes signing in with
    // Google, before a session is ever created. Returning false rejects
    // the sign-in entirely and next-auth redirects to the `error` page
    // above (/access-denied) — no session/cookie is issued.
    async signIn({ user }) {
      const email = (user?.email || "").toLowerCase();
      return ALLOWED_EMAILS.includes(email);
    },
  },
});
