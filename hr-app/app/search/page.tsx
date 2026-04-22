'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);




export default function Search() {
  const [list, setList] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [nationality, setNationality] = useState('');

  useEffect(() => {
    getSupabase().from('employees').select('*').then(({ data }) => {
      setList(data || []);
      setFiltered(data || []);
    });
  }, []);

  const search = () => {
    let result = list;
    if (code) result = result.filter(e => e.employee_code?.toLowerCase().includes(code.toLowerCase()));
    if (name) result = result.filter(e => `${e.last_name} ${e.first_name}`.toLowerCase().includes(name.toLowerCase()));
    if (nationality) result = result.filter(e => e.nationality?.toLowerCase().includes(nationality.toLowerCase()));
    setFiltered(result);
  };

  const reset = () => { setCode(''); setName(''); setNationality(''); setFiltered(list); };
  const inputStyle = { width:'100%', padding:'8px', border:'1px solid #d1d5db', borderRadius:'6px', fontSize:'14px' };

  return (
    <div style={{ padding:'24px' }}>
      <h1 style={{ fontSize:'22px', fontWeight:'500', marginBottom:'20px' }}>社員検索</h1>
      <div style={{ background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:'8px', padding:'20px', marginBottom:'20px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'16px', marginBottom:'16px' }}>
          <div>
            <label style={{ display:'block', fontSize:'13px', marginBottom:'4px' }}>社員番号</label>
            <input value={code} onChange={e => setCode(e.target.value)} placeholder="例: EMP001" style={inputStyle} />
          </div>
          <div>
            <label style={{ display:'block', fontSize:'13px', marginBottom:'4px' }}>社員名</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="例: 田中" style={inputStyle} />
          </div>
          <div>
            <label style={{ display:'block', fontSize:'13px', marginBottom:'4px' }}>国籍</label>
            <input value={nationality} onChange={e => setNationality(e.target.value)} placeholder="例: 中国" style={inputStyle} />
          </div>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          <button onClick={search} style={{ padding:'8px 24px', background:'#1d4ed8', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'14px' }}>🔍 検索</button>
          <button onClick={reset} style={{ padding:'8px 16px', background:'#6b7280', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'14px' }}>リセット</button>
        </div>
      </div>
      <p style={{ fontSize:'13px', color:'#6b7280', marginBottom:'12px' }}>{filtered.length}件の結果</p>
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead>
          <tr style={{ background:'#f3f4f6' }}>
            <th style={{ padding:'10px', textAlign:'left', border:'1px solid #e5e7eb' }}>社員番号</th>
            <th style={{ padding:'10px', textAlign:'left', border:'1px solid #e5e7eb' }}>名前</th>
            <th style={{ padding:'10px', textAlign:'left', border:'1px solid #e5e7eb' }}>雇用形態</th>
            <th style={{ padding:'10px', textAlign:'left', border:'1px solid #e5e7eb' }}>国籍</th>
            <th style={{ padding:'10px', textAlign:'left', border:'1px solid #e5e7eb' }}>ビザ種別</th>
            <th style={{ padding:'10px', textAlign:'left', border:'1px solid #e5e7eb' }}>在留期限</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr><td colSpan={6} style={{ padding:'16px', textAlign:'center', color:'#6b7280' }}>該当する社員が見つかりません</td></tr>
          ) : filtered.map((e) => (
            <tr key={e.id}>
              <td style={{ padding:'10px', border:'1px solid #e5e7eb' }}>{e.employee_code}</td>
              <td style={{ padding:'10px', border:'1px solid #e5e7eb' }}>{e.last_name} {e.first_name}</td>
              <td style={{ padding:'10px', border:'1px solid #e5e7eb' }}>{e.employment_type === 'fulltime' ? '正社員' : 'アルバイト'}</td>
              <td style={{ padding:'10px', border:'1px solid #e5e7eb' }}>{e.nationality}</td>
              <td style={{ padding:'10px', border:'1px solid #e5e7eb' }}>{e.visa_type}</td>
              <td style={{ padding:'10px', border:'1px solid #e5e7eb' }}>{e.card_expiry}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
