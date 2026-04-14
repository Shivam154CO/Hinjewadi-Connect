import { describe, it, expect } from 'vitest';
import { roomService } from './roomService';

describe('roomService', () => {
    it('should correctly map database row to Room object', () => {
        const mockRow = {
            id: 'uuid-123',
            owner_id: 'owner-456',
            title: 'Nice Room',
            description: 'A cozy place',
            price: '15000',
            deposit: '30000',
            area: 'Phase 1',
            type: 'Flat',
            furnishing: 'Fully-furnished',
            gender_preference: 'Any',
            amenities: ['WiFi', 'AC'],
            images: ['img1.jpg'],
            status: 'Available',
            contact_phone: '9876543210',
            created_at: '2023-10-01T12:00:00Z',
            views_count: 5,
            leads_count: 2
        };

        const result = roomService.mapRoom(mockRow);

        expect(result.id).toBe('uuid-123');
        expect(result.price).toBe(15000);
        expect(result.deposit).toBe(30000);
        expect(result.ownerId).toBe('owner-456');
        expect(result.amenities).toContain('WiFi');
    });

    it('should handle missing optional fields with defaults', () => {
        const mockRow = {
            id: 'uuid-789',
            owner_id: 'owner-000',
            title: 'Minimal Room',
            price: '10000',
            deposit: '10000',
            area: 'Phase 2',
            type: 'Room',
            furnishing: 'Unfurnished',
            gender_preference: 'Male',
            status: 'Available',
            contact_phone: '0000000000',
            created_at: '2023-10-02T12:00:00Z'
        };

        const result = roomService.mapRoom(mockRow);

        expect(result.description).toBe('');
        expect(result.amenities).toEqual([]);
        expect(result.images).toEqual([]);
    });
});
