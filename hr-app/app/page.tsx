'use client';
import{useEffect,useState}from 'react';
import{createClient}from '@supabase/supabase-js';
const sb=createClient('https://jmzrdwqcimzwfbifdgzz.supabase.co','sb_publishable_gSMXIGWlR5Ig4BJV9FVlsw_-mFmfc_n');
export default function Portal(){
const[emp,setEmp]=useState<any>(null);
const[list,setList]=useState<any[]>([]);
useEffect(()=>{sb.from('employees').select('*').then(({data})=>setList(data||[]));},[]);
if(!emp)return(
<div style={{minHeight:'100vh',background:'#f9fafb',padding:'2rem',fontFamily:'sans-serif',display:'flex',alignItems:'center',justifyContent:'center'}}>
<div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:'16px',padding:'2rem',width:'100%',maxWidth:'400px'}}>
<p style={{color:'#6b7280',fontSize:'13px',margin:'0'}}>HRシステム v3.0</p>
<h1 style={{fontSize:'22px',fontWeight:'500',margin:'4px 0 24px'}}>スタッフポータル</h1>
<p style={{fontSize:'14px',color:'#6b7280',margin:'0 0 8px'}}>社員を選択してください</p>
<select onChange={e=>{const found=list.find(x=>x.id===e.target.value);setEmp(found||null);}} style={{width:'100%',padding:'10px 12px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'14px',marginBottom:'16px'}}>
<option value="">-- 選択 --</option>
{list.map(e=><option key={e.id} value={e.id}>{e.last_name} {e.first_name}</option>)}
</select>
</div>
</div>);
return(
<div style={{minHeight:'100vh',background:'#f9fafb',padding:'2rem',fontFamily:'sans-serif'}}>
<div style={{maxWidth:'700px',margin:'0 auto'}}>
<div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
<div>
<p style={{color:'#6b7280',fontSize:'13px',margin:'0'}}>HRシステム v3.0</p>
<h1 style={{fontSize:'22px',fontWeight:'500',margin:'4px 0 0'}}>スタッフポータル</h1>
</div>
<button onClick={()=>setEmp(null)} style={{padding:'8px 16px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'14px',background:'#fff',cursor:'pointer'}}>ログアウト</button>
</div>
<div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'20px',marginBottom:'16px',display:'flex',alignItems:'center',gap:'16px'}}>
<div style={{width:'48px',height:'48px',borderRadius:'50%',background:'#eff6ff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',fontWeight:'500',color:'#1d4ed8'}}>{emp.last_name?.[0]}</div>
<div>
<p style={{margin:'0',fontWeight:'500',fontSize:'16px'}}>{emp.last_name} {emp.first_name}</p>
<p style={{margin:'4px 0 0',fontSize:'13px',color:'#6b7280'}}>{emp.employee_code} · {emp.employment_type==='fulltime'?'正社員':'アルバイト'}</p>
</div>
</div>
<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'16px'}}>
<div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'16px'}}>
<p style={{margin:'0 0 4px',fontSize:'12px',color:'#6b7280'}}>国籍</p>
<p style={{margin:'0',fontWeight:'500'}}>{emp.nationality||'-'}</p>
</div>
<div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'16px'}}>
<p style={{margin:'0 0 4px',fontSize:'12px',color:'#6b7280'}}>ビザ種別</p>
<p style={{margin:'0',fontWeight:'500'}}>{emp.visa_type||'-'}</p>
</div>
<div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'16px'}}>
<p style={{margin:'0 0 4px',fontSize:'12px',color:'#6b7280'}}>在留期限</p>
<p style={{margin:'0',fontWeight:'500',color:'#dc2626'}}>{emp.card_expiry||'-'}</p>
</div>
<div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'16px'}}>
<p style={{margin:'0 0 4px',fontSize:'12px',color:'#6b7280'}}>学校名</p>
<p style={{margin:'0',fontWeight:'500'}}>{emp.school_name||'-'}</p>
</div>
</div>
<div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'12px'}}>
<a href="/" style={{background:'#111827',color:'#fff',borderRadius:'12px',padding:'16px',textAlign:'center',textDecoration:'none'}}>
<p style={{margin:'0',fontSize:'20px'}}>👥</p>
<p style={{margin:'4px 0 0',fontSize:'13px'}}>社員管理</p>
</a>
<a href="/attendance" style={{background:'#1d4ed8',color:'#fff',borderRadius:'12px',padding:'16px',textAlign:'center',textDecoration:'none'}}>
<p style={{margin:'0',fontSize:'20px'}}>📅</p>
<p style={{margin:'4px 0 0',fontSize:'13px'}}>勤怠</p>
</a>
<a href="/payroll" style={{background:'#16a34a',color:'#fff',borderRadius:'12px',padding:'16px',textAlign:'center',textDecoration:'none'}}>
<p style={{margin:'0',fontSize:'20px'}}>💰</p>
<p style={{margin:'4px 0 0',fontSize:'13px'}}>給与</p>
</a>
      <a href="/ocr-results" style={{background:"#7c3aed",color:"#fff",borderRadius:"12px",padding:"16px",textAlign:"center",textDecoration:"none"}}>
        <p style={{margin:"0",fontSize:"20px"}}>📋</p>
        <p style={{margin:"4px 0 0",fontSize:"13px"}}>LINE OCR結果</p>
      </a>
</div>
</div>
</div>
);}
