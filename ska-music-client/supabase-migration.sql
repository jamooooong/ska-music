-- ClassTune Database Migration
-- 이 SQL을 Supabase SQL Editor에서 실행하세요

-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFESSORS 테이블
CREATE TABLE IF NOT EXISTS professors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professor_code VARCHAR(5) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PLAYLISTS 테이블
CREATE TABLE IF NOT EXISTS playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professor_id UUID NOT NULL REFERENCES professors(id) ON DELETE CASCADE,
  class_name VARCHAR(200) NOT NULL,
  playlist_code UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SONG_REQUESTS 테이블
CREATE TABLE IF NOT EXISTS song_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  requester_name VARCHAR(100) NOT NULL,
  song_title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  youtube_url VARCHAR(500) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  display_order INTEGER
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_professors_code ON professors(professor_code);
CREATE INDEX IF NOT EXISTS idx_playlists_code ON playlists(playlist_code);
CREATE INDEX IF NOT EXISTS idx_playlists_professor ON playlists(professor_id);
CREATE INDEX IF NOT EXISTS idx_requests_playlist ON song_requests(playlist_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON song_requests(playlist_id, status, display_order);

-- Realtime 활성화 (REPLICA IDENTITY)
ALTER TABLE song_requests REPLICA IDENTITY FULL;
ALTER TABLE playlists REPLICA IDENTITY FULL;

-- RLS (Row Level Security) 활성화
ALTER TABLE professors ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE song_requests ENABLE ROW LEVEL SECURITY;

-- RLS 정책 삭제 (기존 정책이 있을 경우)
DROP POLICY IF EXISTS "모든 사용자가 플레이리스트 조회 가능" ON playlists;
DROP POLICY IF EXISTS "모든 사용자가 신청곡 생성 가능" ON song_requests;
DROP POLICY IF EXISTS "모든 사용자가 신청곡 조회 가능" ON song_requests;
DROP POLICY IF EXISTS "교수는 자신의 플레이리스트만 수정 가능" ON playlists;
DROP POLICY IF EXISTS "교수는 자신의 신청곡 수정 가능" ON song_requests;
DROP POLICY IF EXISTS "모든 사용자가 교수 정보 조회 가능" ON professors;
DROP POLICY IF EXISTS "관리자만 교수 생성 가능" ON professors;

-- RLS 정책 생성
-- Professors 테이블
CREATE POLICY "모든 사용자가 교수 정보 조회 가능" ON professors FOR SELECT USING (true);
CREATE POLICY "관리자만 교수 생성 가능" ON professors FOR INSERT WITH CHECK (true);

-- Playlists 테이블
CREATE POLICY "모든 사용자가 플레이리스트 조회 가능" ON playlists FOR SELECT USING (is_active = true);
CREATE POLICY "교수는 자신의 플레이리스트만 수정 가능" ON playlists FOR ALL USING (true);

-- Song Requests 테이블
CREATE POLICY "모든 사용자가 신청곡 생성 가능" ON song_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "모든 사용자가 신청곡 조회 가능" ON song_requests FOR SELECT USING (true);
CREATE POLICY "교수는 자신의 신청곡 수정 가능" ON song_requests FOR UPDATE USING (true);

-- 함수: 플레이리스트 updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거: 플레이리스트 업데이트 시 updated_at 자동 갱신
DROP TRIGGER IF EXISTS update_playlists_updated_at ON playlists;
CREATE TRIGGER update_playlists_updated_at
  BEFORE UPDATE ON playlists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE 'ClassTune 데이터베이스 마이그레이션이 완료되었습니다!';
  RAISE NOTICE '다음 단계:';
  RAISE NOTICE '1. Supabase Dashboard → Database → Replication으로 이동';
  RAISE NOTICE '2. song_requests와 playlists 테이블의 Realtime을 활성화';
  RAISE NOTICE '3. .env 파일에 VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY 설정';
END $$;
