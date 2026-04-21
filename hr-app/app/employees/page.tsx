'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const sb = createClient('https://jmzrdwqcimzwfbifdgzz.supabase.co','sb_publishable_gSMXIGWlR5Ig4BJV9FVlsw_-mFmfc_n');
const empTypeLabel = (t: string) => t === 'fulltime' ? '正社員' : 'アルバイト';

const expiryAlert = (date: string) => {
  if (!date) return null;
  const today = new Date();
  const expiry = new Date(date);
  const days = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 0) return { label: '期限切れ', color: '#fee2e2', text: '#dc2626' };
  if (days <= 90) return { label: `残${days}日`, color: '#fef9c3', text: '#d97706' };
  return null;
};

export default function Employees() {
  const [list, setList] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ employee_code:'', last_name:'', first_name:'', employment_type:'part-time', nationality:'', visa_type:'', card_expiry:'' });
  const [saving, setSaving] = useState(false);

  const load = () => sb.from('employees').select('*').then(({ data }) => setList(data || []));
  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    await sb.from('employees').insert([form]);
    await load();
    setShowForm(false);
    setForm({ employee_code:'', last_name:'', first_name:'', employment_type:'part-time', nationality:'', visa_type:'', card_expiry:'' });
    setSaving(false);
  };

  const input = (label: string, key: string, type='text') => (
    <div style={{ marginBottom:'12px' }}>
      <label style={{ display:'block', fontSize:'13px', marginBottom:'4px', color:'#374151' }}>{label}</label>
      <input type={type} value={form[key as keyof typeof form]} onChange={e => setForm({...form, [key]: e.target.value})}
        style={{ width:'100%', padding:'8px', border:'1px solid #d1d5db', borderRadius:'6px', fontSize:'14px' }} />
    </div>
  );

  const alerts = list.filter(e => expiryAlert(e.card_expiry));


  const exportCSV = () => {
    const headers = ['社員番号', '名前', '雇用形態', '国籍', 'ビザ種別', '在留期限'];
    const rows = list.map((e: any) => [
      e.employee_id, e.name, e.employment_type, e.nationality, e.visa_type, e.card_expiry
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const bom = '\uFEFF';
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '社員一覧.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding:'24px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
        <h1 style={{ fontSize:'22px', fontWeight:'500' }}>社員管理</h1>
        <button onClick={exportCSV} style={{background:'#16a34a',color:'white',border:'none',borderRadius:'8px',padding:'10px 20px',cursor:'pointer',fontWeight:'600',fontSize:'14px'}}>📥 CSVエクスポート</button>
      </div>
      </div>
        <button onClick={() => setShowForm(!showForm)} style={{ padding:'8px 16px', background:'#1d4ed8', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'14px' }}>
          ＋ 社員追加
        </button>
      </div>

      {alerts.length > 0 && (
        <div style={{ background:'#fff7ed', border:'1px solid #fed7aa', borderRadius:'8px', padding:'12px 16px', marginBottom:'20px' }}>
          <p style={{ fontWeight:'600', color:'#c2410c', marginBottom:'8px' }}>⚠️ 在留期限アラート ({alerts.length}件)</p>
          {alerts.map(e => {
            const a = expiryAlert(e.card_expiry)!;
            return (
              <div key={e.id} style={{ display:'flex', gap:'8px', alignItems:'center', marginBottom:'4px' }}>
                <span style={{ background: a.color, color: a.text, padding:'2px 8px', borderRadius:'4px', fontSize:'12px', fontWeight:'600' }}>{a.label}</span>
                <span style={{ fontSize:'14px' }}>{e.last_name} {e.first_name} — {e.card_expiry}</span>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div style={{ background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:'8px', padding:'20px', marginBottom:'20px' }}>
          <h2 style={{ fontSize:'16px', fontWeight:'500', marginBottom:'16px' }}>新規社員登録</h2>
          {input('社員番号', 'employee_code')}
          {input('姓', 'last_name')}
          {input('名', 'first_name')}
          <div style={{ marginBottom:'12px' }}>
            <label style={{ display:'block', fontSize:'13px', marginBottom:'4px', color:'#374151' }}>雇用形態</label>
            <select value={form.employment_type} onChange={e => setForm({...form, employment_type: e.target.value})}
              style={{ width:'100%', padding:'8px', border:'1px solid #d1d5db', borderRadius:'6px', fontSize:'14px' }}>
              <option value="part-time">アルバイト</option>
              <option value="fulltime">正社員</option>
            </select>
          </div>
          {input('国籍', 'nationality')}
          {input('ビザ種別', 'visa_type')}
          {input('在留期限', 'card_expiry', 'date')}
          <div style={{ display:'flex', gap:'8px' }}>
            <button onClick={save} disabled={saving} style={{ padding:'8px 20px', background:'#16a34a', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'14px' }}>
              {saving ? '保存中...' : '保存'}
            </button>
            <button onClick={() => setShowForm(false)} style={{ padding:'8px 20px', background:'#6b7280', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'14px' }}>
              キャンセル
            </button>
          </div>
        </div>
      )}

      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead>
          <tr style={{ background:'#f3f4f6' }}>
            <th style={{ padding:'8px', textAlign:'left', border:'1px solid #e5e7eb' }}>社員番号</th>
            <th style={{ padding:'8px', textAlign:'left', border:'1px solid #e5e7eb' }}>名前</th>
            <th style={{ padding:'8px', textAlign:'left', border:'1px solid #e5e7eb' }}>雇用形態</th>
            <th style={{ padding:'8px', textAlign:'left', border:'1px solid #e5e7eb' }}>国籍</th>
            <th style={{ padding:'8px', textAlign:'left', border:'1px solid #e5e7eb' }}>ビザ種別</th>
            <th style={{ padding:'8px', textAlign:'left', border:'1px solid #e5e7eb' }}>在留期限</th>
            <th style={{ padding:'8px', textAlign:'left', border:'1px solid #e5e7eb' }}>状態</th>
          </tr>
        </thead>
        <tbody>
          {list.map((e) => {
            const a = expiryAlert(e.card_expiry);
            return (
              <tr key={e.id} style={{ background: a ? a.color : 'white' }}>
                <td style={{ padding:'8px', border:'1px solid #e5e7eb' }}>{e.employee_code}</td>
                <td style={{ padding:'8px', border:'1px solid #e5e7eb' }}>{e.last_name} {e.first_name}</td>
                <td style={{ padding:'8px', border:'1px solid #e5e7eb' }}>{empTypeLabel(e.employment_type)}</td>
                <td style={{ padding:'8px', border:'1px solid #e5e7eb' }}>{e.nationality}</td>
                <td style={{ padding:'8px', border:'1px solid #e5e7eb' }}>{e.visa_type}</td>
                <td style={{ padding:'8px', border:'1px solid #e5e7eb' }}>{e.card_expiry}</td>
                <td style={{ padding:'8px', border:'1px solid #e5e7eb' }}>
                  {a ? <span style={{ background: a.color, color: a.text, padding:'2px 8px', borderRadius:'4px', fontSize:'12px', fontWeight:'600' }}>{a.label}</span> : <span style={{ color:'#16a34a', fontSize:'12px' }}>✅ 有効</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
