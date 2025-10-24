import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { SongRequest } from '../lib/types';

export function useRealtimeSongRequests(playlistId: string) {
  const [requests, setRequests] = useState<SongRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!playlistId) return;

    const fetchRequests = async () => {
      const { data, error } = await supabase
        .from('song_requests')
        .select('*')
        .eq('playlist_id', playlistId)
        .order('requested_at', { ascending: true });

      if (!error && data) {
        setRequests(data);
      }
      setLoading(false);
    };

    fetchRequests();

    const channel = supabase
      .channel(`playlist:${playlistId}:${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'song_requests',
          filter: `playlist_id=eq.${playlistId}`,
        },
        (payload) => {
          console.log('Professor view - Realtime event:', payload);

          if (payload.eventType === 'INSERT') {
            setRequests((prev) => [...prev, payload.new as SongRequest]);
          } else if (payload.eventType === 'UPDATE') {
            setRequests((prev) =>
              prev.map((req) =>
                req.id === payload.new.id ? (payload.new as SongRequest) : req
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setRequests((prev) => prev.filter((req) => req.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        console.log('Professor view - Subscription status:', status);
      });

    return () => {
      console.log('Professor view - Unsubscribing');
      supabase.removeChannel(channel);
    };
  }, [playlistId]);

  return { requests, loading };
}

export function useRealtimeAcceptedSongs(playlistId: string) {
  const [acceptedSongs, setAcceptedSongs] = useState<SongRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!playlistId) return;

    const fetchAcceptedSongs = async () => {
      const { data, error } = await supabase
        .from('song_requests')
        .select('*')
        .eq('playlist_id', playlistId)
        .eq('status', 'accepted')
        .order('display_order', { ascending: true });

      if (!error && data) {
        setAcceptedSongs(data);
      }
      setLoading(false);
    };

    fetchAcceptedSongs();

    const channel = supabase
      .channel(`accepted:${playlistId}:${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'song_requests',
          filter: `playlist_id=eq.${playlistId}`,
        },
        (payload) => {
          console.log('Realtime event received:', payload);

          if (payload.eventType === 'INSERT') {
            const newRequest = payload.new as SongRequest;
            if (newRequest.status === 'accepted') {
              setAcceptedSongs((prev) =>
                [...prev, newRequest].sort(
                  (a, b) => (a.display_order || 0) - (b.display_order || 0)
                )
              );
            }
          } else if (payload.eventType === 'UPDATE') {
            const newRequest = payload.new as SongRequest;
            if (newRequest.status === 'accepted') {
              setAcceptedSongs((prev) => {
                const exists = prev.find((req) => req.id === newRequest.id);
                if (exists) {
                  return prev.map((req) =>
                    req.id === newRequest.id ? newRequest : req
                  ).sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
                }
                return [...prev, newRequest].sort(
                  (a, b) => (a.display_order || 0) - (b.display_order || 0)
                );
              });
            } else {
              setAcceptedSongs((prev) => prev.filter((req) => req.id !== newRequest.id));
            }
          } else if (payload.eventType === 'DELETE') {
            const oldRequest = payload.old as SongRequest;
            setAcceptedSongs((prev) => prev.filter((req) => req.id !== oldRequest.id));
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      console.log('Unsubscribing from channel');
      supabase.removeChannel(channel);
    };
  }, [playlistId]);

  return { acceptedSongs, loading };
}
