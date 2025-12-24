
import { GoogleGenAI, Type } from "@google/genai";
import { AiGeneratedItem } from "../types";
import { generateLocalMenu } from "./localGenerator";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateMenuStructure = async (description: string): Promise<AiGeneratedItem[]> => {
  if (!process.env.API_KEY || process.env.API_KEY === 'undefined') {
    await sleep(1200);
    return generateLocalMenu(description);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Vytvor luxusnú štruktúru webového menu pre: ${description}. Jazyk: Slovenčina.`,
      config: {
        thinkingConfig: { thinkingBudget: 16384 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              description: { type: Type.STRING },
              price: { type: Type.STRING },
              url: { type: Type.STRING }
            },
            required: ["label", "url"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    return generateLocalMenu(description);
  }
};

export const translateMenuItem = async (text: string, targetLang: string): Promise<string> => {
  if (!process.env.API_KEY || process.env.API_KEY === 'undefined') return text;
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Prelož nasledujúci gastronomický text do jazyka ${targetLang}. Zachovaj luxusný tón: "${text}"`,
    });
    return response.text?.trim() || text;
  } catch (e) { return text; }
};

export const generateDishDescription = async (dishName: string): Promise<string> => {
  if (!process.env.API_KEY || process.env.API_KEY === 'undefined') return "Gastronomický zážitok.";
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Vytvor krátky luxusný popis pre jedlo: ${dishName}. Max 12 slov. Jazyk: Slovenčina.`,
    });
    return response.text || "Exkluzívna špecialita.";
  } catch (e) { return "Exkluzívna špecialita."; }
};

export const recommendWinePairing = async (dishName: string, description: string): Promise<string> => {
  if (!process.env.API_KEY || process.env.API_KEY === 'undefined') return "Odporúčame archívne suché víno.";
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Si expert someliér. K jedlu "${dishName}" (popis: ${description}) odporuč jedno konkrétne víno a uveď aj jeden chuťový tón. Max 10 slov. Jazyk: Slovenčina.`,
    });
    return response.text?.replace(/[".]/g, '') || "Someliér odporúča Chardonnay s tónmi citrusov.";
  } catch (e) { return "Odporúčame biele suché víno."; }
};

export const generateDishImage = async (label: string, description: string): Promise<string | undefined> => {
  if (!process.env.API_KEY || process.env.API_KEY === 'undefined') return undefined;
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `High-end gourmet food photography of: ${label}. ${description}. Minimalist, elegant, restaurant lighting, 4k resolution, professional styling.` }]
      }
    });
    
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (e) {
    console.error("Image generation failed", e);
  }
  return undefined;
};
