
import { GoogleGenAI, Type } from "@google/genai";
import { AiGeneratedItem, MenuItem } from "../types";
import { generateLocalMenu } from "./localGenerator";

const cleanJson = (text: string): string => {
  if (!text) return "[]";
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(json)?\n?/, "").replace(/\n?```$/, "");
  }
  return cleaned;
};

// Simulated delay for better UX (perceived intelligence)
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateMenuStructure = async (description: string): Promise<AiGeneratedItem[]> => {
  // If no API key, use Local Generator
  if (!process.env.API_KEY || process.env.API_KEY === 'undefined') {
    await sleep(1200); // Realistic local feel
    return generateLocalMenu(description);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = "gemini-3-flash-preview";
    
    const response = await ai.models.generateContent({
      model,
      contents: `Generate a luxury website menu structure for: ${description}. 
      Target audience: High-end clientele. 
      Language: Slovak.
      Return a JSON array of objects with 'label', 'url', and optional 'children' array.`,
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
    if (!text) return generateLocalMenu(description);
    
    return JSON.parse(cleanJson(text)) as AiGeneratedItem[];
  } catch (error) {
    console.warn("Gemini API error, falling back to local generator:", error);
    return generateLocalMenu(description);
  }
};

export const optimizeMenuStructure = async (items: MenuItem[]): Promise<MenuItem[]> => {
  if (!process.env.API_KEY || process.env.API_KEY === 'undefined') return items;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = "gemini-3-flash-preview";
    const itemsJson = JSON.stringify(items.map(({ id, label, url, depth }) => ({ id, label, url, depth })));
    
    const response = await ai.models.generateContent({
      model,
      contents: `Reorder these menu items for better UX. Keep original IDs. Language: Slovak. Input: ${itemsJson}`,
      config: { responseMimeType: "application/json" }
    });

    const text = response.text;
    if (!text) return items;

    const reorderedSimple = JSON.parse(cleanJson(text)) as {id: string}[];
    const itemMap = new Map(items.map(i => [i.id, i]));
    return reorderedSimple.map(s => itemMap.get(s.id)).filter(Boolean) as MenuItem[];
  } catch (e) {
    return items;
  }
};
