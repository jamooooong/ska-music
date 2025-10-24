import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useRealtimeAcceptedSongs } from "../hooks/useRealtime";
import { SongRequestForm } from "../components/SongRequestForm";
import type { Playlist } from "../lib/types";
import toast from "react-hot-toast";
import GlassSurface from "../components/reactBits/GlassSurface";
import Aurora from "../components/reactBits/Aurora";

export const Route = createFileRoute("/$playlistCode")({
  component: StudentPageComponent,
});

function StudentPageComponent() {
  const { playlistCode } = Route.useParams();
  const [playlist, setPlaylist] = useState<
    (Playlist & { professor_name?: string }) | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const { acceptedSongs } = useRealtimeAcceptedSongs(playlist?.id || "");

  useEffect(() => {
    fetchPlaylist();
  }, [playlistCode]);

  const fetchPlaylist = async () => {
    try {
      const { data: playlistData, error: playlistError } = await supabase
        .from("playlists")
        .select("*")
        .eq("playlist_code", playlistCode)
        .eq("is_active", true)
        .single();

      if (playlistError) throw playlistError;

      const { data: professorData } = await supabase
        .from("professors")
        .select("name")
        .eq("id", playlistData.professor_id)
        .single();

      setPlaylist({
        ...playlistData,
        professor_name: professorData?.name,
      });
    } catch (error) {
      console.error("Error fetching playlist:", error);
      toast.error("수업 정보를 찾을 수 없습니다");
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
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            수업을 찾을 수 없습니다
          </h1>
          <p className="text-gray-600">올바른 링크인지 확인해주세요</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 -z-10  bg-black">
        <Aurora
          colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
      </div>

      <div className="relative h-screen flex flex-col py-8">
        <div className="mx-auto w-full max-w-4xl px-4 flex flex-col h-full gap-4">
          <GlassSurface
            width="auto"
            height="auto"
            borderRadius={24}
            className="p-6 shrink-0"
            backgroundOpacity={0.1}
            brightness={20}
            opacity={0.5}
          >
            <div className="text-center w-full">
              <h1 className="mb-2 text-3xl font-bold text-white">
                {playlist.class_name}
              </h1>
              {playlist.professor_name && (
                <p className="text-lg text-gray-300">
                  {playlist.professor_name} 교수님
                </p>
              )}
            </div>
          </GlassSurface>

          <div className="text-center shrink-0">
            <button
              onClick={() => setShowRequestForm(true)}
              className="rounded-lg bg-primary px-8 py-3 text-lg font-medium text-white transition hover:bg-primary-dark shadow-lg hover:shadow-xl"
            >
              신청하기
            </button>
          </div>

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
              <h2 className="mb-4 text-2xl font-semibold text-white shrink-0">
                승인된 플레이리스트
              </h2>
              {acceptedSongs.length === 0 ? (
                <p className="text-center text-gray-300">
                  아직 승인된 신청곡이 없습니다
                </p>
              ) : (
                <div className="space-y-3 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                  {acceptedSongs.map((song, index) => (
                    <GlassSurface
                      key={song.id}
                      width="auto"
                      height="auto"
                      borderRadius={16}
                      className="p-4"
                      backgroundOpacity={0.15}
                      brightness={30}
                      opacity={0.6}
                    >
                      <div className="flex items-center gap-4 w-full">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-white shadow-md">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-white truncate">
                            {song.song_title}
                          </h3>
                          <p className="text-sm text-gray-300">
                            신청: {song.requester_name}
                          </p>
                        </div>
                      </div>
                    </GlassSurface>
                  ))}
                </div>
              )}
            </div>
          </GlassSurface>
        </div>
      </div>

      {showRequestForm && (
        <SongRequestForm
          playlistId={playlist.id}
          onClose={() => setShowRequestForm(false)}
          onSuccess={() => {
            toast.success(
              "신청곡이 제출되었습니다! 교수님의 승인을 기다려주세요.",
            );
          }}
        />
      )}
    </>
  );
}
