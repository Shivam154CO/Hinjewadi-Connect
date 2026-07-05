import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomService } from '../services/roomService';
import { Room } from '../types';

export const useRooms = (limit: number = 20, offset: number = 0) => {
  return useQuery({
    queryKey: ['rooms', limit, offset],
    queryFn: () => roomService.getRooms(limit, offset),
  });
};

export const useRoomDetail = (id: string) => {
  return useQuery({
    queryKey: ['room', id],
    queryFn: () => roomService.getRoomById(id),
    enabled: !!id,
  });
};

export const useCreateRoom = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (newRoom: Omit<Room, 'id' | 'createdAt'>) => roomService.createRoom(newRoom),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
};
