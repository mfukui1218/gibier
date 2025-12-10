// app/parts/layout.tsx
export default function PartsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "24px 16px 40px",
        color: "#fff",
      }}
    >
      <h1
        style={{
          fontSize: 28,
          fontWeight: 700,
          marginBottom: 20,
          paddingBottom: 8,
          borderBottom: "1px solid rgba(255,255,255,0.4)",
          textShadow: "0 2px 4px rgba(0,0,0,0.6)",
        }}
      >
        部位詳細
      </h1>

      <div>{children}</div>

      <footer
        style={{
          marginTop: 40,
          paddingTop: 16,
          fontSize: 12,
          color: "rgba(255,255,255,0.75)",
          borderTop: "1px solid rgba(255,255,255,0.3)",
          textAlign: "center",
          textShadow: "0 1px 3px rgba(0,0,0,0.7)",
        }}
      >
        狩猟ジビエ管理システム
      </footer>
    </div>
  );
}
