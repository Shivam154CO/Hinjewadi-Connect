import { supabase } from '../supabase/supabaseClient';

export interface AIInsight {
    id: string;
    title: string;
    description: string;
    type: 'trend' | 'recommendation' | 'alert';
    priority: 'low' | 'medium' | 'high';
    icon: string;
}

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

class AIService {
    async getInsights(): Promise<AIInsight[]> {
        try {
            // 1. Gather Context
            const { data: jobs } = await supabase.from('jobs').select('category, area, salary');
            const { data: rooms } = await supabase.from('rooms').select('area, rent, type');
            
            // 2. If no key is provided, use a fallback so the app doesn't crash
            if (!GEMINI_API_KEY) {
                console.warn("No Gemini API key found. Using fallback logic.");
                return this.getFallbackInsights(jobs, rooms);
            }

            // 3. Craft the LLM Prompt
            const prompt = `
            You are a hyper-local market AI analyst for 'Hinjewadi Connect', a community app in Pune.
            Analyze this raw active listing data:
            JOBS: ${JSON.stringify(jobs?.slice(0, 30) || [])}
            ROOMS: ${JSON.stringify(rooms?.slice(0, 30) || [])}

            Provide EXACTLY 3 insights. Reply ONLY with a valid JSON array matching this exact schema:
            [{
               "id": "1",
               "title": "String (Short punches like 'High Tech Demand')",
               "description": "String (Actionable tip based on the exact data provided)",
               "type": "trend" | "recommendation" | "alert",
               "priority": "low" | "medium" | "high",
               "icon": "trending-up" | "home-analytics" | "map-marker-star" | "currency-inr" | "briefcase"
            }]
            `;

            // 4. Call Real AI Model
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.6 } // lower temp for strict JSON adherence
                })
            });

            if (!response.ok) throw new Error("LLM API Call failed");
            
            const result = await response.json();
            const rawText = result.candidates[0].content.parts[0].text;
            
            // Clean markdown blocks if the LLM adds them
            const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            const aiData: AIInsight[] = JSON.parse(cleanJson);
            
            return aiData;

        } catch (error) {
            console.error('Real AI Insights Error:', error);
            return this.getFallbackInsights([], []);
        }
    }

    private getFallbackInsights(jobs: any, rooms: any): AIInsight[] {
        const insights: AIInsight[] = [];
        
        if (jobs && jobs.length > 0) {
            const categories = jobs.map((j: any) => j.category);
            const mainCategory = this.getMostFrequent(categories);
            insights.push({
                id: '1', title: `${mainCategory} Demand`, description: `Basic stats show high listings in ${mainCategory}. Add Gemini API Key for deep analysis.`,
                type: 'trend', priority: 'medium', icon: 'trending-up',
            });
        } else {
             insights.push({
                id: '1', title: `AI System Ready`, description: `Please paste your Google Gemini API Key into the .env file to activate genuine AI insights.`,
                type: 'alert', priority: 'medium', icon: 'robot',
            });
        }
        return insights;
    }

    private getMostFrequent(arr: string[]): string {
        if (!arr || arr.length === 0) return 'Various';
        return arr.sort((a, b) =>
            arr.filter(v => v === a).length - arr.filter(v => v === b).length
        ).pop() || 'Various';
    }
}

export const aiService = new AIService();
