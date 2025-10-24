import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-8 text-6xl font-bold text-gray-900">ClassTune</h1>
        <p className="mb-12 text-xl text-gray-600">수업별 신청곡 서비스</p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            to="/admin"
            className="rounded-lg bg-blue-600 px-8 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            관리자 페이지
          </Link>
          <Link
            to="/professor"
            className="rounded-lg bg-green-600 px-8 py-3 font-medium text-white transition hover:bg-green-700"
          >
            교수 로그인
          </Link>
        </div>
      </div>
    </div>
  );
}
