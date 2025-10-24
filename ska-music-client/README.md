# ClassTune - 수업별 신청곡 서비스

학생들이 수업에 틀 음악을 신청하고, 교수가 실시간으로 승인/거절할 수 있는 웹 애플리케이션입니다.

## 기술 스택

- **Frontend**: React 19 + TypeScript + Vite
- **Router**: TanStack Router
- **UI**: Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL + Realtime + Auth)
- **Notifications**: React Hot Toast

## 주요 기능

### 관리자
- 교수 계정 생성 (5자리 고유번호 자동 생성)
- 교수 목록 관리

### 교수
- 고유번호로 로그인
- 수업(플레이리스트) 생성 및 관리
- 학생 공유 링크 복사
- 신청곡 실시간 조회 및 승인/거절
- 승인된 플레이리스트 대시보드

### 학생
- 교수가 공유한 링크로 수업 페이지 접근
- 신청곡 제출 (노래명, 사연, 유튜브 링크)
- 승인된 플레이리스트 실시간 조회

## 설치 및 실행

### 1. 의존성 설치

```bash
pnpm install
```

### 2. Supabase 설정

#### 2.1 Supabase 프로젝트 생성
1. [supabase.com](https://supabase.com)에서 새 프로젝트 생성
2. Project Settings → API에서 다음 값 확인:
   - `Project URL` (VITE_SUPABASE_URL)
   - `anon public` key (VITE_SUPABASE_ANON_KEY)

#### 2.2 데이터베이스 마이그레이션
1. Supabase Dashboard → SQL Editor 이동
2. `supabase-migration.sql` 파일의 내용 복사
3. SQL Editor에 붙여넣기 후 실행 (Run)

#### 2.3 Realtime 활성화
1. Supabase Dashboard → Database → Replication 이동
2. 다음 테이블의 Realtime 활성화:
   - `song_requests`
   - `playlists`

### 3. 환경 변수 설정

`.env` 파일을 생성하고 Supabase 정보를 입력하세요:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 `http://localhost:5173` 접속

## 주요 페이지

- `/` - 홈페이지
- `/admin` - 관리자 페이지 (교수 생성)
- `/professor` - 교수 로그인/대시보드
- `/professor/{playlistId}` - 수업 관리 (실시간 승인/거절)
- `/{playlistCode}` - 학생 페이지 (신청곡 제출)

## 프로젝트 구조

```
src/
├── routes/              # TanStack Router 라우트
├── components/          # 재사용 컴포넌트
├── lib/                 # Supabase 클라이언트 & 타입
├── hooks/               # Custom Hooks (useAuth, useRealtime)
└── utils/               # 유틸리티 함수
```

## 빌드

```bash
pnpm build
pnpm preview
```
