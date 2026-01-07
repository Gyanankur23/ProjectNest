
import { GoogleGenAI } from "@google/genai";

// Use Replit AI Integrations environment variables
const apiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY || "dummy";
const baseUrl = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL;

const genAI = new GoogleGenAI({
  apiKey,
  httpOptions: {
    apiVersion: "",
    baseUrl,
  },
});

export async function getGeminiResponse(prompt: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback or rethrow
    return `[AI Generation Error: ${error instanceof Error ? error.message : String(error)}]`;
  }
}
