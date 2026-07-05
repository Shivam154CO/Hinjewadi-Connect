import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobService } from '../services/jobService';
import { Job } from '../types';

export const useJobs = (limit: number = 20, offset: number = 0) => {
  return useQuery({
    queryKey: ['jobs', limit, offset],
    queryFn: () => jobService.getJobs(limit, offset),
  });
};

export const useJobDetail = (id: string) => {
  return useQuery({
    queryKey: ['job', id],
    queryFn: () => jobService.getJobById(id),
    enabled: !!id,
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (newJob: Omit<Job, 'id' | 'postedAgo'>) => jobService.createJob(newJob),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};
