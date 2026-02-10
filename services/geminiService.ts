
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// getGeminiResponse handles counseling queries for the Akbar Khan Institute.
export const getGeminiResponse = async (prompt: string) => {
  try {
    // Initializing with the API key from environment variables. Direct access to process.env.API_KEY.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are an AI Counselor for the Akbar Khan Technical and Vocational Institute (Regd. TTB). This institute provides FREE training for underprivileged women. Your goal is to help them choose between these courses: Fashion Designing, MS Office, Digital Marketing, Graphics Designing, IELTS, Beautician, Lady Tailoring, and First Aid. Be supportive, empowering, and use simple language."
      }
    });
    // The extracted generated text is accessed via the .text property (not a method).
    return response.text || "I'm having a little trouble thinking of a response right now. Please try again or visit our admission office!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm having a little trouble connecting right now. Please try again or visit our admission office!";
  }
};
