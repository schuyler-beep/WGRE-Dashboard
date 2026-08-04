import { auth } from "@/auth";
import SignOutButton from "@/components/SignOutButton";
import DashboardClient from "@/components/DashboardClient";

export default async function HomePage() {
  // Middleware already guarantees we only get here with a valid,
  // allow-listed session — this just reads it to show the email.
  const session = await auth();

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: "12px",
          background: "#081527",
          padding: "8px 20px",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <span style={{ fontSize: "12.5px", color: "#8FA0BE" }}>
          Signed in as {session?.user?.email}
        </span>
        <SignOutButton />
      </div>
      <DashboardClient />
    </>
  );
}
