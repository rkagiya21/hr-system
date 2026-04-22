'use client';
import { useEffect, useState } from 'react';


const sb = typeof window !== "undefined" ? require("@supabase/supabase-js").createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
) : null;
);

const expiryAlert = (d: string) => {
  if (!d) return null;
  const days = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
  if (days < 0) return { label: '期限切れ', color: '#fee2e2', text: '#dc2626' };
  if (days <= 90) return { label: `残${days}日`, color: '#fef9c3', text: '#d97706' };
  return null;
};

export default function Employees() {
  const [list, setList] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  const load = () => sb.from('employees').select('*').then(({ data }) => setList(data || []));
  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    await sb.from('employees').insert([form]);
    await load();
    setSaving(false);
    setShowForm(false);
    setForm({});
  };

  const exportCSV = () => {
    const headers = ['社員番号', '名前', '雇用形態', '国籍', 'ビザ種別', '在留期限'];
    const rows = list.map((e: any) => [
      e.employee_id, e.name, e.employment_type, e.nationality, e.visa_type, e.card_expiry
    ]);
    const csv = [headers, ...rows].map(r => r.map((v: any) => `"${v ?? ''}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '社員一覧.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const alerts = list.filter(e => expiryAlert(e.card_expiry));

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '500' }}>社員管理</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={exportCSV} style={{ padding: '8px 16px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
            📥 CSVエクスポート
          </button>
          <button onClick={() => setShowForm(!showForm)} style={{ padding: '8px 16px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>
            ＋ 社員追加
          </button>
        </div>
      </div>

      {alerts.length > 0 && (
        <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px' }}>
          <p style={{ fontWeight: '600', color: '#c2410c', marginBottom: '8px' }}>⚠️ 在留期限アラート ({alerts.length}件)</p>
          {alerts.map(e => {
            const a = expiryAlert(e.card_expiry)!;
            return (
              <div key={e.id} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ background: a.color, color: a.text, padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>{a.label}</span>
                <span>{e.name} — {e.card_expiry}</span>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            {[['employee_id','社員番号'],['name','名前'],['employment_type','雇用形態'],['nationality','国籍'],['visa_type','ビザ種別'],['card_expiry','在留期限'],['school_name','学校名']].map(([k,l]) => (
              <div key={k}>
                <label style={{ fontSize: '12px', color: '#6b7280' }}>{l}</label>
                <input type={k==='card_expiry'?'date':'text'} value={form[k]||''} onChange={e=>setForm({...form,[k]:e.target.value})}
                  style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '6px', padding: '8px', fontSize: '14px' }} />
              </div>
            ))}
          </div>
          <button onClick={save} disabled={saving} style={{ background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 20px', cursor: 'pointer' }}>
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f9fafb' }}>
            {['社員番号','名前','雇用形態','国籍','ビザ種別','在留期限','状態'].map(h => (
              <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {list.map(e => {
            const a = expiryAlert(e.card_expiry);
            return (
              <tr key={e.id} style={{ background: a ? a.color : 'white', borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px 16px', fontSize: '14px' }}>{e.employee_id}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px' }}>{e.name}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px' }}>{e.employment_type}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px' }}>{e.nationality}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px' }}>{e.visa_type}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px' }}>{e.card_expiry}</td>
                <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                  {a ? <span style={{ background: a.color, color: a.text, padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>{a.label}</span>
                     : <span style={{ color: '#16a34a', fontSize: '13px' }}>✅ 有効</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
