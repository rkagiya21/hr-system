'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const sb = createClient('https://jmzrdwqcimzwfbifdgzz.supabase.co','sb_publishable_gSMXIGWlR5Ig4BJV9FVlsw_-mFmfc_n');

export default function Shifts() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ employee_id:'', シフト日:'', 開始時間:'', 終了時間:'' });

  const load = async () => {
    const { data: emps } = await sb.from('employees').select('id, last_name, first_name');
    const { data: sh } = await sb.from('shifts').select('*, employees(last_name, first_name)').order('シフト日', { ascending: true });
    setEmployees(emps || []);
    setShifts(sh || []);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    await sb.from('shifts').insert([{ ...form, ステータス: '未確定' }]);
    await load();
    setShowForm(false);
    setForm({ employee_id:'', シフト日:'', 開始時間:'', 終了時間:'' });
    setSaving(false);
  };

  return (
    <div style={{ padding:'24px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
        <h1 style={{ fontSize:'22px', fontWeight:'500' }}>シフト管理</h1>
        <button onClick={() => setShowForm(!showForm)} style={{ padding:'8px 16px', background:'#1d4ed8', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'14px' }}>
          ＋ シフト追加
        </button>
      </div>

      {showForm && (
        <div style={{ background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:'8px', padding:'20px', marginBottom:'20px' }}>
          <h2 style={{ fontSize:'16px', fontWeight:'500', marginBottom:'16px' }}>新規シフト登録</h2>
          <div style={{ marginBottom:'12px' }}>
            <label style={{ display:'block', fontSize:'13px', marginBottom:'4px' }}>社員</label>
            <select value={form.employee_id} onChange={e => setForm({...form, employee_id: e.target.value})}
              style={{ width:'100%', padding:'8px', border:'1px solid #d1d5db', borderRadius:'6px', fontSize:'14px' }}>
              <option value="">選択してください</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.last_name} {e.first_name}</option>)}
            </select>
          </div>
          <div style={{ marginBottom:'12px' }}>
            <label style={{ display:'block', fontSize:'13px', marginBottom:'4px' }}>シフト日</label>
            <input type="date" value={form.シフト日} onChange={e => setForm({...form, シフト日: e.target.value})}
              style={{ width:'100%', padding:'8px', border:'1px solid #d1d5db', borderRadius:'6px', fontSize:'14px' }} />
          </div>
          <div style={{ marginBottom:'12px' }}>
            <label style={{ display:'block', fontSize:'13px', marginBottom:'4px' }}>開始時間</label>
            <input type="time" value={form.開始時間} onChange={e => setForm({...form, 開始時間: e.target.value})}
              style={{ width:'100%', padding:'8px', border:'1px solid #d1d5db', borderRadius:'6px', fontSize:'14px' }} />
          </div>
          <div style={{ marginBottom:'12px' }}>
            <label style={{ display:'block', fontSize:'13px', marginBottom:'4px' }}>終了時間</label>
            <input type="time" value={form.終了時間} onChange={e => setForm({...form, 終了時間: e.target.value})}
              style={{ width:'100%', padding:'8px', border:'1px solid #d1d5db', borderRadius:'6px', fontSize:'14px' }} />
          </div>
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
            <th style={{ padding:'8px', textAlign:'left', border:'1px solid #e5e7eb' }}>日付</th>
            <th style={{ padding:'8px', textAlign:'left', border:'1px solid #e5e7eb' }}>社員名</th>
            <th style={{ padding:'8px', textAlign:'left', border:'1px solid #e5e7eb' }}>開始</th>
            <th style={{ padding:'8px', textAlign:'left', border:'1px solid #e5e7eb' }}>終了</th>
            <th style={{ padding:'8px', textAlign:'left', border:'1px solid #e5e7eb' }}>ステータス</th>
          </tr>
        </thead>
        <tbody>
          {shifts.length === 0 ? (
            <tr><td colSpan={5} style={{ padding:'16px', textAlign:'center', color:'#6b7280' }}>シフトがありません</td></tr>
          ) : shifts.map((s) => (
            <tr key={s.id}>
              <td style={{ padding:'8px', border:'1px solid #e5e7eb' }}>{s.シフト日}</td>
              <td style={{ padding:'8px', border:'1px solid #e5e7eb' }}>{s.employees?.last_name} {s.employees?.first_name}</td>
              <td style={{ padding:'8px', border:'1px solid #e5e7eb' }}>{s.開始時間}</td>
              <td style={{ padding:'8px', border:'1px solid #e5e7eb' }}>{s.終了時間}</td>
              <td style={{ padding:'8px', border:'1px solid #e5e7eb' }}>
                <span style={{ padding:'2px 8px', borderRadius:'4px', fontSize:'12px', fontWeight:'600',
                  background: s.ステータス === '確定' ? '#dcfce7' : '#fef9c3',
                  color: s.ステータス === '確定' ? '#16a34a' : '#d97706' }}>
                  {s.ステータス}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
