'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div style={{
      padding: '40px 20px',
      maxWidth: '600px',
      margin: '0 auto',
      backgroundColor: 'rgba(255,255,255,0.9)',
      borderRadius: '8px',
      color: '#000'
    }}>
      <h2 style={{ color: '#dc2626', marginBottom: '16px' }}>
        エラーが発生しました
      </h2>

      <div style={{
        padding: '16px',
        backgroundColor: '#fee',
        borderRadius: '4px',
        marginBottom: '16px',
        fontFamily: 'monospace',
        fontSize: '14px',
        wordBreak: 'break-word'
      }}>
        <strong>エラー内容:</strong>
        <pre style={{ margin: '8px 0 0 0', whiteSpace: 'pre-wrap' }}>
          {error.message}
        </pre>
        {error.stack && (
          <details style={{ marginTop: '8px' }}>
            <summary style={{ cursor: 'pointer' }}>スタックトレース</summary>
            <pre style={{
              margin: '8px 0 0 0',
              fontSize: '12px',
              whiteSpace: 'pre-wrap',
              overflow: 'auto'
            }}>
              {error.stack}
            </pre>
          </details>
        )}
      </div>

      <button
        onClick={() => reset()}
        style={{
          padding: '12px 24px',
          backgroundColor: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        再試行
      </button>

      <div style={{ marginTop: '24px', fontSize: '14px', color: '#666' }}>
        <p>この問題が解決しない場合：</p>
        <ul>
          <li>ブラウザのキャッシュをクリア</li>
          <li>環境変数が正しく設定されているか確認</li>
          <li>Firebase の承認済みドメインを確認</li>
        </ul>
      </div>
    </div>
  );
}
