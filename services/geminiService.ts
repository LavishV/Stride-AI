
import { GoogleGenAI, Type } from "@google/genai";
import { AppState, Task } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Simple cache to prevent hitting rate limits (429)
const cache = {
  get: (key: string) => {
    const item = localStorage.getItem(`scholar_cache_${key}`);
    if (!item) return null;
    const parsed = JSON.parse(item);
    if (Date.now() > parsed.expiry) {
      localStorage.removeItem(`scholar_cache_${key}`);
      return null;
    }
    return parsed.data;
  },
  set: (key: string, data: any, ttlMs: number) => {
    localStorage.setItem(`scholar_cache_${key}`, JSON.stringify({
      data,
      expiry: Date.now() + ttlMs
    }));
  }
};

export const geminiService = {
  async getMotivationalQuote(): Promise<{ quote: string; author: string }> {
    const cached = cache.get('daily_quote');
    if (cached) return cached;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Generate a powerful, science-backed motivational quote for a student today. Focus on consistency and behavioral psychology. Return JSON format with fields 'quote' and 'author'.",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              quote: { type: Type.STRING },
              author: { type: Type.STRING }
            },
            required: ["quote", "author"]
          }
        }
      });
      const data = JSON.parse(response.text || '{"quote": "Progress is not linear.", "author": "ScholarSync"}');
      // Cache for 12 hours
      cache.set('daily_quote', data, 12 * 60 * 60 * 1000);
      return data;
    } catch (e) {
      console.warn("API limit reached, using fallback quote.");
      return { quote: "Your focus determines your reality.", author: "ScholarSync" };
    }
  },

  async breakdownHardTask(task: Task): Promise<string[]> {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Break down this hard academic task: "${task.title} - ${task.description}". Provide exactly 4 manageable, atomic sub-tasks that reduce cognitive friction. Return as a JSON array of strings.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      return JSON.parse(response.text || '[]');
    } catch (e) {
      return ["Focus on the first 15 minutes", "Gather all materials", "Outline the core steps", "Review previous work"];
    }
  },

  async getBehavioralInsight(state: AppState): Promise<string> {
    const cacheKey = `insight_${state.username}_${state.tasks.filter(t => t.status === 'completed').length}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    const completionRate = (state.tasks.filter(t => t.status === 'completed').length / (state.tasks.length || 1)) * 100;
    const avgMood = state.moodLogs.length > 0 ? state.moodLogs.reduce((acc, log) => acc + log.score, 0) / state.moodLogs.length : 3;

    const context = `
      User: ${state.username}
      Current Task Completion: ${completionRate.toFixed(0)}%
      Recent Average Mood: ${avgMood.toFixed(1)}/5
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze user context: ${context}. Provide ONE short behavioral hack (15 words max). Focus on science-backed productivity.`,
      });
      const text = response.text || "Small wins build big momentum. Keep going.";
      // Cache for 1 hour to avoid spamming the API
      cache.set(cacheKey, text, 60 * 60 * 1000);
      return text;
    } catch (e) {
      return "Rate limit reached. Focus on one small win for now.";
    }
  }
};
