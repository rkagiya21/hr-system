'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

type AttendanceRecord = {
  id: string;
  employee_id: string;
  employee_name?: string;
  date: string;
  start_time?: string;
  end_time?: string;
  break_minutes?: number;
  notes?: string;
  created_at: string;
};

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const getSupabase = () => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchRecords = async () => {
    const supabase = getSupabase();
    const { data } = await supabase
      .from('attendance')
      .select('*')
      .order('date', { ascending: false })
      .limit(50);
    setRecords(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchRecords(); }, []);

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadStatus('📄 ファイルを読み込み中...');
    try {
      const base64 = await toBase64(file);
      setUploadStatus('🤖 AIで解析中...');
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-opus-4-5',
          max_tokens: 1024,
          messages: [{
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: file.type as 'image/jpeg', data: base64 } },
              { type: 'text', text: 'このタイムシートを読み取り、以下のJSON形式で返してください：{"employee_name":"氏名","date":"日付(YYYY-MM-DD)","start_time":"出勤(HH:MM)","end_time":"退勤(HH:MM)","break_minutes":休憩分数(数値),"notes":"備考"}。JSONのみ返してください。' }
            ]
          }]
        })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || '{}';
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('解析失敗');
      const parsed = JSON.parse(match[0]);

      setUploadStatus('💾 保存中...');
      const supabase = getSupabase();

      // Try to find employee
      let employee_id = 'unknown';
      if (parsed.employee_name) {
        const { data: empData } = await supabase
          .from('employees')
          .select('id')
          .ilike('name', `%${parsed.employee_name}%`)
          .limit(1);
        if (empData?.[0]) employee_id = empData[0].id;
      }

      await supabase.from('attendance').insert({
        employee_id,
        employee_name: parsed.employee_name,
        date: parsed.date,
        start_time: parsed.start_time,
        end_time: parsed.end_time,
        break_minutes: parsed.break_minutes,
        notes: parsed.notes,
      });

      setUploadStatus('✅ 登録完了！');
      await fetchRecords();
      if (fileRef.current) fileRef.current.value = '';
      setTimeout(() => setUploadStatus(null), 3000);
    } catch {
      setUploadStatus('❌ エラーが発生しました。もう一度お試しください。');
      setTimeout(() => setUploadStatus(null), 4000);
    } finally {
      setUploading(false);
    }
  };

  const calcHours = (start?: string, end?: string, breakMin?: number) => {
    if (!start || !end) return '-';
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const total = (eh * 60 + em) - (sh * 60 + sm) - (breakMin || 0);
    return `${Math.floor(total / 60)}時間${total % 60}分`;
  };

  if (loading) return <div className="p-8 text-center text-gray-500">読み込み中...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">勤怠管理</h1>
      <p className="text-sm text-gray-500 mb-6">タイムシートの写真をアップロードして自動登録</p>

      {/* Upload */}
      <div className="mb-8">
        <label className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${uploading ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}>
          {uploadStatus ? (
            <div className="text-base font-medium text-blue-600">{uploadStatus}</div>
          ) : (
            <>
              <div className="text-3xl mb-2">📋</div>
              <div className="text-sm font-medium text-gray-700">タイムシートをアップロード</div>
              <div className="text-xs text-gray-400 mt-1">PNG・JPG・PDF対応</div>
            </>
          )}
          <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg,.pdf" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {/* Records table */}
      <h2 className="text-lg font-semibold text-gray-700 mb-3">勤怠記録 ({records.length}件)</h2>
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">氏名</th>
              <th className="px-4 py-3 text-left">日付</th>
              <th className="px-4 py-3 text-left">出勤</th>
              <th className="px-4 py-3 text-left">退勤</th>
              <th className="px-4 py-3 text-left">休憩</th>
              <th className="px-4 py-3 text-left">実働</th>
              <th className="px-4 py-3 text-left">備考</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {records.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">データがありません</td></tr>
            ) : records.map(r => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{r.employee_name || '-'}</td>
                <td className="px-4 py-3">{r.date}</td>
                <td className="px-4 py-3">{r.start_time || '-'}</td>
                <td className="px-4 py-3">{r.end_time || '-'}</td>
                <td className="px-4 py-3">{r.break_minutes ? `${r.break_minutes}分` : '-'}</td>
                <td className="px-4 py-3">{calcHours(r.start_time, r.end_time, r.break_minutes)}</td>
                <td className="px-4 py-3 text-gray-500">{r.notes || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
