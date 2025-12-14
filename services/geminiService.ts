import { GoogleGenAI, Type } from "@google/genai";
import { AiGeneratedItem } from "../types";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMenuStructure = async (description: string): Promise<AiGeneratedItem[]> => {
  try {
    const model = "gemini-2.5-flash";
    
    const response = await ai.models.generateContent({
      model,
      contents: `Generate a website menu structure for: ${description}. 
      The menu should be realistic and organized. 
      Return a JSON array of objects. Each object has a 'label', 'url', and optional 'children' array.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              url: { type: Type.STRING },
              children: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    url: { type: Type.STRING }
                  },
                  required: ["label", "url"]
                }
              }
            },
            required: ["label", "url"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    const data = JSON.parse(text) as AiGeneratedItem[];
    return data;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};