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

    // --- NEW MODULE 1: AI Auto-Profile/Resume Builder ---
    async generateProfessionalBio(role: string, category: string, experience: string): Promise<string> {
        if (!GEMINI_API_KEY) return `I am a skilled ${category} with ${experience} of experience.`;
        
        const prompt = `Write a highly professional, 2-to-3 sentence bio for a ${role} seeking work in ${category} with ${experience} experience. Tone: Confident, reliable, local to Pune/Hinjewadi. No emojis. Output strictly the text string.`;
        return this.callGeminiRawText(prompt);
    }

    // --- NEW MODULE 2: AI Smart Job Matcher ---
    async evaluateJobMatch(userSkills: string[], jobDescription: string): Promise<{ score: number, feedback: string }> {
        if (!GEMINI_API_KEY) return { score: 85, feedback: "Good match based on broad category." };
        
        const prompt = `Compare these user skills: [${userSkills.join(', ')}] against this Job: "${jobDescription}". 
        Return EXACTLY a valid JSON object matching: { "score": number (0-100), "feedback": "Short 1-sentence explanation of the strength or missing skill" }`;
        const json = await this.callGeminiJSON(prompt);
        return json || { score: 50, feedback: "Analysis unavailable" };
    }

    // --- NEW MODULE 3: AI Fraud & Spam Detector ---
    async detectFraudOrSpam(title: string, description: string): Promise<{ isSuspicious: boolean, reason: string }> {
        if (!GEMINI_API_KEY) return { isSuspicious: false, reason: "" };
        
        const prompt = `Analyze this listing for potential scams (e.g. asking for money upfront, fake URLs, weird formatting, unrealistic salaries/rent):
        Title: ${title} | Desc: ${description}
        Return EXACTLY a valid JSON object matching: { "isSuspicious": boolean, "reason": "Short reason if true, else empty string" }`;
        return await this.callGeminiJSON(prompt) || { isSuspicious: false, reason: "" };
    }

    // --- NEW MODULE 4: AI Fair Rent Estimator ---
    async estimateFairRent(area: string, type: string, furnishing: string): Promise<{ estimate: number, advice: string }> {
        if (!GEMINI_API_KEY) return { estimate: 0, advice: "Consult local brokers." };
        
        const prompt = `Estimate the fair monthly rent in INR for a ${furnishing} ${type} in ${area}, Hinjewadi, Pune.
        Return EXACTLY a valid JSON object matching: { "estimate": number (exact integer estimate), "advice": "1 short sentence of negotiation advice" }`;
        return await this.callGeminiJSON(prompt) || { estimate: 0, advice: "Data unavilable" };
    }

    // --- NEW MODULE 5: AI Dynamic Translator ---
    async translateListing(text: string, langCode: 'hi' | 'mr'): Promise<string> {
        if (!GEMINI_API_KEY) return text;
        const target = langCode === 'hi' ? 'Hindi' : 'Marathi';
        const prompt = `Translate the following text into natural ${target}. Return ONLY the translated string, nothing else: "${text}"`;
        return this.callGeminiRawText(prompt);
    }

    // --- NEW MODULE 6: AI Interview Prep ---
    async generateInterviewQuestions(jobCategory: string): Promise<string[]> {
        if (!GEMINI_API_KEY) return ["Tell me about yourself.", "Why should we hire you?"];
        
        const prompt = `Generate exactly 3 common interview/screening questions for a ${jobCategory} role. 
        Return EXACTLY a valid JSON array of 3 strings: ["q1", "q2", "q3"]`;
        const data = await this.callGeminiJSON(prompt);
        return Array.isArray(data) ? data : [];
    }

    // --- HELPER CLASSES FOR CLEAN API CALLS ---
    private async callGeminiRawText(prompt: string): Promise<string> {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=\${GEMINI_API_KEY}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7 } })
            });
            const result = await response.json();
            return result.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
        } catch { return ''; }
    }

    private async callGeminiJSON(prompt: string): Promise<any> {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=\${GEMINI_API_KEY}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.1 } })
            });
            const result = await response.json();
            const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const cleanJson = rawText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
            return JSON.parse(cleanJson);
        } catch { return null; }
    }
}

export const aiService = new AIService();
