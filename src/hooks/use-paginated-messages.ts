import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface Message {
  id: string;
  session_id: string;
  sender: string;
  message: string;
  created_at: string;
  is_read?: boolean;
  [key: string]: unknown;
}

/**
 * Custom hook to manage chat messages with support for viewing the last N messages
 * from each party (e.g. last 10 messages from admin, last 10 from reseller).
 */
export function usePaginatedMessages(
  collectionName: string, 
  sessionId: string | null, 
  limitPerParty: number = 10
) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPerParty, setTotalPerParty] = useState<Record<string, number>>({});

  const fetchMessages = useCallback(async () => {
    if (!sessionId) {
      setMessages([]);
      return;
    }

    setLoading(true);
    try {
      // Fetch recent messages for this session
      const { data, error } = await supabase
        .from(collectionName)
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(200);

      if (!error && data) {
        // Group by sender party to extract the last `limitPerParty` (10) messages per party
        const partyCounts: Record<string, number> = {};
        const partyBuckets: Record<string, typeof data> = {};

        data.forEach((m) => {
          const senderKey = (m.sender || 'default').toLowerCase().trim();
          partyCounts[senderKey] = (partyCounts[senderKey] || 0) + 1;

          if (!partyBuckets[senderKey]) {
            partyBuckets[senderKey] = [];
          }
          if (partyBuckets[senderKey].length < limitPerParty) {
            partyBuckets[senderKey].push(m);
          }
        });

        setTotalPerParty(partyCounts);

        // Combine all items from the buckets
        const selectedMessages: typeof data = [];
        Object.values(partyBuckets).forEach((bucket) => {
          selectedMessages.push(...bucket);
        });

        // Sort chronologically ascending
        selectedMessages.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        const mapped: Message[] = selectedMessages.map((m: { id: string; session_id: string; sender: string; created_at: string; content?: string | null; message?: string | null; is_read?: boolean }) => ({
          ...m,
          message: m.content || m.message || "",
          is_read: m.is_read ?? true
        }));

        setMessages(mapped);
      }
    } catch (err) {
      console.error(`[usePaginatedMessages] Error fetching ${collectionName}:`, err);
    } finally {
      setLoading(false);
    }
  }, [sessionId, collectionName, limitPerParty]);

  useEffect(() => {
    if (!sessionId) {
      setMessages([]);
      return;
    }

    fetchMessages();

    const channel = supabase
      .channel(`paginated_messages_${collectionName}:${sessionId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: collectionName,
        filter: `session_id=eq.${sessionId}` 
      }, () => {
        fetchMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, collectionName, fetchMessages]);

  const loadMore = useCallback(async () => {
    // Retain callback compatibility
  }, []);

  return { 
    messages: messages || [], 
    loadMore, 
    hasMore: false, 
    loadingMore: loading,
    totalPerParty,
    refetch: fetchMessages
  };
}
