-- 외래 키 제약 조건 수정 (CASCADE DELETE 추가)
-- Supabase Dashboard → SQL Editor에서 실행하세요

-- 1단계: 기존 외래 키 확인
SELECT
  conname AS constraint_name,
  conrelid::regclass AS table_name,
  confrelid::regclass AS foreign_table,
  confdeltype AS delete_rule
FROM pg_constraint
WHERE contype = 'f'
  AND connamespace = 'public'::regnamespace
  AND (conrelid::regclass::text = 'playlists' OR conrelid::regclass::text = 'song_requests');

-- 2단계: 기존 외래 키 삭제
ALTER TABLE IF EXISTS playlists
DROP CONSTRAINT IF EXISTS playlists_professor_id_fkey CASCADE;

ALTER TABLE IF EXISTS song_requests
DROP CONSTRAINT IF EXISTS song_requests_playlist_id_fkey CASCADE;

-- 3단계: CASCADE DELETE가 적용된 외래 키 다시 생성
ALTER TABLE playlists
ADD CONSTRAINT playlists_professor_id_fkey
FOREIGN KEY (professor_id)
REFERENCES professors(id)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE song_requests
ADD CONSTRAINT song_requests_playlist_id_fkey
FOREIGN KEY (playlist_id)
REFERENCES playlists(id)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- 4단계: 확인
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
  AND (tc.table_name = 'playlists' OR tc.table_name = 'song_requests');

-- 결과:
-- delete_rule과 update_rule이 모두 'CASCADE'로 표시되어야 함
