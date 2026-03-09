import { supabase } from '../supabase/supabaseClient';
import { ServiceProvider, ServiceReview } from '../types';

export const providerService = {
    async getProviders(): Promise<ServiceProvider[]> {
        const { data, error } = await supabase
            .from('service_providers')
            .select(`
                *,
                service_reviews (*)
            `)
            .order('rating', { ascending: false });

        if (error) {
            console.error('Error fetching providers:', error);
            throw error;
        }

        return (data || []).map(this.mapProvider);
    },

    async getProviderById(id: string): Promise<ServiceProvider | null> {
        const { data, error } = await supabase
            .from('service_providers')
            .select(`
                *,
                service_reviews (*)
            `)
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching provider by id:', error);
            return null;
        }

        return this.mapProvider(data);
    },

    async createProvider(provider: Omit<ServiceProvider, 'id' | 'rating' | 'totalRatings' | 'reviews' | 'createdAt' | 'initial'>): Promise<ServiceProvider> {
        const { data, error } = await supabase
            .from('service_providers')
            .insert({
                name: provider.name,
                phone: provider.phone,
                whatsapp: provider.whatsapp,
                category: provider.category,
                experience: provider.experience,
                areas: provider.areas,
                availability: provider.availability,
                working_hours: provider.workingHours,
                description: provider.description,
                skills: provider.skills,
                price_range: provider.priceRange,
                avatar_color: provider.avatarColor,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating provider:', error);
            throw error;
        }

        return this.mapProvider(data);
    },

    async updateProvider(id: string, updates: Partial<ServiceProvider>): Promise<ServiceProvider> {
        const { data, error } = await supabase
            .from('service_providers')
            .update({
                name: updates.name,
                phone: updates.phone,
                whatsapp: updates.whatsapp,
                availability: updates.availability,
                working_hours: updates.workingHours,
                description: updates.description,
                skills: updates.skills,
                price_range: updates.priceRange,
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating provider:', error);
            throw error;
        }

        return this.mapProvider(data);
    },

    async addReview(providerId: string, review: Omit<ServiceReview, 'id' | 'date'>): Promise<void> {
        const { error } = await supabase
            .from('service_reviews')
            .insert({
                provider_id: providerId,
                user_name: review.userName,
                rating: review.rating,
                comment: review.comment,
            });

        if (error) {
            console.error('Error adding review:', error);
            throw error;
        }
    },

    async incrementViews(id: string): Promise<void> {
        await supabase.rpc('increment_provider_views', { provider_id: id });
    },

    async incrementLeads(id: string): Promise<void> {
        await supabase.rpc('increment_provider_leads', { provider_id: id });
    },

    async recordLead(listingId: string, ownerId: string, inquirerId: string): Promise<void> {
        await supabase.rpc('record_lead', {
            p_listing_id: listingId,
            p_listing_type: 'service',
            p_owner_id: ownerId,
            p_inquirer_id: inquirerId
        });
    },

    mapProvider(row: any): ServiceProvider {
        const reviews = (row.service_reviews || []).map((rev: any) => ({
            id: rev.id,
            userName: rev.user_name,
            rating: rev.rating,
            comment: rev.comment || '',
            date: rev.date,
        }));

        const nameParts = row.name.split(' ');
        const initial = nameParts.length > 1
            ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
            : nameParts[0][0].toUpperCase();

        return {
            id: row.id,
            userId: row.user_id,
            name: row.name,
            phone: row.phone,
            whatsapp: row.whatsapp,
            category: row.category,
            experience: row.experience || '',
            rating: Number(row.rating),
            totalRatings: row.total_ratings || 0,
            areas: row.areas || [],
            availability: row.availability,
            workingHours: row.working_hours || '',
            description: row.description || '',
            skills: row.skills || [],
            priceRange: row.price_range || '',
            avatarColor: row.avatar_color || '#E8D5F5',
            initial: initial,
            reviews: reviews,
            createdAt: row.created_at,
            viewsCount: row.views_count,
            leadsCount: row.leads_count,
        };
    }
};
