"use client";

export default function RedirectPage() {
  return (
    <main style={{ padding: 24 }}>
      <h2>外部ブラウザで開いてください</h2>

      <p>
        LINEアプリ内ブラウザではログインが正常に動作しません。
        <br />
		※ LINE内ブラウザではログインできません
		右下の「︙」→「ブラウザで開く」を選んでください。
		<br />
		その後、”アカウントを作る”で開いてください
      </p>

      <a
  		href="https://gibier-pad8.vercel.app"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-block",
          marginTop: 16,
          padding: "12px 16px",
          background: "#06c755",
          color: "#fff",
          borderRadius: 8,
          textDecoration: "none",
        }}
      >
		アカウントを作る
      </a>
    </main>
  );
}
