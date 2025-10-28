-- ========================================
-- 완전한 데이터베이스 설정 (처음부터 다시)
-- Supabase Dashboard → SQL Editor에서 실행하세요
-- ========================================

-- 1단계: 기존 제약조건 확인
SELECT
  conname AS constraint_name,
  conrelid::regclass AS table_name,
  confrelid::regclass AS referenced_table,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE contype = 'f'
  AND connamespace = 'public'::regnamespace
ORDER BY conrelid::regclass::text;

-- 2단계: 모든 외래 키 삭제 (안전하게)
ALTER TABLE IF EXISTS song_requests DROP CONSTRAINT IF EXISTS song_requests_playlist_id_fkey CASCADE;
ALTER TABLE IF EXISTS playlists DROP CONSTRAINT IF EXISTS playlists_professor_id_fkey CASCADE;

-- 3단계: CASCADE DELETE가 적용된 외래 키 재생성
-- playlists → professors
ALTER TABLE playlists
ADD CONSTRAINT playlists_professor_id_fkey
FOREIGN KEY (professor_id)
REFERENCES professors(id)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- song_requests → playlists
ALTER TABLE song_requests
ADD CONSTRAINT song_requests_playlist_id_fkey
FOREIGN KEY (playlist_id)
REFERENCES playlists(id)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- 4단계: RLS 정책 설정 (모든 작업 허용)
-- professors 테이블
DROP POLICY IF EXISTS "Enable all operations for professors" ON professors;
CREATE POLICY "Enable all operations for professors"
ON professors FOR ALL
USING (true)
WITH CHECK (true);

-- playlists 테이블
DROP POLICY IF EXISTS "Enable all operations for playlists" ON playlists;
CREATE POLICY "Enable all operations for playlists"
ON playlists FOR ALL
USING (true)
WITH CHECK (true);

-- song_requests 테이블
DROP POLICY IF EXISTS "Enable all operations for song_requests" ON song_requests;
CREATE POLICY "Enable all operations for song_requests"
ON song_requests FOR ALL
USING (true)
WITH CHECK (true);

-- 5단계: 확인 쿼리
-- 외래 키 확인
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule,
  rc.update_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- RLS 정책 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 6단계: 테스트 데이터로 확인 (선택사항)
-- 교수 ID를 확인하는 쿼리
SELECT id, professor_code, name FROM professors LIMIT 5;

-- ========================================
-- 실행 후 확인사항:
-- 1. delete_rule과 update_rule이 'CASCADE'인지 확인
-- 2. RLS 정책이 모든 테이블에 적용되었는지 확인
-- 3. 교수 목록이 정상적으로 조회되는지 확인
-- ========================================
