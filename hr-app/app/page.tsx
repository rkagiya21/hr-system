'use client';

export default function Portal() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>HRシステム v3.0</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>メニューを選択してください</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
        <a href="/employees" style={{ background: '#111827', color: '#fff', borderRadius: '12px', padding: '16px', textAlign: 'center', textDecoration: 'none' }}>
          <p style={{ margin: '0', fontSize: '20px' }}>👥</p>
          <p style={{ margin: '4px 0 0', fontSize: '13px' }}>社員管理</p>
        </a>
        <a href="/attendance" style={{ background: '#1d4ed8', color: '#fff', borderRadius: '12px', padding: '16px', textAlign: 'center', textDecoration: 'none' }}>
          <p style={{ margin: '0', fontSize: '20px' }}>🗓</p>
          <p style={{ margin: '4px 0 0', fontSize: '13px' }}>勤怠OCR</p>
        </a>
        <a href="/shifts" style={{ background: '#0369a1', color: '#fff', borderRadius: '12px', padding: '16px', textAlign: 'center', textDecoration: 'none' }}>
          <p style={{ margin: '0', fontSize: '20px' }}>📅</p>
          <p style={{ margin: '4px 0 0', fontSize: '13px' }}>シフト管理</p>
        </a>
        <a href="/payroll" style={{ background: '#16a34a', color: '#fff', borderRadius: '12px', padding: '16px', textAlign: 'center', textDecoration: 'none' }}>
          <p style={{ margin: '0', fontSize: '20px' }}>💰</p>
          <p style={{ margin: '4px 0 0', fontSize: '13px' }}>給与</p>
        </a>
        <a href="/search" style={{ background: '#7e22ce', color: '#fff', borderRadius: '12px', padding: '16px', textAlign: 'center', textDecoration: 'none' }}>
          <p style={{ margin: '0', fontSize: '20px' }}>🔍</p>
          <p style={{ margin: '4px 0 0', fontSize: '13px' }}>検索</p>
        </a>
        <a href="/ocr-results" style={{ background: '#7c3aed', color: '#fff', borderRadius: '12px', padding: '16px', textAlign: 'center', textDecoration: 'none' }}>
          <p style={{ margin: '0', fontSize: '20px' }}>📋</p>
          <p style={{ margin: '4px 0 0', fontSize: '13px' }}>LINE OCR結果</p>
        </a>
      </div>
    </div>
  );
}
