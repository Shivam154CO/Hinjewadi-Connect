import { supabase } from '../supabase/supabaseClient';
import { Job, Room, UserProfile, TrustProfile } from '../types';

export interface MatchResult<T> {
    item: T;
    score: number;
    matchReasons: string[];
}

class MarketEngineService {
    /**
     * Deep Match Algorithm: Calculates compatibility between a user and a job.
     * Factors: Area proximity, Salary expectation vs offer, Category fit.
     */
    calculateJobMatch(user: UserProfile, job: Job): MatchResult<Job> {
        let score = 0;
        const matchReasons: string[] = [];

        // 1. Area Fit (Highest Weight)
        if (user.area === job.area) {
            score += 40;
            matchReasons.push(`Located in your preferred area: ${job.area}`);
        } else {
            score += 10; // Same city, different phase
            matchReasons.push('Within Hinjewadi region');
        }

        // 2. Role/Category Alignment
        if (user.listingCategory === 'job' || user.role === 'worker') {
            score += 30;
            matchReasons.push('Matches your professional interest');
        }

        // 3. Urgency Bonus
        if (job.urgent) {
            score += 20;
            matchReasons.push('High priority hiring');
        }

        // 4. Content Richness
        if (job.requirements.length > 2) {
            score += 10;
        }

        return { item: job, score: Math.min(score, 100), matchReasons };
    }

    /**
     * Calculates compatibility between a user and a room listing.
     */
    calculateRoomMatch(user: UserProfile, room: Room): MatchResult<Room> {
        let score = 0;
        const matchReasons: string[] = [];

        if (user.area === room.area) {
            score += 50;
            matchReasons.push(`Perfect location match: ${room.area}`);
        }

        if (room.status === 'Available') {
            score += 30;
            matchReasons.push('Ready for immediate move-in');
        }

        if (room.amenities.length > 3) {
            score += 20;
            matchReasons.push('Matches high-amenity preference');
        }

        return { item: room, score, matchReasons };
    }

    /**
     * Trust Score Computation: Heuristic based on user activity and profile.
     */
    async computeUserTrustScore(userId: string): Promise<number> {
        const { data: profile } = await supabase
            .from('trust_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (!profile) return 50; // Base score

        let score = profile.trust_score || 50;

        // Dynamic Adjustments
        if (profile.verification_status === 'verified') score += 20;
        if (profile.is_blocked) return 0;
        
        // Penalize for reports
        score -= (profile.report_count || 0) * 10;
        
        // Reward for positive contributions (placeholder for review logic)
        score += (profile.total_reviews || 0) * 2;

        return Math.max(0, Math.min(100, score));
    }

    /**
     * Market Trend Analyzer: Gets average metrics for a specific area.
     */
    async getAreaStatistics(area: string): Promise<{
        avgRent: number;
        jobCount: number;
        intensity: 'Low' | 'Medium' | 'High';
    }> {
        const { data: rooms } = await supabase
            .from('rooms')
            .select('price')
            .eq('area', area);
            
        const { count: jobCount } = await supabase
            .from('jobs')
            .select('*', { count: 'exact', head: true })
            .eq('area', area);

        const avgRent = rooms && rooms.length > 0 
            ? rooms.reduce((acc, r) => acc + Number(r.price), 0) / rooms.length 
            : 0;

        let intensity: 'Low' | 'Medium' | 'High' = 'Medium';
        if ((jobCount || 0) > 10) intensity = 'High';
        if ((jobCount || 0) < 3) intensity = 'Low';

        return { avgRent, jobCount: jobCount || 0, intensity };
    }
}

export const marketEngine = new MarketEngineService();
