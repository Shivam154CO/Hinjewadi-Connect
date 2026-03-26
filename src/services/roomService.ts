import { supabase } from '../supabase/supabaseClient';
import { Room } from '../types';

export const roomService = {
    async getRooms(limit: number = 20, offset: number = 0): Promise<Room[]> {
        const { data, error } = await supabase
            .from('rooms')
            .select('*')
            .eq('status', 'Available')
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error('Error fetching rooms:', error);
            throw error;
        }

        return (data || []).map(this.mapRoom);
    },

    async getRoomById(id: string): Promise<Room | null> {
        const { data, error } = await supabase
            .from('rooms')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching room by id:', error);
            return null;
        }

        return this.mapRoom(data);
    },

    async createRoom(room: Omit<Room, 'id' | 'createdAt'>): Promise<Room> {
        const { data, error } = await supabase
            .from('rooms')
            .insert({
                owner_id: room.ownerId,
                title: room.title,
                description: room.description,
                price: room.price,
                deposit: room.deposit,
                area: room.area,
                type: room.type,
                furnishing: room.furnishing,
                gender_preference: room.genderPreference,
                amenities: room.amenities,
                images: room.images,
                status: room.status,
                contact_phone: room.contactPhone,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating room:', error);
            throw error;
        }

        return this.mapRoom(data);
    },

    async updateRoom(id: string, updates: Partial<Room>): Promise<Room> {
        const { data, error } = await supabase
            .from('rooms')
            .update({
                title: updates.title,
                description: updates.description,
                price: updates.price,
                deposit: updates.deposit,
                area: updates.area,
                type: updates.type,
                furnishing: updates.furnishing,
                gender_preference: updates.genderPreference,
                amenities: updates.amenities,
                images: updates.images,
                status: updates.status,
                contact_phone: updates.contactPhone,
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating room:', error);
            throw error;
        }

        return this.mapRoom(data);
    },

    async deleteRoom(id: string): Promise<void> {
        const { error } = await supabase
            .from('rooms')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting room:', error);
            throw error;
        }
    },

    async incrementViews(id: string): Promise<void> {
        await supabase.rpc('increment_room_views', { room_id: id });
    },

    async incrementLeads(id: string): Promise<void> {
        await supabase.rpc('increment_room_leads', { room_id: id });
    },

    async recordLead(listingId: string, ownerId: string, inquirerId: string): Promise<void> {
        await supabase.rpc('record_lead', {
            p_listing_id: listingId,
            p_listing_type: 'room',
            p_owner_id: ownerId,
            p_inquirer_id: inquirerId
        });
    },

    async getRoomsByOwner(ownerId: string): Promise<Room[]> {
        const { data, error } = await supabase
            .from('rooms')
            .select('*')
            .eq('owner_id', ownerId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching owner rooms:', error);
            throw error;
        }

        return (data || []).map(this.mapRoom);
    },

    mapRoom(row: any): Room {
        return {
            id: row.id,
            ownerId: row.owner_id,
            title: row.title,
            description: row.description || '',
            price: Number(row.price),
            deposit: Number(row.deposit),
            area: row.area,
            type: row.type,
            furnishing: row.furnishing,
            genderPreference: row.gender_preference,
            amenities: row.amenities || [],
            images: row.images || [],
            status: row.status,
            contactPhone: row.contact_phone,
            createdAt: row.created_at,
            viewsCount: row.views_count,
            leadsCount: row.leads_count,
        };
    }
};
