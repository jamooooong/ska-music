import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import type { PlaylistWithProfessor } from '../../lib/types';
import toast from 'react-hot-toast';
import { Link } from '@tanstack/react-router';
import GlassSurface from '../../components/reactBits/GlassSurface';
import Aurora from '../../components/reactBits/Aurora';

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
  const [deletingPlaylistId, setDeletingPlaylistId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [playlistToDelete, setPlaylistToDelete] = useState<PlaylistWithProfessor | null>(null);

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

  const handleDeleteClick = (playlist: PlaylistWithProfessor, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPlaylistToDelete(playlist);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!playlistToDelete) return;

    setDeletingPlaylistId(playlistToDelete.id);
    try {
      const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('id', playlistToDelete.id);

      if (error) throw error;

      toast.success('수업이 삭제되었습니다');
      setPlaylists(playlists.filter((p) => p.id !== playlistToDelete.id));
      setShowDeleteModal(false);
      setPlaylistToDelete(null);
    } catch (error) {
      console.error('Error deleting playlist:', error);
      toast.error('수업 삭제에 실패했습니다');
    } finally {
      setDeletingPlaylistId(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setPlaylistToDelete(null);
  };

  if (!isAuthenticated || !professor) {
    return (
      <>
        <div className="fixed inset-0 -z-10 bg-black">
          <Aurora
            colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
            blend={0.5}
            amplitude={1.0}
            speed={0.5}
          />
        </div>

        <div className="flex min-h-screen items-center justify-center">
          <GlassSurface
            width="auto"
            height="auto"
            borderRadius={24}
            className="w-full max-w-md p-8"
            backgroundOpacity={0.1}
            brightness={20}
            opacity={0.5}
          >
            <div className="w-full">
              <h1 className="mb-6 text-3xl font-bold text-white">교수 로그인</h1>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    교수 고유번호
                  </label>
                  <input
                    type="text"
                    value={professorCode}
                    onChange={(e) => setProfessorCode(e.target.value.toUpperCase())}
                    placeholder="예: A1B2C"
                    maxLength={5}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2 font-mono text-white placeholder-gray-400 focus:border-accent focus:outline-none backdrop-blur-sm"
                    disabled={loginLoading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full rounded-lg bg-accent px-4 py-2 font-medium text-white transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50 shadow-lg"
                >
                  {loginLoading ? '로그인 중...' : '로그인'}
                </button>
              </form>
            </div>
          </GlassSurface>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 -z-10 bg-black">
        <Aurora
          colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
      </div>

      <div className="relative h-screen flex flex-col py-8">
        <div className="mx-auto w-full max-w-6xl px-4 flex flex-col h-full gap-4">
          <GlassSurface
            width="auto"
            height="auto"
            borderRadius={24}
            className="p-6 shrink-0"
            backgroundOpacity={0.1}
            brightness={20}
            opacity={0.5}
          >
            <div className="flex items-center justify-between w-full">
              <div>
                <h1 className="mb-2 text-3xl font-bold text-white">
                  {professor.name} 교수님
                </h1>
                <p className="text-gray-300">수업을 관리하고 신청곡을 확인하세요</p>
              </div>
              <button
                onClick={logout}
                className="rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 font-medium text-white transition hover:bg-white/20 shadow-lg"
              >
                로그아웃
              </button>
            </div>
          </GlassSurface>

          <GlassSurface
            width="auto"
            height="auto"
            borderRadius={24}
            className="p-6 shrink-0"
            backgroundOpacity={0.1}
            brightness={20}
            opacity={0.5}
          >
            <div className="w-full">
              <h2 className="mb-4 text-2xl font-semibold text-white">새 수업 생성</h2>
              <form onSubmit={handleCreatePlaylist} className="flex gap-4">
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="수업명 (예: 데이터베이스 시스템)"
                  className="flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white placeholder-gray-400 focus:border-accent focus:outline-none backdrop-blur-sm"
                  disabled={createLoading}
                />
                <button
                  type="submit"
                  disabled={createLoading}
                  className="rounded-lg bg-accent px-6 py-2 font-medium text-white transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50 shadow-lg"
                >
                  {createLoading ? '생성 중...' : '생성'}
                </button>
              </form>
            </div>
          </GlassSurface>

          <GlassSurface
            width="auto"
            height="auto"
            borderRadius={24}
            className="p-6 flex-1 overflow-hidden flex flex-col"
            backgroundOpacity={0.1}
            brightness={20}
            opacity={0.5}
          >
            <div className="w-full flex flex-col h-full overflow-hidden">
              <h2 className="mb-4 text-2xl font-semibold text-white shrink-0">내 수업 목록</h2>
              {playlistsLoading ? (
                <p className="text-center text-gray-300">불러오는 중...</p>
              ) : playlists.length === 0 ? (
                <p className="text-center text-gray-300">생성된 수업이 없습니다</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                  {playlists.map((playlist) => (
                    <div key={playlist.id} className="relative group">
                      <Link
                        to="/professor/$playlistId"
                        params={{ playlistId: playlist.id }}
                      >
                        <GlassSurface
                          width="auto"
                          height="auto"
                          borderRadius={16}
                          className="p-4 transition hover:scale-105"
                          backgroundOpacity={0.15}
                          brightness={30}
                          opacity={0.6}
                        >
                          <div className="w-full">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="text-lg font-semibold text-white pr-2 flex-1">
                                {playlist.class_name}
                              </h3>
                              <button
                                onClick={(e) => handleDeleteClick(playlist, e)}
                                disabled={deletingPlaylistId === playlist.id}
                                className="rounded-lg bg-red-500/80 px-2 py-1 text-xs font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50 opacity-0 group-hover:opacity-100"
                                title="수업 삭제"
                              >
                                삭제
                              </button>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-300">
                                총 {playlist.song_count}곡
                              </span>
                              {playlist.pending_count! > 0 && (
                                <span className="rounded-full bg-primary/80 px-2 py-1 text-xs font-medium text-white">
                                  대기 {playlist.pending_count}곡
                                </span>
                              )}
                            </div>
                            <p className="mt-2 text-xs text-gray-400">
                              {new Date(playlist.created_at).toLocaleDateString('ko-KR')}
                            </p>
                          </div>
                        </GlassSurface>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </GlassSurface>
        </div>
      </div>

      {showDeleteModal && playlistToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <GlassSurface
            width="480"
            height="auto"
            borderRadius={24}
            className="w-full max-w-md p-6"
            backgroundOpacity={0.15}
            brightness={25}
            opacity={0.6}
          >
            <div className="w-full">
              <h3 className="mb-4 text-xl font-bold text-white">
                수업 삭제 확인
              </h3>
              <p className="mb-6 text-gray-300">
                <span className="font-semibold text-white">
                  {playlistToDelete.class_name}
                </span>{" "}
                수업을 정말 삭제하시겠습니까?
                <br />
                <span className="text-sm text-red-400 mt-2 block">
                  ⚠️ 해당 수업의 모든 신청곡도 함께 삭제됩니다.
                </span>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteCancel}
                  disabled={deletingPlaylistId !== null}
                  className="flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-2 font-medium text-white transition hover:bg-white/20 backdrop-blur-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deletingPlaylistId !== null}
                  className="flex-1 rounded-lg bg-red-500/80 px-4 py-2 font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deletingPlaylistId === playlistToDelete.id ? "삭제 중..." : "삭제"}
                </button>
              </div>
            </div>
          </GlassSurface>
        </div>
      )}
    </>
  );
}
