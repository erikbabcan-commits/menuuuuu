
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AiGeneratedItem } from "../types";
import { generateLocalMenu } from "./localGenerator";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generuje štruktúru menu s využitím pokročilého uvažovania (Thinking).
 */
export const generateMenuStructure = async (description: string): Promise<AiGeneratedItem[]> => {
  if (!process.env.API_KEY || process.env.API_KEY === 'undefined') {
    await sleep(1200);
    return generateLocalMenu(description);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Vytvor luxusnú štruktúru webového menu pre: ${description}. Jazyk: Slovenčina. Zameraj sa na modernú gastronómiu.`,
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
              type: { type: Type.STRING, enum: ["dish", "section"] }
            },
            required: ["label", "url", "type"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Structure generation failed", error);
    return generateLocalMenu(description);
  }
};

/**
 * Vyhľadá aktuálne gastronomické trendy pomocou Google Search Grounding.
 */
export const getGastronomyTrends = async (query: string) => {
  if (!process.env.API_KEY || process.env.API_KEY === 'undefined') return { text: "Trendy nie sú dostupné offline.", sources: [] };
  
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Aké sú aktuálne trendy v gastronómii pre dopyt: ${query}? Uveď konkrétne príklady jedál alebo surovín.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title,
      uri: chunk.web?.uri
    })).filter((c: any) => c.uri) || [];

    return {
      text: response.text,
      sources: sources
    };
  } catch (e) {
    return { text: "Nepodarilo sa načítať trendy.", sources: [] };
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
        parts: [{ text: `Luxurious gourmet food photography of: ${label}. Description: ${description}. Elegant lighting, bokeh background, macro lens, restaurant setting, high contrast, warm tones.` }]
      },
      config: {
        imageConfig: { aspectRatio: "1:1" }
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

export const generateMenuAudio = async (text: string): Promise<string | undefined> => {
  if (!process.env.API_KEY || process.env.API_KEY === 'undefined') return undefined;
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (e) {
    console.error("Audio generation failed", e);
    return undefined;
  }
};
