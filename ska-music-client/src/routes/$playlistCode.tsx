import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRealtimeAcceptedSongs } from '../hooks/useRealtime';
import { SongRequestForm } from '../components/SongRequestForm';
import type { Playlist } from '../lib/types';
import toast from 'react-hot-toast';

export const Route = createFileRoute('/$playlistCode')({
  component: StudentPageComponent,
});

function StudentPageComponent() {
  const { playlistCode } = Route.useParams();
  const [playlist, setPlaylist] = useState<Playlist & { professor_name?: string } | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const { acceptedSongs } = useRealtimeAcceptedSongs(playlist?.id || '');

  useEffect(() => {
    fetchPlaylist();
  }, [playlistCode]);

  const fetchPlaylist = async () => {
    try {
      const { data: playlistData, error: playlistError } = await supabase
        .from('playlists')
        .select('*')
        .eq('playlist_code', playlistCode)
        .eq('is_active', true)
        .single();

      if (playlistError) throw playlistError;

      const { data: professorData } = await supabase
        .from('professors')
        .select('name')
        .eq('id', playlistData.professor_id)
        .single();

      setPlaylist({
        ...playlistData,
        professor_name: professorData?.name,
      });
    } catch (error) {
      console.error('Error fetching playlist:', error);
      toast.error('수업 정보를 찾을 수 없습니다');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">불러오는 중...</p>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">수업을 찾을 수 없습니다</h1>
          <p className="text-gray-600">올바른 링크인지 확인해주세요</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-4xl font-bold text-gray-900">{playlist.class_name}</h1>
            {playlist.professor_name && (
              <p className="text-lg text-gray-600">{playlist.professor_name} 교수님</p>
            )}
          </div>

          <div className="mb-6 text-center">
            <button
              onClick={() => setShowRequestForm(true)}
              className="rounded-lg bg-blue-600 px-8 py-3 text-lg font-medium text-white transition hover:bg-blue-700"
            >
              신청하기
            </button>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-6 text-2xl font-semibold text-gray-900">
              승인된 플레이리스트
            </h2>
            {acceptedSongs.length === 0 ? (
              <p className="text-center text-gray-500">
                아직 승인된 신청곡이 없습니다
              </p>
            ) : (
              <div className="space-y-3">
                {acceptedSongs.map((song, index) => (
                  <div
                    key={song.id}
                    className="flex items-center gap-4 rounded-lg border border-gray-200 bg-blue-50 p-4"
                  >
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {song.song_title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        신청: {song.requester_name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showRequestForm && (
        <SongRequestForm
          playlistId={playlist.id}
          onClose={() => setShowRequestForm(false)}
          onSuccess={() => {
            toast.success('신청곡이 제출되었습니다! 교수님의 승인을 기다려주세요.');
          }}
        />
      )}
    </>
  );
}
