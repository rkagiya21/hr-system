'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);




const calcPayroll = (emp: any) => {
  const isFulltime = emp.employment_type === 'fulltime';
  const totalHours = 120;
  const overtimeHours = 5;
  if (isFulltime) {
    const monthlySalary = 250000;
    const overtimePay = Math.round((monthlySalary / 160) * 1.25 * overtimeHours);
    const grossSalary = monthlySalary + overtimePay;
    const incomeTax = Math.round(grossSalary * 0.05);
    const socialInsurance = Math.round(grossSalary * 0.1);
    const netSalary = grossSalary - incomeTax - socialInsurance;
    return { totalHours, overtimeHours, monthlySalary, overtimePay, grossSalary, incomeTax, socialInsurance, netSalary, isFulltime };
  } else {
    const hourlyRate = 1200;
    const basePay = hourlyRate * totalHours;
    const overtimePay = Math.round(hourlyRate * 1.25 * overtimeHours);
    const netSalary = basePay + overtimePay;
    return { totalHours, overtimeHours, hourlyRate, basePay, overtimePay, netSalary, isFulltime };
  }
};

const printPayslip = (emp: any) => {
  const p = calcPayroll(emp);
  const name = `${emp.last_name} ${emp.first_name}`;
  const today = new Date().toLocaleDateString('ja-JP');
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(`
    <html><head><meta charset="UTF-8"><title>給与明細</title>
    <style>
      body { font-family: 'Meiryo', 'Yu Gothic', sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; }
      h1 { text-align: center; font-size: 22px; border-bottom: 2px solid #000; padding-bottom: 10px; }
      .info { margin: 20px 0; }
      .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #eee; }
      .section { margin: 20px 0; font-weight: bold; font-size: 16px; background: #f3f4f6; padding: 6px 10px; }
      .total { display: flex; justify-content: space-between; padding: 12px 0; font-size: 18px; font-weight: bold; border-top: 2px solid #000; margin-top: 10px; }
      @media print { button { display: none; } }
    </style></head><body>
    <h1>給与明細書</h1>
    <div class="info">
      <div class="row"><span>発行日</span><span>${today}</span></div>
      <div class="row"><span>社員番号</span><span>${emp.employee_code}</span></div>
      <div class="row"><span>氏名</span><span>${name}</span></div>
      <div class="row"><span>雇用形態</span><span>${p.isFulltime ? '正社員' : 'アルバイト'}</span></div>
    </div>
    <div class="section">勤務情報</div>
    <div class="row"><span>勤務時間</span><span>${p.totalHours}h</span></div>
    <div class="row"><span>残業時間</span><span>${p.overtimeHours}h</span></div>
    <div class="section">給与明細</div>
    ${p.isFulltime ? `
      <div class="row"><span>基本給</span><span>¥${p.monthlySalary?.toLocaleString()}</span></div>
      <div class="row"><span>残業代</span><span>¥${p.overtimePay?.toLocaleString()}</span></div>
      <div class="row"><span>総支給額</span><span>¥${p.grossSalary?.toLocaleString()}</span></div>
      <div class="section">控除</div>
      <div class="row"><span>所得税</span><span>-¥${p.incomeTax?.toLocaleString()}</span></div>
      <div class="row"><span>社会保険</span><span>-¥${p.socialInsurance?.toLocaleString()}</span></div>
    ` : `
      <div class="row"><span>時給（暫定）</span><span>¥${p.hourlyRate?.toLocaleString()}</span></div>
      <div class="row"><span>基本給</span><span>¥${p.basePay?.toLocaleString()}</span></div>
      <div class="row"><span>残業代</span><span>¥${p.overtimePay?.toLocaleString()}</span></div>
    `}
    <div class="total"><span>手取り額</span><span>¥${p.netSalary?.toLocaleString()}</span></div>
    <br><button onclick="window.print()" style="padding:10px 20px;background:#1d4ed8;color:white;border:none;border-radius:6px;cursor:pointer;font-size:14px;">🖨️ 印刷・PDF保存</button>
    </body></html>
  `);
  win.document.close();
};

export default function Payroll() {
  const [list, setList] = useState<any[]>([]);
  useEffect(() => { getSupabase().from('employees').select('*').then(({ data }) => setList(data || [])); }, []);

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
        <div>
          <p style={{ color:'#6b7280', fontSize:'13px', margin:'0' }}>HRシステム v3.0</p>
          <h1 style={{ fontSize:'22px', fontWeight:'500', margin:'4px 0 0' }}>給与計算</h1>
        </div>
        <a href="/" style={{ padding:'8px 16px', border:'1px solid #e5e7eb', borderRadius:'6px', fontSize:'14px', textDecoration:'none', color:'#374151' }}>← 戻る</a>
      </div>
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead>
          <tr style={{ background:'#f3f4f6' }}>
            <th style={{ padding:'12px', textAlign:'left', border:'1px solid #e5e7eb' }}>氏名</th>
            <th style={{ padding:'12px', textAlign:'left', border:'1px solid #e5e7eb' }}>勤務時間</th>
            <th style={{ padding:'12px', textAlign:'left', border:'1px solid #e5e7eb' }}>残業</th>
            <th style={{ padding:'12px', textAlign:'left', border:'1px solid #e5e7eb' }}>手取り額</th>
            <th style={{ padding:'12px', textAlign:'left', border:'1px solid #e5e7eb' }}>PDF</th>
          </tr>
        </thead>
        <tbody>
          {list.map((emp) => {
            const p = calcPayroll(emp);
            return (
              <tr key={emp.id}>
                <td style={{ padding:'12px', border:'1px solid #e5e7eb' }}>
                  <div>{emp.last_name} {emp.first_name}</div>
                  <div style={{ fontSize:'12px', color:'#6b7280' }}>{p.isFulltime ? '正社員' : 'アルバイト'}</div>
                </td>
                <td style={{ padding:'12px', border:'1px solid #e5e7eb' }}>{p.totalHours}h</td>
                <td style={{ padding:'12px', border:'1px solid #e5e7eb', color:'#ef4444' }}>{p.overtimeHours}h</td>
                <td style={{ padding:'12px', border:'1px solid #e5e7eb' }}>¥{p.netSalary?.toLocaleString()}</td>
                <td style={{ padding:'12px', border:'1px solid #e5e7eb' }}>
                  <button onClick={() => printPayslip(emp)}
                    style={{ padding:'6px 12px', background:'#1d4ed8', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'13px' }}>
                    📄 PDF出力
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
