'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

type OcrResult = {
  id: string;
  line_user_id: string;
  document_type: string | null;
  parsed_data: Record<string, string> | null;
  raw_result: string | null;
  employee_id: string | null;
  status: string | null;
  created_at: string;
};

export default function OcrResultsPage() {
  const [results, setResults] = useState<OcrResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'error'>('all');

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const fetchResults = async () => {
      try {
        const { data, error } = await supabase
          .from('line_ocr_results')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setResults(data || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'データ取得エラー');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { error } = await supabase
      .from('line_ocr_results')
      .update({ status })
      .eq('id', id);

    if (!error) {
      setResults(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    }
  };

  const getDocTypeLabel = (type: string | null) => {
    if (type === 'resident_card') return { label: '在留カード', color: 'bg-blue-100 text-blue-800' };
    if (type === 'timesheet') return { label: 'タイムシート', color: 'bg-purple-100 text-purple-800' };
    return { label: '不明', color: 'bg-gray-100 text-gray-600' };
  };

  const getStatusLabel = (status: string | null) => {
    if (status === 'confirmed') return { label: '確認済', color: 'bg-green-100 text-green-800' };
    if (status === 'pending') return { label: '未確認', color: 'bg-yellow-100 text-yellow-800' };
    if (status === 'error') return { label: 'エラー', color: 'bg-red-100 text-red-800' };
    return { label: '未確認', color: 'bg-yellow-100 text-yellow-800' };
  };

  const formatParsedData = (type: string | null, data: Record<string, string> | null) => {
    if (!data) return null;
    if (type === 'resident_card') {
      return [
        { label: '氏名', value: data.name },
        { label: '国籍', value: data.nationality },
        { label: '在留資格', value: data.visa_type },
        { label: '在留期限', value: data.visa_expiry },
        { label: 'カード番号', value: data.card_number },
      ].filter(f => f.value);
    }
    if (type === 'timesheet') {
      return [
        { label: '氏名', value: data.employee_name },
        { label: '日付', value: data.date },
        { label: '出勤', value: data.start_time },
        { label: '退勤', value: data.end_time },
        { label: '休憩', value: data.break_minutes ? `${data.break_minutes}分` : undefined },
        { label: '備考', value: data.notes },
      ].filter(f => f.value);
    }
    return Object.entries(data).map(([k, v]) => ({ label: k, value: v }));
  };

  const filtered = results.filter(r => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !r.status || r.status === 'pending';
    return r.status === filter;
  });

  const counts = {
    all: results.length,
    pending: results.filter(r => !r.status || r.status === 'pending').length,
    confirmed: results.filter(r => r.status === 'confirmed').length,
    error: results.filter(r => r.status === 'error').length,
  };

  if (loading) return <div className="p-8 text-center text-gray-500">読み込み中...</div>;
  if (error) return <div className="p-8 text-center text-red-600">エラー: {error}</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">勤怠OCR結果</h1>
        <p className="text-sm text-gray-500 mt-1">LINEから送信された在留カード・タイムシートの読み取り結果</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'all', label: `すべて (${counts.all})` },
          { key: 'pending', label: `未確認 (${counts.pending})` },
          { key: 'confirmed', label: `確認済 (${counts.confirmed})` },
          { key: 'error', label: `エラー (${counts.error})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as typeof filter)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === tab.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">📭</div>
          <div>データがありません</div>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(result => {
            const docType = getDocTypeLabel(result.document_type);
            const statusInfo = getStatusLabel(result.status);
            const fields = formatParsedData(result.document_type, result.parsed_data);

            return (
              <div key={result.id} className="bg-white rounded-lg shadow border border-gray-100 p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-2 items-center">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${docType.color}`}>
                      {docType.label}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                    {result.employee_id && (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700">
                        🔗 社員紐付き
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(result.created_at).toLocaleString('ja-JP')}
                  </div>
                </div>

                {/* Parsed fields */}
                {fields && fields.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                    {fields.map(f => (
                      <div key={f.label} className="bg-gray-50 rounded p-2">
                        <div className="text-xs text-gray-400">{f.label}</div>
                        <div className="text-sm font-medium text-gray-800">{f.value}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action buttons */}
                {result.status !== 'confirmed' && (
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => updateStatus(result.id, 'confirmed')}
                      className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      ✅ 確認済にする
                    </button>
                    <button
                      onClick={() => updateStatus(result.id, 'error')}
                      className="px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200"
                    >
                      ❌ エラーにする
                    </button>
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
