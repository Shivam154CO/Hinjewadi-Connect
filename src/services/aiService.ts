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
        try {
            const { data: jobs } = await supabase.from('jobs').select('category, area, salary');
            const { data: rooms } = await supabase.from('rooms').select('area, rent, type');

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

            const { data, error } = await supabase.functions.invoke('gemini-server', {
                body: { prompt, temperature: 0.6 }
            });

            if (error) return this.getFallbackInsights(jobs, rooms);

            const aiData = await this.parseAndValidateJSON<AIInsight[]>(
                data.candidates?.[0]?.content?.parts?.[0]?.text,
                (val) => Array.isArray(val) && val.every(item => 
                    item.id && item.title && item.description && 
                    ['trend', 'recommendation', 'alert'].includes(item.type)
                )
            );

            return aiData || this.getFallbackInsights(jobs, rooms);

        } catch (err) {
            console.error('[AIService] getInsights error:', err);
            return this.getFallbackInsights([], []);
        }
    }

    private async parseAndValidateJSON<T>(rawText: string | undefined, validator: (val: any) => boolean): Promise<T | null> {
        if (!rawText) return null;
        try {
            // More robust JSON extraction: find first '{' or '[' and last '}' or ']'
            const firstBrace = rawText.indexOf('{');
            const firstBracket = rawText.indexOf('[');
            const start = (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) ? firstBrace : firstBracket;
            
            const lastBrace = rawText.lastIndexOf('}');
            const lastBracket = rawText.lastIndexOf(']');
            const end = Math.max(lastBrace, lastBracket);

            if (start === -1 || end === -1 || end < start) return null;

            const cleanJson = rawText.substring(start, end + 1).trim();
            const parsed = JSON.parse(cleanJson);
            
            return validator(parsed) ? parsed as T : null;
        } catch (err) {
            console.warn('[AIService] JSON parse/validation failed:', err);
            return null;
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

    /** Automatically generates a cohesive professional summary. */
    async generateProfessionalBio(role: string, category: string, experience: string): Promise<string> {
        const prompt = `Write a highly professional, 2-to-3 sentence bio for a ${role} seeking work in ${category} with ${experience} experience. Tone: Confident, reliable, local to Pune/Hinjewadi. No emojis. Output strictly the text string.`;
        return this.callGeminiRawText(prompt);
    }

    /** Calculates profile matching against specific job requirements. */
    async evaluateJobMatch(userSkills: string[], jobDescription: string): Promise<{ score: number, feedback: string }> {
        const prompt = `Compare these user skills: [${userSkills.join(', ')}] against this Job: "${jobDescription}". 
        Return EXACTLY a valid JSON object matching: { "score": number (0-100), "feedback": "Short 1-sentence explanation of the strength or missing skill" }`;
        
        const res = await this.callGeminiRawText(prompt);
        const data = await this.parseAndValidateJSON<{ score: number, feedback: string }>(
            res,
            (val) => typeof val?.score === 'number' && typeof val?.feedback === 'string'
        );
        return data || { score: 50, feedback: "Analysis unavailable" };
    }

    /** Heuristically assesses listing copy for potential scams/fraud. */
    async detectFraudOrSpam(title: string, description: string): Promise<{ isSuspicious: boolean, reason: string }> {
        const prompt = `Analyze this listing for potential scams (e.g. asking for money upfront, fake URLs, weird formatting, unrealistic salaries/rent):
        Title: ${title} | Desc: ${description}
        Return EXACTLY a valid JSON object matching: { "isSuspicious": boolean, "reason": "Short reason if true, else empty string" }`;
        
        const res = await this.callGeminiRawText(prompt);
        const data = await this.parseAndValidateJSON<{ isSuspicious: boolean, reason: string }>(
            res,
            (val) => typeof val?.isSuspicious === 'boolean' && typeof val?.reason === 'string'
        );
        return data || { isSuspicious: false, reason: "" };
    }

    /** Infers average localized market value dynamically. */
    async estimateFairRent(area: string, type: string, furnishing: string): Promise<{ estimate: number, advice: string }> {
        const prompt = `Estimate the fair monthly rent in INR for a ${furnishing} ${type} in ${area}, Hinjewadi, Pune.
        Return EXACTLY a valid JSON object matching: { "estimate": number (exact integer estimate), "advice": "1 short sentence of negotiation advice" }`;
        
        const res = await this.callGeminiRawText(prompt);
        const data = await this.parseAndValidateJSON<{ estimate: number, advice: string }>(
            res,
            (val) => typeof val?.estimate === 'number' && typeof val?.advice === 'string'
        );
        return data || { estimate: 0, advice: "Data unavailable" };
    }

    /** Context-aware multi-language translation. */
    async translateListing(text: string, langCode: 'hi' | 'mr'): Promise<string> {
        const target = langCode === 'hi' ? 'Hindi' : 'Marathi';
        const prompt = `Translate the following text into natural ${target}. Return ONLY the translated string, nothing else: "${text}"`;
        return this.callGeminiRawText(prompt);
    }

    /** Provides dynamically generated questions for employers. */
    async generateInterviewQuestions(jobCategory: string): Promise<string[]> {
        const prompt = `Generate exactly 3 common interview/screening questions for a ${jobCategory} role. 
        Return EXACTLY a valid JSON array of 3 strings: ["q1", "q2", "q3"]`;
        
        const res = await this.callGeminiRawText(prompt);
        const data = await this.parseAndValidateJSON<string[]>(
            res,
            (val) => Array.isArray(val) && val.length === 3 && val.every(q => typeof q === 'string')
        );
        return data || [];
    }

    // Edge function wrappers
    private async callGeminiRawText(prompt: string): Promise<string> {
        try {
            const { data, error } = await supabase.functions.invoke('gemini-server', {
                body: { prompt, temperature: 0.7 }
            });
            if (error) throw error;
            return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
        } catch (err) { 
            console.error('[AIService] callGeminiRawText error:', err);
            return 'AI Server unavailable'; 
        }
    }
}

export const aiService = new AIService();
