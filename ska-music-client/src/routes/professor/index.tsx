import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import type { PlaylistWithProfessor } from '../../lib/types';
import toast from 'react-hot-toast';
import { Link } from '@tanstack/react-router';

export const Route = createFileRoute('/professor/')({
  component: ProfessorComponent,
});

function ProfessorComponent() {
  const { professor, isAuthenticated, login, logout } = useAuth();
  const [professorCode, setProfessorCode] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [playlists, setPlaylists] = useState<PlaylistWithProfessor[]>([]);
  const [playlistsLoading, setPlaylistsLoading] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && professor) {
      fetchPlaylists();
    }
  }, [isAuthenticated, professor]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!professorCode.trim()) {
      toast.error('교수 고유번호를 입력해주세요');
      return;
    }

    setLoginLoading(true);
    try {
      const { data, error } = await supabase
        .from('professors')
        .select('*')
        .eq('professor_code', professorCode.trim().toUpperCase())
        .single();

      if (error || !data) {
        toast.error('유효하지 않은 교수 고유번호입니다');
        return;
      }

      login(data);
      toast.success(`환영합니다, ${data.name} 교수님!`);
      setProfessorCode('');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('로그인에 실패했습니다');
    } finally {
      setLoginLoading(false);
    }
  };

  const fetchPlaylists = async () => {
    if (!professor) return;

    setPlaylistsLoading(true);
    try {
      const { data, error } = await supabase
        .from('playlists')
        .select(
          `
          *,
          song_requests(count)
        `
        )
        .eq('professor_id', professor.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const playlistsWithCounts = await Promise.all(
        (data || []).map(async (playlist) => {
          const { count: pendingCount } = await supabase
            .from('song_requests')
            .select('*', { count: 'exact', head: true })
            .eq('playlist_id', playlist.id)
            .eq('status', 'pending');

          const { count: totalCount } = await supabase
            .from('song_requests')
            .select('*', { count: 'exact', head: true })
            .eq('playlist_id', playlist.id);

          return {
            ...playlist,
            song_count: totalCount || 0,
            pending_count: pendingCount || 0,
          };
        })
      );

      setPlaylists(playlistsWithCounts);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      toast.error('수업 목록을 불러오는데 실패했습니다');
    } finally {
      setPlaylistsLoading(false);
    }
  };

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) {
      toast.error('수업명을 입력해주세요');
      return;
    }

    setCreateLoading(true);
    try {
      const { error } = await supabase
        .from('playlists')
        .insert([
          {
            professor_id: professor!.id,
            class_name: newClassName.trim(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast.success('수업이 생성되었습니다!');
      setNewClassName('');
      fetchPlaylists();
    } catch (error) {
      console.error('Error creating playlist:', error);
      toast.error('수업 생성에 실패했습니다');
    } finally {
      setCreateLoading(false);
    }
  };

  if (!isAuthenticated || !professor) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
          <h1 className="mb-6 text-3xl font-bold text-gray-900">교수 로그인</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900">
                교수 고유번호
              </label>
              <input
                type="text"
                value={professorCode}
                onChange={(e) => setProfessorCode(e.target.value.toUpperCase())}
                placeholder="예: A1B2C"
                maxLength={5}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 font-mono focus:border-accent focus:outline-none"
                disabled={loginLoading}
              />
            </div>
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full rounded-lg bg-accent px-4 py-2 font-medium text-white transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loginLoading ? '로그인 중...' : '로그인'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-gray-900">
              {professor.name} 교수님
            </h1>
            <p className="text-gray-600">수업을 관리하고 신청곡을 확인하세요</p>
          </div>
          <button
            onClick={logout}
            className="rounded-lg bg-gray-600 px-4 py-2 font-medium text-white transition hover:bg-gray-700"
          >
            로그아웃
          </button>
        </div>

        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">새 수업 생성</h2>
          <form onSubmit={handleCreatePlaylist} className="flex gap-4">
            <input
              type="text"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="수업명 (예: 데이터베이스 시스템)"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-accent focus:outline-none"
              disabled={createLoading}
            />
            <button
              type="submit"
              disabled={createLoading}
              className="rounded-lg bg-accent px-6 py-2 font-medium text-white transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createLoading ? '생성 중...' : '생성'}
            </button>
          </form>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">내 수업 목록</h2>
          {playlistsLoading ? (
            <p className="text-center text-gray-600">불러오는 중...</p>
          ) : playlists.length === 0 ? (
            <p className="text-center text-gray-600">생성된 수업이 없습니다</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {playlists.map((playlist) => (
                <Link
                  key={playlist.id}
                  to="/professor/$playlistId"
                  params={{ playlistId: playlist.id }}
                  className="block rounded-lg border border-gray-200 p-4 transition hover:border-accent hover:shadow-md"
                >
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    {playlist.class_name}
                  </h3>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      총 {playlist.song_count}곡
                    </span>
                    {playlist.pending_count! > 0 && (
                      <span className="rounded-full bg-[#ffe5e7] px-2 py-1 text-xs font-medium text-danger">
                        대기 {playlist.pending_count}곡
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-gray-600">
                    {new Date(playlist.created_at).toLocaleDateString('ko-KR')}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
