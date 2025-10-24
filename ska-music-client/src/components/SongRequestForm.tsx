import { useState } from "react";
import { validateSongRequest } from "../utils/validation";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import GlassSurface from "./reactBits/GlassSurface";

interface SongRequestFormProps {
  playlistId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function SongRequestForm({
  playlistId,
  onClose,
  onSuccess,
}: SongRequestFormProps) {
  const [formData, setFormData] = useState({
    requester_name: "",
    song_title: "",
    message: "",
    youtube_url: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateSongRequest(formData);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("song_requests").insert([
        {
          playlist_id: playlistId,
          requester_name: formData.requester_name.trim(),
          song_title: formData.song_title.trim(),
          message: formData.message.trim(),
          youtube_url: formData.youtube_url.trim(),
          status: "pending",
        },
      ]);

      if (error) throw error;

      toast.success("신청곡이 제출되었습니다!");
      setFormData({
        requester_name: "",
        song_title: "",
        message: "",
        youtube_url: "",
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error("신청곡 제출에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <GlassSurface
        width="720"
        height="auto"
        borderRadius={24}
        className="w-full max-w-lg p-8"
        backgroundOpacity={0.15}
        brightness={25}
        opacity={0.6}
      >
        <div className="w-full">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">신청곡 제출</h2>
            <button
              onClick={onClose}
              className="text-gray-300 hover:text-white transition"
              disabled={loading}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-white">
                신청자 이름 *
              </label>
              <input
                type="text"
                name="requester_name"
                value={formData.requester_name}
                onChange={handleChange}
                className={`w-full rounded-lg border px-4 py-2 text-white placeholder-gray-400 bg-white/10 backdrop-blur-sm focus:outline-none ${
                  errors.requester_name
                    ? "border-danger focus:border-danger"
                    : "border-white/20 focus:border-primary"
                }`}
                disabled={loading}
              />
              {errors.requester_name && (
                <p className="mt-1 text-sm text-danger">
                  {errors.requester_name}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-white">
                노래 제목 *
              </label>
              <input
                type="text"
                name="song_title"
                value={formData.song_title}
                onChange={handleChange}
                className={`w-full rounded-lg border px-4 py-2 text-white placeholder-gray-400 bg-white/10 backdrop-blur-sm focus:outline-none ${
                  errors.song_title
                    ? "border-danger focus:border-danger"
                    : "border-white/20 focus:border-primary"
                }`}
                disabled={loading}
              />
              {errors.song_title && (
                <p className="mt-1 text-sm text-danger">{errors.song_title}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-white">
                사연
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                placeholder="사연을 입력해주세요 (선택사항)"
                className={`w-full rounded-lg border px-4 py-2 text-white placeholder-gray-400 bg-white/10 backdrop-blur-sm focus:outline-none ${
                  errors.message
                    ? "border-danger focus:border-danger"
                    : "border-white/20 focus:border-primary"
                }`}
                disabled={loading}
              />
              {errors.message && (
                <p className="mt-1 text-sm text-danger">{errors.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-white">
                유튜브 링크 *
              </label>
              <input
                type="text"
                name="youtube_url"
                value={formData.youtube_url}
                onChange={handleChange}
                placeholder="https://www.youtube.com/watch?v=..."
                className={`w-full rounded-lg border px-4 py-2 text-white placeholder-gray-400 bg-white/10 backdrop-blur-sm focus:outline-none ${
                  errors.youtube_url
                    ? "border-danger focus:border-danger"
                    : "border-white/20 focus:border-primary"
                }`}
                disabled={loading}
              />
              {errors.youtube_url && (
                <p className="mt-1 text-sm text-danger">{errors.youtube_url}</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-2 font-medium text-white transition hover:bg-white/20 backdrop-blur-sm"
                disabled={loading}
              >
                취소
              </button>
              <button
                type="submit"
                className="flex-1 rounded-lg bg-primary px-4 py-2 font-medium text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50 shadow-lg"
                disabled={loading}
              >
                {loading ? "제출 중..." : "제출"}
              </button>
            </div>
          </form>
        </div>
      </GlassSurface>
    </div>
  );
}
