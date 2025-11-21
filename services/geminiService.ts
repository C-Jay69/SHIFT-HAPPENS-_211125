import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini API client
// Note: In a real production build, this key would be securely managed. 
// The prompt context relies on process.env.API_KEY being available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || 'dummy_key' });

export const generateRestaurantAssistantResponse = async (
  prompt: string,
  contextData: string,
  systemInstructionOverride?: string
): Promise<string> => {
  try {
    const modelId = 'gemini-2.5-flash'; 
    
    const defaultSystemInstruction = `
      You are "ShiftBot", the AI Operations Assistant for a busy restaurant called "SHIFT HAPPENS!".
      Your tone is professional, efficient, but slightly witty.
      
      You have access to the following real-time context about the restaurant:
      ${contextData}

      Your capabilities:
      1. Answer questions about current inventory levels.
      2. Suggest recipes based on menu items.
      3. Draft responses to guest reviews (simulate this).
      4. Provide advice on handling operational conflicts.

      Keep answers concise (under 150 words) unless asked for a detailed report.
      Format your response with Markdown if helpful.
    `;

    // Use override if provided, otherwise default
    let finalSystemInstruction = systemInstructionOverride || defaultSystemInstruction;
    
    // Append context data if it wasn't included in the override (simple check)
    if (systemInstructionOverride && !systemInstructionOverride.includes("real-time context")) {
        finalSystemInstruction += `\n\nReal-time Context:\n${contextData}`;
    } else if (!systemInstructionOverride) {
        // Default already has the placeholder, but we need to ensure contextData is injected if we didn't use the template literal above
        // Actually, the default variable above uses the template literal.
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction: finalSystemInstruction,
        thinkingConfig: { thinkingBudget: 0 }, // Low latency for chat
      },
    });

    return response.text || "I'm having trouble processing that request right now.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I couldn't connect to the AI brain. Please check your network or API key.";
  }
};