import { supabase } from '../supabase/supabaseClient';
import { TrustProfile } from '../types';

export const trustService = {
    /**
     * Fetch trust profile of a user by userId from Supabase
     */
    async getTrustProfile(userId: string): Promise<TrustProfile | null> {
        try {
            if (!userId) return null;

            const { data, error } = await supabase
                .from('trust_profiles')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) {
                // If it doesn't exist, handle it gracefully
                if (error.code === 'PGRST116') {
                    return null;
                }
                console.error('[TrustService] Error fetching trust profile:', error);
                throw error;
            }

            if (!data) return null;

            return {
                userId: data.user_id,
                verificationStatus: data.verification_status || 'unverified',
                verifiedAt: data.verified_at,
                trustScore: data.trust_score ?? 50,
                totalReviews: data.total_reviews ?? 0,
                averageRating: Number(data.average_rating ?? 0),
                reportCount: data.report_count ?? 0,
                reportsFiled: data.reports_filed ?? 0,
                joinedAt: data.joined_at || data.created_at,
                isBlocked: data.is_blocked ?? false,
                spamFlags: data.spam_flags ?? 0,
            };
        } catch (e) {
            console.error('[TrustService] Exception in getTrustProfile:', e);
            return null;
        }
    }
};
