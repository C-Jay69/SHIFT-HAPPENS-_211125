import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY || '' });

export const generateRestaurantAssistantResponse = async (
  prompt: string,
  contextData: string,
  systemInstructionOverride?: string
): Promise<string> => {
  try {
    const modelId = 'gemini-1.5-flash';

    const defaultSystemInstruction = `
      You are "ShiftBot", the AI Operations Assistant for "SHIFT HAPPENS!".
      Your tone is professional, efficient, but slightly witty.
      
      Real-time Context:
      ${contextData}

      Rules:
      1. Keep answers under 100 words unless a detailed report is requested.
      2. If suggesting items, only suggest things that exist in the menu.
      3. Format output clearly using Markdown where helpful.
    `;

    const finalSystemInstruction = systemInstructionOverride || defaultSystemInstruction;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: finalSystemInstruction,
      },
    });

    return response.text || "I'm having trouble processing that right now.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I couldn't connect to the AI brain. Make sure your GEMINI_API_KEY is set.";
  }
};
