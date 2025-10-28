import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { generateProfessorCode } from "../../utils/validation";
import type { Professor } from "../../lib/types";
import toast from "react-hot-toast";
import GlassSurface from "../../components/reactBits/GlassSurface";
import Aurora from "../../components/reactBits/Aurora";

export const Route = createFileRoute("/admin/")({
  component: AdminComponent,
});

function AdminComponent() {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [professorName, setProfessorName] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [professorToDelete, setProfessorToDelete] = useState<Professor | null>(
    null,
  );

  useEffect(() => {
    fetchProfessors();
  }, []);

  const fetchProfessors = async () => {
    try {
      const { data, error } = await supabase
        .from("professors")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProfessors(data || []);
    } catch (error) {
      console.error("Error fetching professors:", error);
      toast.error("교수 목록을 불러오는데 실패했습니다");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleCreateProfessor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!professorName.trim()) {
      toast.error("교수 이름을 입력해주세요");
      return;
    }

    setLoading(true);
    try {
      const professorCode = generateProfessorCode();
      const { data, error } = await supabase
        .from("professors")
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
      setProfessorName("");
      setProfessors([data, ...professors]);
    } catch (error) {
      console.error("Error creating professor:", error);
      toast.error("교수 생성에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (professor: Professor) => {
    setProfessorToDelete(professor);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!professorToDelete) return;

    setDeletingId(professorToDelete.id);
    try {
      const { error } = await supabase
        .from("professors")
        .delete()
        .eq("id", professorToDelete.id);

      if (error) throw error;

      toast.success("교수가 삭제되었습니다");
      setProfessors(
        professors.filter((p) => p.id !== professorToDelete.id),
      );
      setShowDeleteModal(false);
      setProfessorToDelete(null);
    } catch (error) {
      console.error("Error deleting professor:", error);
      toast.error("교수 삭제에 실패했습니다");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setProfessorToDelete(null);
  };

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
            <div className="w-full">
              <h1 className="mb-2 text-3xl font-bold text-white">
                관리자 페이지
              </h1>
              <p className="text-gray-300">교수 계정을 생성하고 관리합니다</p>
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
              <h2 className="mb-4 text-2xl font-semibold text-white">
                새 교수 생성
              </h2>
              <form onSubmit={handleCreateProfessor} className="flex gap-4">
                <input
                  type="text"
                  value={professorName}
                  onChange={(e) => setProfessorName(e.target.value)}
                  placeholder="교수 이름"
                  className="flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white placeholder-gray-400 focus:border-primary focus:outline-none backdrop-blur-sm"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-primary px-6 py-2 font-medium text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50 shadow-lg"
                >
                  {loading ? "생성 중..." : "생성"}
                </button>
              </form>
              <p className="mt-2 text-sm text-gray-300">
                5자리 영문+숫자 고유번호가 자동 생성됩니다
              </p>
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
              <h2 className="mb-4 text-2xl font-semibold text-white shrink-0">
                교수 목록
              </h2>
              {fetchLoading ? (
                <p className="text-center text-gray-300">불러오는 중...</p>
              ) : professors.length === 0 ? (
                <p className="text-center text-gray-300">등록된 교수가 없습니다</p>
              ) : (
                <div className="overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-black/50 backdrop-blur-sm">
                      <tr className="border-b border-white/20">
                        <th className="pb-3 pt-2 text-left font-semibold text-white">
                          이름
                        </th>
                        <th className="pb-3 pt-2 text-left font-semibold text-white">
                          고유번호
                        </th>
                        <th className="pb-3 pt-2 text-left font-semibold text-white">
                          생성일
                        </th>
                        <th className="pb-3 pt-2 text-center font-semibold text-white">
                          관리
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {professors.map((professor) => (
                        <tr key={professor.id} className="border-b border-white/10">
                          <td className="py-3 text-white">{professor.name}</td>
                          <td className="py-3">
                            <code className="rounded bg-white/10 px-2 py-1 font-mono text-sm text-primary">
                              {professor.professor_code}
                            </code>
                          </td>
                          <td className="py-3 text-gray-300">
                            {new Date(professor.created_at).toLocaleDateString(
                              "ko-KR",
                            )}
                          </td>
                          <td className="py-3 text-center">
                            <button
                              onClick={() => handleDeleteClick(professor)}
                              disabled={deletingId === professor.id}
                              className="rounded-lg bg-red-500/80 px-3 py-1 text-sm font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deletingId === professor.id ? "삭제 중..." : "삭제"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </GlassSurface>
        </div>
      </div>

      {showDeleteModal && professorToDelete && (
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
                교수 삭제 확인
              </h3>
              <p className="mb-6 text-gray-300">
                <span className="font-semibold text-white">
                  {professorToDelete.name}
                </span>{" "}
                교수를 정말 삭제하시겠습니까?
                <br />
                <span className="text-sm text-gray-400">
                  고유번호: {professorToDelete.professor_code}
                </span>
                <br />
                <span className="text-sm text-red-400 mt-2 block">
                  ⚠️ 해당 교수의 모든 수업과 신청곡이 함께 삭제됩니다.
                </span>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteCancel}
                  disabled={deletingId !== null}
                  className="flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-2 font-medium text-white transition hover:bg-white/20 backdrop-blur-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deletingId !== null}
                  className="flex-1 rounded-lg bg-red-500/80 px-4 py-2 font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deletingId === professorToDelete.id ? "삭제 중..." : "삭제"}
                </button>
              </div>
            </div>
          </GlassSurface>
        </div>
      )}
    </>
  );
}
