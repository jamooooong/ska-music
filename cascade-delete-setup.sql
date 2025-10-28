-- 기존 외래 키 제약 조건을 CASCADE로 변경하는 SQL
-- Supabase Dashboard → SQL Editor에서 실행하세요

-- 1. 먼저 기존 외래 키 제약 조건을 삭제
ALTER TABLE playlists DROP CONSTRAINT IF EXISTS playlists_professor_id_fkey;
ALTER TABLE song_requests DROP CONSTRAINT IF EXISTS song_requests_playlist_id_fkey;

-- 2. CASCADE DELETE가 적용된 새로운 외래 키 제약 조건 추가
ALTER TABLE playlists
ADD CONSTRAINT playlists_professor_id_fkey
FOREIGN KEY (professor_id)
REFERENCES professors(id)
ON DELETE CASCADE;

ALTER TABLE song_requests
ADD CONSTRAINT song_requests_playlist_id_fkey
FOREIGN KEY (playlist_id)
REFERENCES playlists(id)
ON DELETE CASCADE;

-- 결과:
-- - 교수 삭제 시 → 해당 교수의 모든 플레이리스트 자동 삭제
-- - 플레이리스트 삭제 시 → 해당 플레이리스트의 모든 신청곡 자동 삭제
-- - 교수 삭제 시 → 연쇄적으로 플레이리스트 → 신청곡 모두 삭제
