'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function OcrResults() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sb.from('line_ocr_results')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setResults(data || []);
        setLoading(false);
      });
  }, []);

  const parseResult = (raw: string) => {
    try {
      const clean = raw.replace(/```json|```/g, '').trim();
      return JSON.parse(clean);
    } catch {
      return null;
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        📋 LINE OCR 読み取り結果
      </h1>
      {loading && <p>読み込み中...</p>}
      {!loading && results.length === 0 && (
        <p style={{ color: '#888' }}>まだデータがありません。LINEで写真を送ってください。</p>
      )}
      {results.map((r) => {
        const parsed = parseResult(r.raw_result);
        return (
          <div key={r.id} style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1rem',
            background: '#fff'
          }}>
            <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.5rem' }}>
              📅 {new Date(r.created_at).toLocaleString('ja-JP')} ／ LINE ID: {r.line_user_id}
            </div>
            {parsed ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {Object.entries(parsed).map(([key, value]) => (
                    <tr key={key} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '0.4rem 0.8rem', fontWeight: 'bold', color: '#555', width: '40%' }}>{key}</td>
                      <td style={{ padding: '0.4rem 0.8rem' }}>{String(value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <pre style={{ background: '#f5f5f5', padding: '0.5rem', borderRadius: '4px', fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
                {r.raw_result}
              </pre>
            )}
          </div>
        );
      })}
    </div>
  );
}
