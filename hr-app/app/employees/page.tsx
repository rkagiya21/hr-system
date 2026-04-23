'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

type Employee = {
  id: string;
  employee_code?: string;
  last_name?: string;
  first_name?: string;
  last_name_kana?: string;
  first_name_kana?: string;
  nationality?: string;
  visa_type?: string;
  card_expiry?: string;
  phone?: string;
  email?: string;
  employment_type?: string;
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const fetchEmployees = async () => {
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          ;

        if (error) throw error;
        setEmployees(data || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'データ取得エラー');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const exportCSV = () => {
    const headers = ['氏名', '氏名（カナ）', '国籍', 'ビザ種別', 'ビザ期限', '電話番号', 'メール', '勤務先', 'ステータス'];
    const rows = employees.map(e => [
      e.name, e.name_kana || '', e.nationality || '', e.visa_type || '',
      e.visa_expiry || '', e.phone || '', e.email || '', e.company || '', e.status || ''
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '社員一覧.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = employees.filter(e =>
    (e.last_name + ' ' + e.first_name)?.includes(search) ||
    (e.last_name_kana + ' ' + e.first_name_kana)?.includes(search) ||
    e.nationality?.includes(search) ||
    ''.includes(search)
  );

  const getVisaStatus = (expiry?: string) => {
    if (!expiry) return null;
    const days = Math.ceil((new Date(expiry).getTime() - Date.now()) / 86400000);
    if (days < 0) return { label: '期限切れ', color: 'bg-red-100 text-red-800' };
    if (days <= 30) return { label: `残${days}日`, color: 'bg-red-100 text-red-800' };
    if (days <= 90) return { label: `残${days}日`, color: 'bg-yellow-100 text-yellow-800' };
    return { label: `残${days}日`, color: 'bg-green-100 text-green-800' };
  };

  if (loading) return <div className="p-8 text-center">読み込み中...</div>;
  if (error) return <div className="p-8 text-center text-red-600">エラー: {error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">社員管理</h1>
        <button
          onClick={exportCSV}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          CSVエクスポート
        </button>
      </div>

      <input
        type="text"
        placeholder="氏名・国籍・勤務先で検索..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <div className="text-sm text-gray-500 mb-2">全{filtered.length}件</div>

      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50 text-gray-600 text-sm">
            <tr>
              <th className="px-4 py-3 text-left">氏名</th>
              <th className="px-4 py-3 text-left">国籍</th>
              <th className="px-4 py-3 text-left">ビザ種別</th>
              <th className="px-4 py-3 text-left">ビザ期限</th>
              <th className="px-4 py-3 text-left">電話番号</th>
              <th className="px-4 py-3 text-left">勤務先</th>
              <th className="px-4 py-3 text-left">ステータス</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  データがありません
                </td>
              </tr>
            ) : (
              filtered.map(emp => {
                const visa = getVisaStatus(emp.card_expiry);
                return (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium">{emp.last_name} {emp.first_name}</div>
                      {emp.last_name_kana && <div className="text-gray-400 text-xs">{emp.last_name_kana} {emp.first_name_kana}</div>}
                    </td>
                    <td className="px-4 py-3">{emp.nationality || '-'}</td>
                    <td className="px-4 py-3">{emp.visa_type || '-'}</td>
                    <td className="px-4 py-3">
                      <div>{emp.card_expiry || '-'}</div>
                      {visa && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${visa.color}`}>
                          {visa.label}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">{emp.phone || '-'}</td>
                    <td className="px-4 py-3">{emp.employment_type || '-'}</td>
                    <td className="px-4 py-3">{emp.employee_code || '-'}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
