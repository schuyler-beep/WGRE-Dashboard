"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/signin" })}
      style={{
        background: "transparent",
        border: "1px solid rgba(255,255,255,0.25)",
        color: "#EAF0FA",
        borderRadius: "999px",
        padding: "5px 14px",
        fontSize: "12.5px",
        fontFamily: "'Inter', sans-serif",
        cursor: "pointer",
      }}
    >
      Sign out
    </button>
  );
}
