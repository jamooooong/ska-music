export type SongRequestStatus = 'pending' | 'accepted' | 'rejected';

export interface Professor {
  id: string;
  professor_code: string;
  name: string;
  created_at: string;
}

export interface Playlist {
  id: string;
  professor_id: string;
  class_name: string;
  playlist_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SongRequest {
  id: string;
  playlist_id: string;
  requester_name: string;
  song_title: string;
  message: string;
  youtube_url: string;
  status: SongRequestStatus;
  requested_at: string;
  processed_at: string | null;
  display_order: number | null;
}

export interface PlaylistWithProfessor extends Playlist {
  professor_name?: string;
  song_count?: number;
  pending_count?: number;
}

export interface Database {
  public: {
    Tables: {
      professors: {
        Row: Professor;
        Insert: Omit<Professor, 'id' | 'created_at'>;
        Update: Partial<Omit<Professor, 'id' | 'created_at'>>;
      };
      playlists: {
        Row: Playlist;
        Insert: Omit<Playlist, 'id' | 'playlist_code' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Playlist, 'id' | 'playlist_code' | 'created_at'>>;
      };
      song_requests: {
        Row: SongRequest;
        Insert: Omit<SongRequest, 'id' | 'requested_at' | 'processed_at' | 'display_order'>;
        Update: Partial<Omit<SongRequest, 'id' | 'requested_at'>>;
      };
    };
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    field?: string;
  };
}
