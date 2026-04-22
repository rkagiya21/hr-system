'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

type FaxResult = {
  id: string;
  file_name: string | null;
  document_type: string | null;
  parsed_data: Record<string, string> | null;
  raw_result: string | null;
  employee_id: string | null;
  status: string | null;
  created_at: string;
};

export default function FaxPage() {
  const [results, setResults] = useState<FaxResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const getSupabase = () => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchResults = async () => {
    const supabase = getSupabase();
    const { data } = await supabase
      .from('fax_results')
      .select('*')
      .order('created_at', { ascending: false });
    setResults(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchResults(); }, []);

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const analyzeWithClaude = async (base64: string, mediaType: string): Promise<{ document_type: string; parsed_data: Record<string, string> }> => {
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
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64 }
            },
            {
              type: 'text',
              text: `この画像を分析してください。
在留カードの場合：{"document_type":"resident_card","name":"氏名","nationality":"国籍","visa_type":"在留資格","visa_expiry":"在留期限(YYYY-MM-DD)","card_number":"カード番号"}
タイムシート・勤怠記録の場合：{"document_type":"timesheet","employee_name":"氏名","date":"日付(YYYY-MM-DD)","start_time":"出勤時間(HH:MM)","end_time":"退勤時間(HH:MM)","break_minutes":"休憩時間（分）","notes":"備考"}
FAX・その他書類の場合：{"document_type":"fax","sender":"送信者","subject":"件名","content":"内容の要約","date":"日付"}
どれでもない場合：{"document_type":"unknown"}
JSONのみ返してください。説明文は不要です。`
            }
          ]
        }]
      })
    });
    const data = await res.json();
    const text = data.content?.[0]?.text?.trim() || '{}';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('JSONの解析に失敗しました');
    const parsed = JSON.parse(match[0]);
    const { document_type, ...parsed_data } = parsed;
    return { document_type: document_type ?? 'unknown', parsed_data };
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadStatus('📄 ファイルを読み込み中...');

    try {
      const base64 = await toBase64(file);
      const mediaType = file.type === 'application/pdf' ? 'image/jpeg' : file.type;

      setUploadStatus('🤖 AIで解析中...');
      const { document_type, parsed_data } = await analyzeWithClaude(base64, mediaType as string);

      // Try to match employee
      let employee_id = null;
      const nameKey = document_type === 'resident_card' ? parsed_data.name : parsed_data.employee_name;
      if (nameKey) {
        const supabase = getSupabase();
        const { data } = await supabase
          .from('employees')
          .select('id')
          .ilike('name', `%${nameKey}%`)
          .limit(1);
        employee_id = data?.[0]?.id || null;
      }

      setUploadStatus('💾 保存中...');
      const supabase = getSupabase();
      await supabase.from('fax_results').insert({
        file_name: file.name,
        document_type,
        parsed_data,
        raw_result: JSON.stringify(parsed_data),
        employee_id,
        status: employee_id ? 'confirmed' : 'pending',
      });

      setUploadStatus('✅ 読み取り完了！');
      await fetchResults();
      if (fileRef.current) fileRef.current.value = '';
      setTimeout(() => setUploadStatus(null), 3000);

    } catch (err) {
      console.error(err);
      setUploadStatus('❌ エラーが発生しました。もう一度お試しください。');
      setTimeout(() => setUploadStatus(null), 4000);
    } finally {
      setUploading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const supabase = getSupabase();
    await supabase.from('fax_results').update({ status }).eq('id', id);
    setResults(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const getDocLabel = (type: string | null) => {
    if (type === 'resident_card') return { label: '在留カード', color: 'bg-blue-100 text-blue-800' };
    if (type === 'timesheet') return { label: 'タイムシート', color: 'bg-purple-100 text-purple-800' };
    if (type === 'fax') return { label: 'FAX書類', color: 'bg-orange-100 text-orange-800' };
    return { label: '不明', color: 'bg-gray-100 text-gray-600' };
  };

  const getStatusLabel = (status: string | null) => {
    if (status === 'confirmed') return { label: '確認済', color: 'bg-green-100 text-green-800' };
    if (status === 'error') return { label: 'エラー', color: 'bg-red-100 text-red-800' };
    return { label: '未確認', color: 'bg-yellow-100 text-yellow-800' };
  };

  const formatFields = (type: string | null, data: Record<string, string> | null) => {
    if (!data) return [];
    if (type === 'resident_card') return [
      { label: '氏名', value: data.name },
      { label: '国籍', value: data.nationality },
      { label: '在留資格', value: data.visa_type },
      { label: '在留期限', value: data.visa_expiry },
      { label: 'カード番号', value: data.card_number },
    ].filter(f => f.value);
    if (type === 'timesheet') return [
      { label: '氏名', value: data.employee_name },
      { label: '日付', value: data.date },
      { label: '出勤', value: data.start_time },
      { label: '退勤', value: data.end_time },
      { label: '休憩', value: data.break_minutes ? `${data.break_minutes}分` : undefined },
      { label: '備考', value: data.notes },
    ].filter(f => f.value);
    if (type === 'fax') return [
      { label: '送信者', value: data.sender },
      { label: '件名', value: data.subject },
      { label: '日付', value: data.date },
      { label: '内容', value: data.content },
    ].filter(f => f.value);
    return Object.entries(data).map(([k, v]) => ({ label: k, value: v }));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">FAX・書類読み取り</h1>
      <p className="text-sm text-gray-500 mb-6">PDFまたは画像をアップロードするとAIが自動で読み取ります</p>

      {/* Upload area */}
      <div className="mb-8">
        <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${uploading ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}>
          <div className="text-center">
            {uploadStatus ? (
              <div className="text-base font-medium text-blue-600">{uploadStatus}</div>
            ) : (
              <>
                <div className="text-4xl mb-2">📂</div>
                <div className="text-sm font-medium text-gray-700">クリックしてファイルを選択</div>
                <div className="text-xs text-gray-400 mt-1">PDF・PNG・JPG対応</div>
              </>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {/* Results */}
      <h2 className="text-lg font-semibold text-gray-700 mb-4">読み取り履歴 ({results.length}件)</h2>

      {loading ? (
        <div className="text-center py-8 text-gray-400">読み込み中...</div>
      ) : results.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">📭</div>
          <div>まだデータがありません</div>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map(result => {
            const doc = getDocLabel(result.document_type);
            const st = getStatusLabel(result.status);
            const fields = formatFields(result.document_type, result.parsed_data);
            return (
              <div key={result.id} className="bg-white rounded-lg shadow border border-gray-100 p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-2 flex-wrap items-center">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${doc.color}`}>{doc.label}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${st.color}`}>{st.label}</span>
                    {result.employee_id && <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700">🔗 社員紐付き</span>}
                    {result.file_name && <span className="text-xs text-gray-400">📄 {result.file_name}</span>}
                  </div>
                  <div className="text-xs text-gray-400">{new Date(result.created_at).toLocaleString('ja-JP')}</div>
                </div>

                {fields.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                    {fields.map(f => (
                      <div key={f.label} className="bg-gray-50 rounded p-2">
                        <div className="text-xs text-gray-400">{f.label}</div>
                        <div className="text-sm font-medium text-gray-800">{f.value}</div>
                      </div>
                    ))}
                  </div>
                )}

                {result.status !== 'confirmed' && (
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button onClick={() => updateStatus(result.id, 'confirmed')} className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700">✅ 確認済にする</button>
                    <button onClick={() => updateStatus(result.id, 'error')} className="px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200">❌ エラーにする</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
