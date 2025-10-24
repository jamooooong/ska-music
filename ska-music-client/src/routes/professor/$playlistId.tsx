import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useRealtimeSongRequests, useRealtimeAcceptedSongs } from '../../hooks/useRealtime';
import { copyToClipboard } from '../../utils/validation';
import type { Playlist, SongRequest } from '../../lib/types';
import toast from 'react-hot-toast';
import GlassSurface from '../../components/reactBits/GlassSurface';
import Aurora from '../../components/reactBits/Aurora';

export const Route = createFileRoute('/professor/$playlistId')({
  component: PlaylistManagementComponent,
});

function PlaylistManagementComponent() {
  const { playlistId } = Route.useParams();
  const navigate = useNavigate();
  const { professor, isAuthenticated } = useAuth();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const { requests } = useRealtimeSongRequests(playlistId);
  const { acceptedSongs } = useRealtimeAcceptedSongs(playlistId);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/professor' });
      return;
    }
    fetchPlaylist();
  }, [playlistId, isAuthenticated]);

  const fetchPlaylist = async () => {
    try {
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('id', playlistId)
        .single();

      if (error) throw error;

      if (data.professor_id !== professor?.id) {
        toast.error('접근 권한이 없습니다');
        navigate({ to: '/professor' });
        return;
      }

      setPlaylist(data);
    } catch (error) {
      console.error('Error fetching playlist:', error);
      toast.error('수업 정보를 불러오는데 실패했습니다');
      navigate({ to: '/professor' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/${playlist?.playlist_code}`;
    const success = await copyToClipboard(link);
    if (success) {
      toast.success('링크가 복사되었습니다!');
    } else {
      toast.error('링크 복사에 실패했습니다');
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      const maxOrder = acceptedSongs.reduce(
        (max, song) => Math.max(max, song.display_order || 0),
        0
      );

      const { error } = await supabase
        .from('song_requests')
        .update({
          status: 'accepted',
          processed_at: new Date().toISOString(),
          display_order: maxOrder + 1,
        })
        .eq('id', requestId);

      if (error) throw error;
      toast.success('신청곡이 승인되었습니다');
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error('승인에 실패했습니다');
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('song_requests')
        .update({
          status: 'rejected',
          processed_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) throw error;
      toast.success('신청곡이 거절되었습니다');
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('거절에 실패했습니다');
    }
  };

  const pendingRequests = requests.filter((req) => req.status === 'pending');

  if (loading) {
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
          <p className="text-gray-300">불러오는 중...</p>
        </div>
      </>
    );
  }

  if (!playlist) {
    return null;
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
        <div className="mx-auto w-full max-w-7xl px-4 flex flex-col h-full gap-4">
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
              <button
                onClick={() => navigate({ to: '/professor' })}
                className="mb-4 text-gray-300 hover:text-white transition"
              >
                ← 목록으로 돌아가기
              </button>
              <h1 className="mb-2 text-3xl font-bold text-white">
                {playlist.class_name}
              </h1>
              <div className="flex items-center gap-4">
                <code className="rounded bg-white/10 border border-white/20 px-3 py-1 font-mono text-sm text-white">
                  {playlist.playlist_code}
                </code>
                <button
                  onClick={handleCopyLink}
                  className="rounded bg-accent px-4 py-1 text-sm font-medium text-white transition hover:bg-primary shadow-lg"
                >
                  학생 링크 복사
                </button>
              </div>
            </div>
          </GlassSurface>

          <div className="grid gap-4 lg:grid-cols-2 flex-1 overflow-hidden">
            <GlassSurface
              width="auto"
              height="auto"
              borderRadius={24}
              className="p-6 overflow-hidden flex flex-col"
              backgroundOpacity={0.1}
              brightness={20}
              opacity={0.5}
            >
              <div className="w-full flex flex-col h-full overflow-hidden">
                <h2 className="mb-4 text-2xl font-semibold text-white shrink-0">
                  대기 중인 신청곡
                  {pendingRequests.length > 0 && (
                    <span className="ml-2 rounded-full bg-primary/80 px-3 py-1 text-sm text-white">
                      {pendingRequests.length}
                    </span>
                  )}
                </h2>
                {pendingRequests.length === 0 ? (
                  <p className="text-center text-gray-300">대기 중인 신청곡이 없습니다</p>
                ) : (
                  <div className="space-y-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                    {pendingRequests.map((request) => (
                      <PendingRequestCard
                        key={request.id}
                        request={request}
                        onAccept={handleAccept}
                        onReject={handleReject}
                      />
                    ))}
                  </div>
                )}
              </div>
            </GlassSurface>

            <GlassSurface
              width="auto"
              height="auto"
              borderRadius={24}
              className="p-6 overflow-hidden flex flex-col"
              backgroundOpacity={0.1}
              brightness={20}
              opacity={0.5}
            >
              <div className="w-full flex flex-col h-full overflow-hidden">
                <h2 className="mb-4 text-2xl font-semibold text-white shrink-0">
                  승인된 플레이리스트
                </h2>
                {acceptedSongs.length === 0 ? (
                  <p className="text-center text-gray-300">승인된 신청곡이 없습니다</p>
                ) : (
                  <div className="space-y-3 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                    {acceptedSongs.map((song, index) => (
                      <AcceptedSongCard key={song.id} song={song} order={index + 1} />
                    ))}
                  </div>
                )}
              </div>
            </GlassSurface>
          </div>
        </div>
      </div>
    </>
  );
}

function PendingRequestCard({
  request,
  onAccept,
  onReject,
}: {
  request: SongRequest;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}) {
  return (
    <GlassSurface
      width="auto"
      height="auto"
      borderRadius={16}
      className="p-4"
      backgroundOpacity={0.15}
      brightness={30}
      opacity={0.6}
    >
      <div className="w-full">
        <div className="mb-3">
          <div className="mb-1 flex items-start justify-between">
            <h3 className="text-lg font-semibold text-white">{request.song_title}</h3>
            <span className="text-sm text-gray-300">{request.requester_name}</span>
          </div>
          <p className="text-sm text-gray-300">{request.message}</p>
        </div>
        <div className="mb-3">
          <a
            href={request.youtube_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-accent hover:text-primary transition break-all"
          >
            {request.youtube_url}
          </a>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onAccept(request.id)}
            className="flex-1 rounded bg-success px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 shadow-lg"
          >
            승인
          </button>
          <button
            onClick={() => onReject(request.id)}
            className="flex-1 rounded bg-danger px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-dark shadow-lg"
          >
            거절
          </button>
        </div>
      </div>
    </GlassSurface>
  );
}

function AcceptedSongCard({ song, order }: { song: SongRequest; order: number }) {
  return (
    <GlassSurface
      width="auto"
      height="auto"
      borderRadius={16}
      className="p-4"
      backgroundOpacity={0.15}
      brightness={30}
      opacity={0.6}
    >
      <div className="flex items-start gap-3 w-full">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white shadow-md">
          {order}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white">{song.song_title}</h3>
          <p className="text-sm text-gray-300">신청: {song.requester_name}</p>
          <p className="mt-1 text-sm text-gray-300">{song.message}</p>
          <a
            href={song.youtube_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block text-sm text-accent hover:text-primary transition"
          >
            유튜브 링크
          </a>
        </div>
      </div>
    </GlassSurface>
  );
}
