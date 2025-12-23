
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateRestaurantAssistantResponse = async (
  prompt: string,
  contextData: string,
  systemInstructionOverride?: string
): Promise<string> => {
  try {
    // Using the recommended model for basic text/reasoning tasks
    const modelId = 'gemini-3-flash-preview'; 
    
    const defaultSystemInstruction = `
      You are "ShiftBot", the AI Operations Assistant for "SHIFT HAPPENS!".
      Your tone is professional and efficient.
      
      Real-time Context:
      ${contextData}

      Rules:
      1. Keep answers under 100 words.
      2. If suggesting items, only suggest things that exist in the menu.
      3. Format output clearly.
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
    return "Sorry, I couldn't connect to the AI brain.";
  }
};
