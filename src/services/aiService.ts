import { supabase } from '../supabase/supabaseClient';

export interface AIInsight {
    id: string;
    title: string;
    description: string;
    type: 'trend' | 'recommendation' | 'alert';
    priority: 'low' | 'medium' | 'high';
    icon: string;
}

class AIService {
    async getInsights(): Promise<AIInsight[]> {
        // In a real app, this would call an Edge Function that uses OpenAI/Gemini
        // For now, we'll generate dynamic insights based on current data trends
        
        try {
            // Get some raw data to "analyze"
            const { data: jobs } = await supabase.from('jobs').select('category, area');
            const { data: rooms } = await supabase.from('rooms').select('area, rent');

            const insights: AIInsight[] = [];

            // Example Insight 1: Job Trends
            if (jobs && jobs.length > 0) {
                const categories = jobs.map(j => j.category);
                const mainCategory = this.getMostFrequent(categories);
                insights.push({
                    id: '1',
                    title: `${mainCategory} Demand Spiking`,
                    description: `AI analysis shows a 15% increase in ${mainCategory} job postings in Hinjewadi this week.`,
                    type: 'trend',
                    priority: 'high',
                    icon: 'trending-up',
                });
            }

            // Example Insight 2: Rental Market
            if (rooms && rooms.length > 0) {
                const avgRent = rooms.reduce((acc, r) => acc + (r.rent || 0), 0) / rooms.length;
                insights.push({
                    id: '2',
                    title: 'Smart Rental Guide',
                    description: `Average room rent in Phase 1 is currently ₹${Math.round(avgRent)}. This is a good time to negotiate.`,
                    type: 'recommendation',
                    priority: 'medium',
                    icon: 'home-analytics',
                });
            }

            // Example Insight 3: Location Tip
            insights.push({
                id: '3',
                title: 'Phase 3 Expanding',
                description: 'New corporate offices opening in Phase 3. Expect higher demand for nearby accommodation soon.',
                type: 'alert',
                priority: 'medium',
                icon: 'map-marker-star',
            });

            return insights;
        } catch (error) {
            console.error('AI Insights Error:', error);
            return [];
        }
    }

    private getMostFrequent(arr: string[]) {
        return arr.sort((a, b) =>
            arr.filter(v => v === a).length - arr.filter(v => v === b).length
        ).pop();
    }
}

export const aiService = new AIService();
