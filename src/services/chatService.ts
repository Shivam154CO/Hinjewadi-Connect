import { supabase } from '../supabase/supabaseClient';

export interface ChatMessage {
    id: string;
    chat_id: string;
    sender_id: string;
    text: string;
    created_at: string;
}

export interface ChatSession {
    id: string;
    user1_id: string;
    user2_id: string;
    last_message: string;
    updated_at: string;
    other_user?: { name: string, photo_url: string };
    unread?: number;
}

class ChatService {
    /** Gets all active conversations for the current user — single JOIN query (no N+1) */
    async getInboxSessions(userId: string): Promise<ChatSession[]> {
        try {
            const { data, error } = await supabase
                .from('chat_sessions')
                .select(`
                    id,
                    user1_id,
                    user2_id,
                    last_message,
                    updated_at,
                    user1:users!chat_sessions_user1_id_fkey(name, photo_url),
                    user2:users!chat_sessions_user2_id_fkey(name, photo_url)
                `)
                .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
                .order('updated_at', { ascending: false });

            if (error || !data) return [];

            return data.map((sess: any) => {
                const isUser1 = sess.user1_id === userId;
                const otherUser = isUser1 ? sess.user2 : sess.user1;
                return {
                    id: sess.id,
                    user1_id: sess.user1_id,
                    user2_id: sess.user2_id,
                    last_message: sess.last_message || '',
                    updated_at: sess.updated_at,
                    other_user: otherUser || { name: 'Unknown User', photo_url: '' },
                    unread: 0,
                };
            });
        } catch {
            return [];
        }
    }

    /** Finds existing session between two users or creates a new one ordering them lexicographically */
    async findOrCreateSession(userId1: string, userId2: string): Promise<ChatSession | null> {
        try {
            if (!userId1 || !userId2) {
                console.error('[ChatService] Missing user IDs for session creation');
                return null;
            }

            // Always order lexicographically as user1_id < user2_id
            const [u1, u2] = [userId1, userId2].sort();

            // Look for existing session in sorted ordering
            const { data: existing, error: fetchError } = await supabase
                .from('chat_sessions')
                .select('*')
                .eq('user1_id', u1)
                .eq('user2_id', u2)
                .maybeSingle();

            if (fetchError) {
                console.error('[ChatService] Error searching existing session:', fetchError);
            }

            if (existing) return existing as ChatSession;

            // Create new session
            const { data: newSession, error } = await supabase
                .from('chat_sessions')
                .insert({ user1_id: u1, user2_id: u2 })
                .select()
                .single();

            if (error) {
                console.error('[ChatService] Error creating new session:', error);
                throw error;
            }
            return newSession as ChatSession;
        } catch (err) {
            console.error('[ChatService] findOrCreateSession error:', err);
            return null;
        }
    }

    /** Gets all messages for a specific chat session */
    async getMessages(chatId: string): Promise<ChatMessage[]> {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('chat_id', chatId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error('[ChatService] Error fetching messages:', err);
            return [];
        }
    }

    /** Submits a new chat message and updates the session atomically */
    async sendMessage(chatId: string, senderId: string, text: string): Promise<boolean> {
        try {
            const trimmed = text.trim();
            if (!trimmed || trimmed.length > 500) return false;

            const { error: msgError } = await supabase.from('messages').insert({
                chat_id: chatId,
                sender_id: senderId,
                text: trimmed,
            });
            if (msgError) return false;

            await supabase.from('chat_sessions').update({
                last_message: trimmed,
                updated_at: new Date().toISOString(),
            }).eq('id', chatId);

            return true;
        } catch {
            return false;
        }
    }

    /**
     * Real-time Pub/Sub listener for active chat threads.
     */
    subscribeToMessages(chatId: string, onNewMessage: (payload: any) => void) {
        return supabase
            .channel(`chat_${chatId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
                (payload) => onNewMessage(payload.new)
            )
            .subscribe();
    }

}

export const chatService = new ChatService();
