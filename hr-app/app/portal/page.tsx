'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

type Employee = {
  id: string;
  name: string;
  name_kana?: string;
  nationality?: string;
  visa_type?: string;
  visa_expiry?: string;
  phone?: string;
  email?: string;
  company?: string;
  status?: string;
};

export default function PortalPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selected, setSelected] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const fetch = async () => {
      const { data } = await supabase
        .from('employees')
        .select('*')
        .order('name');
      setEmployees(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const getVisaDaysLeft = (expiry?: string) => {
    if (!expiry) return null;
    return Math.ceil((new Date(expiry).getTime() - Date.now()) / 86400000);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">読み込み中...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">スタッフポータル</h1>
      <p className="text-sm text-gray-500 mb-6">自分の情報を確認できます</p>

      {!selected ? (
        <div>
          <p className="text-sm text-gray-600 mb-4">氏名を選択してください：</p>
          <div className="grid gap-3 max-w-md">
            {employees.map(emp => (
              <button
                key={emp.id}
                onClick={() => setSelected(emp)}
                className="text-left px-4 py-3 bg-white rounded-lg shadow border border-gray-100 hover:border-blue-400 hover:shadow-md transition-all"
              >
                <div className="font-medium text-gray-800">{emp.name}</div>
                {emp.name_kana && <div className="text-xs text-gray-400">{emp.name_kana}</div>}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-lg">
          <button
            onClick={() => setSelected(null)}
            className="text-sm text-blue-600 hover:underline mb-4 flex items-center gap-1"
          >
            ← 戻る
          </button>

          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-800">{selected.name}</h2>
            {selected.name_kana && <p className="text-sm text-gray-400">{selected.name_kana}</p>}

            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                { label: '国籍', value: selected.nationality },
                { label: '在留資格', value: selected.visa_type },
                { label: '勤務先', value: selected.company },
                { label: '雇用形態', value: selected.status },
                { label: '電話番号', value: selected.phone },
                { label: 'メール', value: selected.email },
              ].filter(f => f.value).map(f => (
                <div key={f.label} className="bg-gray-50 rounded p-3">
                  <div className="text-xs text-gray-400">{f.label}</div>
                  <div className="text-sm font-medium text-gray-800">{f.value}</div>
                </div>
              ))}
            </div>

            {selected.visa_expiry && (() => {
              const days = getVisaDaysLeft(selected.visa_expiry);
              const color = days !== null && days <= 30 ? 'bg-red-50 border-red-200 text-red-700' : days !== null && days <= 90 ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-green-50 border-green-200 text-green-700';
              return (
                <div className={`rounded-lg border p-4 ${color}`}>
                  <div className="text-xs font-medium mb-1">在留期限</div>
                  <div className="font-bold">{selected.visa_expiry}</div>
                  {days !== null && (
                    <div className="text-sm mt-1">
                      {days < 0 ? '⚠️ 期限切れです！' : `残り ${days} 日`}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
