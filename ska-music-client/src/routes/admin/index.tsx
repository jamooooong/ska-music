import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { generateProfessorCode } from '../../utils/validation';
import type { Professor } from '../../lib/types';
import toast from 'react-hot-toast';

export const Route = createFileRoute('/admin/')({
  component: AdminComponent,
});

function AdminComponent() {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [professorName, setProfessorName] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    fetchProfessors();
  }, []);

  const fetchProfessors = async () => {
    try {
      const { data, error } = await supabase
        .from('professors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfessors(data || []);
    } catch (error) {
      console.error('Error fetching professors:', error);
      toast.error('교수 목록을 불러오는데 실패했습니다');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleCreateProfessor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!professorName.trim()) {
      toast.error('교수 이름을 입력해주세요');
      return;
    }

    setLoading(true);
    try {
      const professorCode = generateProfessorCode();
      const { data, error } = await supabase
        .from('professors')
        .insert([
          {
            professor_code: professorCode,
            name: professorName.trim(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast.success(`교수 생성 완료! 고유번호: ${professorCode}`);
      setProfessorName('');
      setProfessors([data, ...professors]);
    } catch (error) {
      console.error('Error creating professor:', error);
      toast.error('교수 생성에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">관리자 페이지</h1>
          <p className="text-gray-600">교수 계정을 생성하고 관리합니다</p>
        </div>

        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">새 교수 생성</h2>
          <form onSubmit={handleCreateProfessor} className="flex gap-4">
            <input
              type="text"
              value={professorName}
              onChange={(e) => setProfessorName(e.target.value)}
              placeholder="교수 이름"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-primary px-6 py-2 font-medium text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? '생성 중...' : '생성'}
            </button>
          </form>
          <p className="mt-2 text-sm text-gray-600">
            5자리 영문+숫자 고유번호가 자동 생성됩니다
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">교수 목록</h2>
          {fetchLoading ? (
            <p className="text-center text-gray-600">불러오는 중...</p>
          ) : professors.length === 0 ? (
            <p className="text-center text-gray-600">등록된 교수가 없습니다</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-3 text-left font-semibold text-gray-900">이름</th>
                    <th className="pb-3 text-left font-semibold text-gray-900">
                      고유번호
                    </th>
                    <th className="pb-3 text-left font-semibold text-gray-900">
                      생성일
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {professors.map((professor) => (
                    <tr key={professor.id} className="border-b border-gray-100">
                      <td className="py-3 text-gray-900">{professor.name}</td>
                      <td className="py-3">
                        <code className="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-primary">
                          {professor.professor_code}
                        </code>
                      </td>
                      <td className="py-3 text-gray-600">
                        {new Date(professor.created_at).toLocaleDateString('ko-KR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
