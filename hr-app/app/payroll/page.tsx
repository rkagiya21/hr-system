'use client';
import{useEffect,useState}from 'react';
import{createClient}from '@supabase/supabase-js';
const sb=createClient('https://jmzrdwqcimzwfbifdgzz.supabase.co','sb_publishable_gSMXIGWlR5Ig4BJV9FVlsw_-mFmfc_n');
export default function Payroll(){
const[list,setList]=useState<any[]>([]);
const[load,setLoad]=useState(true);
const[sel,setSel]=useState<any>(null);
useEffect(()=>{sb.from('employees').select('*').then(({data})=>{setList((data||[]).map(e=>({...e,total_hours:e.employment_type==='fulltime'?160:120,overtime_hours:5,hourly_rate:1200,monthly_salary:300000})));setLoad(false);});},[]);
function calc(e:any){
const base=e.employment_type==='fulltime'?e.monthly_salary:e.hourly_rate*(e.total_hours-e.overtime_hours);
const ot=e.employment_type==='fulltime'?(e.monthly_salary/160)*1.25*e.overtime_hours:e.hourly_rate*1.25*e.overtime_hours;
const gross=base+ot;
const tax=e.employment_type==='fulltime'?Math.round(gross*0.05):0;
const ins=e.employment_type==='fulltime'?Math.round(gross*0.1):0;
return{base:Math.round(base),ot:Math.round(ot),gross:Math.round(gross),tax,ins,net:Math.round(gross-tax-ins)};}
if(load)return <div style={{padding:'2rem'}}>読み込み中...</div>;
return(
<div style={{minHeight:'100vh',background:'#f9fafb',padding:'2rem',fontFamily:'sans-serif'}}>
<div style={{maxWidth:'900px',margin:'0 auto'}}>
<p style={{color:'#6b7280',fontSize:'13px',margin:'0'}}>HRシステム v3.0</p>
<div style={{display:'flex',justifyContent:'space-between',alignItems:'center',margin:'4px 0 24px'}}>
<h1 style={{fontSize:'24px',fontWeight:'500',margin:'0'}}>給与計算</h1>
<a href="/" style={{padding:'8px 16px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'14px',textDecoration:'none',color:'#111827'}}>← 戻る</a>
</div>
<div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:'12px',overflow:'hidden',marginBottom:'16px'}}>
<div style={{display:'grid',gridTemplateColumns:'1fr 80px 80px 100px',padding:'10px 16px',background:'#f9fafb',borderBottom:'1px solid #e5e7eb',fontSize:'12px',color:'#6b7280'}}>
<span>氏名</span><span>勤務時間</span><span>残業</span><span>手取り額</span>
</div>
{list.map(e=>{
const c=calc(e);
return(
<div key={e.id} onClick={()=>setSel(sel?.id===e.id?null:e)} style={{display:'grid',gridTemplateColumns:'1fr 80px 80px 100px',padding:'12px 16px',borderBottom:'1px solid #f3f4f6',fontSize:'14px',alignItems:'center',cursor:'pointer',background:sel?.id===e.id?'#f0f9ff':'transparent'}}>
<div><p style={{margin:'0',fontWeight:'500'}}>{e.last_name} {e.first_name}</p><p style={{margin:'0',fontSize:'12px',color:'#6b7280'}}>{e.employment_type==='fulltime'?'正社員':'アルバイト'}</p></div>
<span>{e.total_hours}h</span>
<span style={{color:'#dc2626'}}>{e.overtime_hours}h</span>
<span style={{fontWeight:'500'}}>¥{c.net.toLocaleString()}</span>
</div>);
})}
</div>
{sel&&(()=>{
const c=calc(sel);
return(
<div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'24px'}}>
<div style={{display:'flex',justifyContent:'space-between',marginBottom:'16px'}}>
<h2 style={{fontSize:'18px',fontWeight:'500',margin:'0'}}>給与明細 - {sel.last_name} {sel.first_name}</h2>
<button onClick={()=>setSel(null)} style={{border:'none',background:'none',cursor:'pointer',color:'#6b7280',fontSize:'20px'}}>✕</button>
</div>
<table style={{width:'100%',fontSize:'14px',borderCollapse:'collapse'}}>
<tbody>
<tr style={{borderBottom:'1px solid #f3f4f6'}}><td style={{padding:'10px 0',color:'#6b7280'}}>基本給</td><td style={{textAlign:'right'}}>¥{c.base.toLocaleString()}</td></tr>
<tr style={{borderBottom:'1px solid #f3f4f6'}}><td style={{padding:'10px 0',color:'#6b7280'}}>残業代</td><td style={{textAlign:'right',color:'#dc2626'}}>¥{c.ot.toLocaleString()}</td></tr>
<tr style={{borderBottom:'1px solid #f3f4f6'}}><td style={{padding:'10px 0',fontWeight:'500'}}>総支給額</td><td style={{textAlign:'right',fontWeight:'500'}}>¥{c.gross.toLocaleString()}</td></tr>
{sel.employment_type==='fulltime'&&<tr style={{borderBottom:'1px solid #f3f4f6'}}><td style={{padding:'10px 0',color:'#6b7280'}}>所得税</td><td style={{textAlign:'right',color:'#dc2626'}}>-¥{c.tax.toLocaleString()}</td></tr>}
{sel.employment_type==='fulltime'&&<tr style={{borderBottom:'1px solid #f3f4f6'}}><td style={{padding:'10px 0',color:'#6b7280'}}>社会保険</td><td style={{textAlign:'right',color:'#dc2626'}}>-¥{c.ins.toLocaleString()}</td></tr>}
<tr><td style={{padding:'12px 0',fontWeight:'500',fontSize:'16px'}}>手取り額</td><td style={{textAlign:'right',fontWeight:'500',fontSize:'22px'}}>¥{c.net.toLocaleString()}</td></tr>
</tbody>
</table>
</div>);
})()}
</div>
</div>
);}