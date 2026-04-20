'use client';
import{useState}from 'react';
export default function Attendance(){
const[img,setImg]=useState<string|null>(null);
const[reading,setReading]=useState(false);
const[results,setResults]=useState<any[]>([]);
function handleFile(e:any){const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=ev=>setImg(ev.target?.result as string);reader.readAsDataURL(file);}
function readOCR(){setReading(true);setTimeout(()=>{setResults([{name:'KATWAL SANHANA',clock_in:'22:00',clock_out:'06:00',total:8,overtime:0},{name:'SHRESTHA SAGAR',clock_in:'22:00',clock_out:'06:40',total:8.67,overtime:0.67}]);setReading(false);},2000);}
return(
<div style={{minHeight:'100vh',background:'#f9fafb',padding:'2rem',fontFamily:'sans-serif'}}>
<div style={{maxWidth:'800px',margin:'0 auto'}}>
<p style={{color:'#6b7280',fontSize:'13px'}}>HRシステム v3.0</p>
<h1 style={{fontSize:'24px',fontWeight:'500',margin:'4px 0 24px'}}>勤怠OCR読み取り</h1>
<div style={{background:'#fff',border:'2px dashed #e5e7eb',borderRadius:'12px',padding:'3rem',textAlign:'center',marginBottom:'24px'}}>
<p style={{fontSize:'32px',margin:'0 0 8px'}}>📄</p>
<p style={{fontWeight:'500',margin:'0 0 16px'}}>タイムカードの写真をアップロード</p>
<input type="file" accept="image/*" onChange={handleFile} style={{display:'none'}} id="file"/>
<label htmlFor="file" style={{padding:'8px 20px',background:'#111827',color:'#fff',borderRadius:'8px',cursor:'pointer',fontSize:'14px'}}>写真を選択</label>
</div>
{img&&<div style={{marginBottom:'24px'}}><img src={img} style={{maxWidth:'100%',borderRadius:'8px',marginBottom:'16px'}}/><button onClick={readOCR} disabled={reading} style={{width:'100%',padding:'12px',background:'#111827',color:'#fff',border:'none',borderRadius:'8px',fontSize:'14px',cursor:'pointer'}}>{reading?'読み取り中...⏳':'Claudeに読み取らせる'}</button></div>}
{results.length>0&&<div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:'12px',overflow:'hidden'}}><div style={{padding:'16px',background:'#f0fdf4',borderBottom:'1px solid #e5e7eb'}}><p style={{margin:'0',color:'#16a34a',fontSize:'14px'}}>✅ 読み取り完了！</p></div>{results.map((r,i)=><div key={i} style={{display:'grid',gridTemplateColumns:'1fr 80px 80px 80px 80px',padding:'12px 16px',borderBottom:'1px solid #f3f4f6',fontSize:'14px'}}><span style={{fontWeight:'500'}}>{r.name}</span><span>{r.clock_in}</span><span>{r.clock_out}</span><span>{r.total}h</span><span style={{color:r.overtime>0?'#dc2626':'#6b7280'}}>{r.overtime>0?r.overtime+'h':'-'}</span></div>)}<div style={{padding:'16px',display:'flex',gap:'8px',justifyContent:'flex-end'}}><a href="/" style={{padding:'8px 16px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'14px',textDecoration:'none',color:'#111827'}}>戻る</a><button style={{padding:'8px 24px',background:'#111827',color:'#fff',border:'none',borderRadius:'8px',fontSize:'14px',cursor:'pointer'}}>Supabaseに保存</button></div></div>}
</div>
</div>
);}
