import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService, ChatSession, ChatMessage } from '../services/chatService';

export const useChatSessions = (userId: string | undefined) => {
    return useQuery({
        queryKey: ['chat-sessions', userId],
        queryFn: () => chatService.getInboxSessions(userId!),
        enabled: !!userId,
    });
};

export const useMessages = (chatId: string) => {
    return useQuery({
        queryKey: ['messages', chatId],
        queryFn: () => chatService.getMessages(chatId),
        enabled: !!chatId,
    });
};

export const useSendMessage = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ chatId, senderId, text }: { chatId: string, senderId: string, text: string }) => 
            chatService.sendMessage(chatId, senderId, text),
        onMutate: async ({ chatId, senderId, text }) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ['messages', chatId] });

            // Snapshot the previous value
            const previousMessages = queryClient.getQueryData<ChatMessage[]>(['messages', chatId]);

            // Optimistically update to the new value
            const optimisticMessage: ChatMessage = {
                id: Date.now().toString(), // Temporary ID
                chat_id: chatId,
                sender_id: senderId,
                text,
                created_at: new Date().toISOString(),
            };

            queryClient.setQueryData(['messages', chatId], (old: ChatMessage[] | undefined) => [
                ...(old || []),
                optimisticMessage,
            ]);

            // Return a context object with the snapshotted value
            return { previousMessages, chatId };
        },
        onError: (err, variables, context) => {
            // Rollback to the previous value if mutation fails
            if (context?.previousMessages) {
                queryClient.setQueryData(['messages', context.chatId], context.previousMessages);
            }
        },
        onSettled: (data, error, variables, context) => {
            // Invalidate to sync with server
            queryClient.invalidateQueries({ queryKey: ['messages', variables.chatId] });
            queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
        },
    });
};
