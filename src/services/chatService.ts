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
    /** Gets all active conversations for the current user safely */
    async getInboxSessions(userId: string): Promise<ChatSession[]> {
        try {
            // Using a raw query. If table doesn't exist, this naturally returns empty without crashing the app.
            const { data: rawSessions, error } = await supabase
                .from('chat_sessions')
                .select('*')
                .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
                .order('updated_at', { ascending: false });

            if (error || !rawSessions) return [];

            // Map standard chat sessions safely
            return await Promise.all(rawSessions.map(async (sess) => {
                const otherParticipantId = sess.user1_id === userId ? sess.user2_id : sess.user1_id;
                const { data: otherUser } = await supabase.from('users').select('name, photo_url').eq('id', otherParticipantId).single();
                return {
                    ...sess,
                    other_user: otherUser || { name: 'Unknown User', photo_url: '' },
                    unread: 0
                };
            }));
        } catch {
            return []; // Failsafe fallback 
        }
    }

    /** Submits a new chat message to the database safely */
    async sendMessage(chatId: string, senderId: string, text: string): Promise<boolean> {
        try {
            const { error: msgError } = await supabase.from('messages').insert({
                chat_id: chatId,
                sender_id: senderId,
                text: text
            });
            if (msgError) return false;

            await supabase.from('chat_sessions').update({ 
                last_message: text, 
                updated_at: new Date().toISOString() 
            }).eq('id', chatId);

            return true;
        } catch {
            return false;
        }
    }
}

export const chatService = new ChatService();
