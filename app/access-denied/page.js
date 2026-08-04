export default function AccessDeniedPage() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', sans-serif",
        background: "#F3F4F7",
        color: "#16202E",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <p style={{ fontSize: "16px" }}>You don&apos;t have access.</p>
    </div>
  );
}
