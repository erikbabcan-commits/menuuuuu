import { GoogleGenAI, Type } from "@google/genai";
import { AiGeneratedItem } from "../types";
import { generateLocalMenu } from "./localGenerator";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generuje štruktúru menu pomocou Gemini 3 Pro s hlbokým uvažovaním.
 */
export const generateMenuStructure = async (description: string): Promise<AiGeneratedItem[]> => {
  if (!process.env.API_KEY || process.env.API_KEY === 'undefined') {
    await sleep(1200);
    return generateLocalMenu(description);
  }

  try {
    // Inicializácia priamo vo funkcii pre zabezpečenie aktuálneho kľúča
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Vytvor luxusnú štruktúru webového menu pre: ${description}. 
      Zameraj sa na prémiovú gastronómiu. Jazyk: Slovenčina.
      Vráť pole objektov s 'label', 'description' (Michelin štýl), 'price' (formát napr. 24€), 'url' a voliteľným polom 'children'.`,
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
              url: { type: Type.STRING },
              children: {
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
            },
            required: ["label", "url"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return generateLocalMenu(description);
    return JSON.parse(text) as AiGeneratedItem[];
  } catch (error) {
    console.error("Gemini Structure Generation Error:", error);
    return generateLocalMenu(description);
  }
};

/**
 * Generuje luxusný popis jedla pomocou Gemini 3 Flash.
 */
export const generateDishDescription = async (dishName: string): Promise<string> => {
  if (!process.env.API_KEY || process.env.API_KEY === 'undefined') {
    return "Exkluzívna špecialita pripravená z najčerstvejších surovín pod dohľadom nášho šéfkuchára.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Vytvor jeden krátky, poetický a luxusný popis pre jedlo: ${dishName}. Maximálne 12 slov. Jazyk: Slovenčina.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING }
          },
          required: ["description"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result.description || "Gastronomický zážitok spájajúci tradíciu s modernou technikou.";
  } catch (e) {
    console.error("Gemini Description Generation Error:", e);
    return "Gastronomický zážitok spájajúci tradíciu s modernou technikou.";
  }
};