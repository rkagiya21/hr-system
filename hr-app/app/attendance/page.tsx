'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const sb = createClient('https://jmzrdwqcimzwfbifdgzz.supabase.co','sb_publishable_gSMXIGWlR5Ig4BJV9FVlsw_-mFmfc_n');

export default function Attendance() {
  const [image, setImage] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<string>('image/jpeg');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [saved, setSaved] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
    setResults([]);
    setSaved(false);
  };

  const analyze = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const base64 = image.split(',')[1];
      const res = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, mediaType })
      });
      const data = await res.json();
      const text = data.content[0].text.trim();
      const json = JSON.parse(text.replace(/```json|```/g, '').trim());
      setResults(Array.isArray(json) ? json : [json]);
    } catch (e) {
      alert('読み取りに失敗しました。もう一度お試しください。');
    }
    setLoading(false);
  };

  const saveToSupabase = async () => {
    const { data: empList } = await sb.from('employees').select('id, last_name, first_name');
    for (const r of results) {
      const emp = (empList || []).find((e: any) =>
        `${e.last_name} ${e.first_name}`.includes(r.name) ||
        r.name.includes(e.last_name) ||
        r.name.includes(e.first_name)
      );
      if (emp) {
        await sb.from('attendance').insert({
          employee_id: emp.id,
          work_date: r.date,
          clock_in: r.clock_in,
          clock_out: r.clock_out,
          notes: 'OCR読み取り'
        });
      }
    }
    setSaved(true);
  };

  return (
    <div style={{ padding:'24px', maxWidth:'800px' }}>
      <p style={{ color:'#6b7280', fontSize:'13px', margin:'0' }}>HRシステム v3.0</p>
      <h1 style={{ fontSize:'22px', fontWeight:'500', margin:'4px 0 20px' }}>勤怠OCR読み取り</h1>

      <div style={{ border:'2px dashed #d1d5db', borderRadius:'12px', padding:'40px', textAlign:'center', marginBottom:'20px', background:'#fafafa' }}>
        {image ? (
          <img src={image} alt="preview" style={{ maxWidth:'100%', maxHeight:'300px', borderRadius:'8px' }} />
        ) : (
          <>
            <div style={{ fontSize:'40px', marginBottom:'12px' }}>📋</div>
            <p style={{ color:'#6b7280', marginBottom:'4px' }}>タイムカード・勤怠表の写真をアップロード</p>
            <p style={{ color:'#9ca3af', fontSize:'12px', marginBottom:'16px' }}>手書き・印刷どちらも対応</p>
          </>
        )}
        <label style={{ padding:'10px 20px', background:'#1d4ed8', color:'#fff', borderRadius:'6px', cursor:'pointer', fontSize:'14px' }}>
          📷 写真を選択
          <input type="file" accept="image/*" onChange={handleFile} style={{ display:'none' }} />
        </label>
      </div>

      {image && !results.length && (
        <button onClick={analyze} disabled={loading}
          style={{ width:'100%', padding:'14px', background:'#111827', color:'#fff', border:'none', borderRadius:'8px', fontSize:'15px', cursor:'pointer', marginBottom:'20px' }}>
          {loading ? '🔍 読み取り中...' : '🤖 Claudeに読み取らせる'}
        </button>
      )}

      {results.length > 0 && (
        <div style={{ border:'1px solid #d1fae5', borderRadius:'8px', padding:'16px', background:'#f0fdf4' }}>
          <p style={{ color:'#16a34a', fontWeight:'600', marginBottom:'12px' }}>✅ 読み取り完了！ {results.length}件のデータを検出</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 100px 80px 80px 100px', gap:'0', marginBottom:'8px', fontWeight:'600', fontSize:'13px', color:'#374151', borderBottom:'2px solid #d1fae5', paddingBottom:'8px' }}>
            <span>氏名</span><span>日付</span><span>出勤</span><span>退勤</span><span>勤務時間</span>
          </div>
          {results.map((r, i) => (
            <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 100px 80px 80px 100px', padding:'10px 0', borderBottom:'1px solid #d1fae5', fontSize:'14px' }}>
              <span style={{ fontWeight:'500' }}>{r.name}</span>
              <span>{r.date}</span>
              <span>{r.clock_in}</span>
              <span>{r.clock_out}</span>
              <span>{r.total_hours}h {r.overtime > 0 && <span style={{ color:'#dc2626', fontSize:'12px' }}>+{r.overtime}h残業</span>}</span>
            </div>
          ))}
          <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end', marginTop:'16px' }}>
            <button onClick={() => { setResults([]); setImage(null); }}
              style={{ padding:'8px 16px', border:'1px solid #e5e7eb', borderRadius:'6px', fontSize:'14px', cursor:'pointer', background:'#fff' }}>
              戻る
            </button>
            {saved ? (
              <span style={{ padding:'8px 16px', background:'#dcfce7', color:'#16a34a', borderRadius:'6px', fontSize:'14px' }}>✅ 保存済み</span>
            ) : (
              <button onClick={saveToSupabase}
                style={{ padding:'8px 24px', background:'#111827', color:'#fff', border:'none', borderRadius:'6px', fontSize:'14px', cursor:'pointer' }}>
                Supabaseに保存
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
