import { GoogleGenAI, Type } from "@google/genai";
import { AiGeneratedItem, MenuItem } from "../types";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to clean potential markdown formatting from JSON response
const cleanJson = (text: string): string => {
  if (!text) return "[]";
  let cleaned = text.trim();
  // Remove markdown code blocks if present
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(json)?\n?/, "").replace(/\n?```$/, "");
  }
  return cleaned;
};

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
    
    const cleanedText = cleanJson(text);
    const data = JSON.parse(cleanedText) as AiGeneratedItem[];
    return data;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const optimizeMenuStructure = async (items: MenuItem[], goal: 'conversion' | 'ux' = 'ux'): Promise<MenuItem[]> => {
  try {
    const model = "gemini-2.5-flash";
    const itemsJson = JSON.stringify(items.map(({ id, label, url, depth }) => ({ id, label, url, depth })));
    
    const prompt = `
      Analyze this menu structure and reorder the items to optimize for ${goal === 'conversion' ? 'sales and conversion (put high value items first)' : 'user experience and logic'}.
      Do not change labels or URLs, only change the order. Maintain the depth/hierarchy logic (children must follow parents).
      Return the exact same JSON list but reordered.
      Input: ${itemsJson}
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              label: { type: Type.STRING },
              url: { type: Type.STRING },
              depth: { type: Type.NUMBER }
            },
            required: ["id", "label", "depth"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return items;

    const cleanedText = cleanJson(text);
    const reorderedSimple = JSON.parse(cleanedText) as {id: string}[];
    
    // Merge logic to restore original item properties (like icons)
    const itemMap = new Map(items.map(i => [i.id, i]));
    const reorderedItems: MenuItem[] = [];
    
    reorderedSimple.forEach(simple => {
      const original = itemMap.get(simple.id);
      if (original) {
        reorderedItems.push(original);
      }
    });

    // If AI dropped items, append missing ones to end (safety)
    items.forEach(item => {
      if (!reorderedItems.find(r => r.id === item.id)) {
        reorderedItems.push(item);
      }
    });

    return reorderedItems;

  } catch (error) {
    console.error("Gemini Optimization Error:", error);
    return items;
  }
}