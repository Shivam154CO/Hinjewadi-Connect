import { supabase } from '../supabase/supabaseClient';

export const adminService = {
    // LEADS FOR OWNERS (Used in ManagePosts)
    async getRecentLeads(ownerId: string) {
        const { data, error } = await supabase
            .from('leads')
            .select(`
                *,
                inquirer:inquirer_id (name, phone)
            `)
            .eq('owner_id', ownerId)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;
        return data;
    }
};
