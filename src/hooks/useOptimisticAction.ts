import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase/supabaseClient';

/**
 * A highly reusable hook for optimistic UI updates.
 * Handles background sync, rollbacks on error, and cache invalidation.
 */
export const useOptimisticAction = <T extends { id: string }>(
    queryKey: string[],
    table: string,
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<T> }) => {
            const { data, error } = await supabase
                .from(table)
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        // Optimistically update the cache before the server responds
        onMutate: async ({ id, updates }) => {
            await queryClient.cancelQueries({ queryKey });

            const previousData = queryClient.getQueryData<T[]>(queryKey);

            if (previousData) {
                queryClient.setQueryData<T[]>(queryKey, (old) =>
                    old?.map((item) => (item.id === id ? { ...item, ...updates } : item))
                );
            }

            return { previousData };
        },
        // Rollback if the server fails
        onError: (err, variables, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(queryKey, context.previousData);
            }
        },
        // Always refetch after error or success to keep server as source of truth
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });
};
