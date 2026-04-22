'use client';
import { useState } from 'react';

export default function Attendance() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const resizeImage = (dataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 1024;
        let w = img.width, h = img.height;
        if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
        if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.7).split(',')[1]);
      };
      img.src = dataUrl;
    });
  };

  const handleOCR = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const base64 = await resizeImage(image);
      const res = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, mediaType: 'image/jpeg' })
      });
      const data = await res.json();
      if (!data.content?.[0]?.text) throw new Error(JSON.stringify(data));
      const text = data.content[0].text.trim();
      const clean = text.replace(/```json|```/g, '').trim();
      const json = JSON.parse(clean);
      setResults(Array.isArray(json) ? json : [json]);
    } catch (e: any) {
      alert('読み取りに失敗しました: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>勤怠OCR読み取り</h1>
      <div style={{ border: '2px dashed #ccc', borderRadius: '12px', padding: '2rem', textAlign: 'center', marginBottom: '1rem' }}>
        {image && <img src={image} alt="preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', marginBottom: '1rem' }} />}
        <br />
        <label style={{ background: '#3b82f6', color: '#fff', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>
          📷 写真を選択
          <input type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
        </label>
      </div>
      {image && !loading && (
        <button onClick={handleOCR} style={{ background: '#10b981', color: '#fff', padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', width: '100%', fontSize: '1rem' }}>
          🔍 読み取り開始
        </button>
      )}
      {loading && <div style={{ background: '#1e293b', color: '#fff', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>⏳ 読み取り中...</div>}
      {results.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>✅ 読み取り結果</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                {Object.keys(results[0]).map(k => <th key={k} style={{ padding: '8px', border: '1px solid #e2e8f0', textAlign: 'left' }}>{k}</th>)}
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i}>
                  {Object.values(r).map((v: any, j) => <td key={j} style={{ padding: '8px', border: '1px solid #e2e8f0' }}>{String(v)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
