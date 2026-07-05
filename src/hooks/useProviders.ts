import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { providerService } from '../services/providerService';
import { ServiceProvider, ServiceReview } from '../types';

export const useProviders = (limit: number = 20, offset: number = 0) => {
  return useQuery({
    queryKey: ['providers', limit, offset],
    queryFn: () => providerService.getProviders(limit, offset),
  });
};

export const useProviderDetail = (id: string) => {
  return useQuery({
    queryKey: ['provider', id],
    queryFn: () => providerService.getProviderById(id),
    enabled: !!id,
  });
};

export const useCreateProvider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (provider: Omit<ServiceProvider, 'id' | 'rating' | 'totalRatings' | 'reviews' | 'createdAt' | 'initial'>) =>
      providerService.createProvider(provider),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers'] });
    },
  });
};

export const useUpdateProvider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ServiceProvider> }) =>
      providerService.updateProvider(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['providers'] });
      queryClient.invalidateQueries({ queryKey: ['provider', variables.id] });
    },
  });
};

export const useAddReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ providerId, review }: { providerId: string; review: Omit<ServiceReview, 'id' | 'date'> & { userId?: string } }) =>
      providerService.addReview(providerId, review),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['provider', variables.providerId] });
      queryClient.invalidateQueries({ queryKey: ['providers'] });
    },
  });
};
