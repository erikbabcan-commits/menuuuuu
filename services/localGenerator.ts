
import { AiGeneratedItem } from "../types";

const LOCAL_PRESETS: Record<string, AiGeneratedItem[]> = {
  "fine dining": [
    { label: "Degustačné Menu", url: "#tasting", children: [
      { label: "Amuse-bouche", url: "#" },
      { label: "Hrebenatky s kaviárom", url: "#" },
      { label: "Srnčí chrbát", url: "#" }
    ]},
    { label: "Vínna Karta", url: "#wines", children: [
      { label: "Biele vína", url: "#" },
      { label: "Červené vína", url: "#" },
      { label: "Dezertné vína", url: "#" }
    ]},
    { label: "Rezervácie", url: "/booking" }
  ],
  "bistro": [
    { label: "Denná Ponuka", url: "#daily", children: [
      { label: "Polievka dňa", url: "#" },
      { label: "Hlavné jedlo", url: "#" }
    ]},
    { label: "Stála Ponuka", url: "#menu", children: [
      { label: "Domáce cestoviny", url: "#" },
      { label: "Street food špeciál", url: "#" }
    ]},
    { label: "Kontakt", url: "#contact" }
  ],
  "cafe": [
    { label: "Káva & Čaj", url: "#drinks", children: [
      { label: "Espresso Selection", url: "#" },
      { label: "Signature Latté", url: "#" },
      { label: "Sypané čaje", url: "#" }
    ]},
    { label: "Dezerty", url: "#sweets", children: [
      { label: "Torty", url: "#" },
      { label: "RAW koláče", url: "#" }
    ]},
    { label: "Raňajky", url: "#breakfast" }
  ]
};

export const generateLocalMenu = (prompt: string): AiGeneratedItem[] => {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes("fine") || lowerPrompt.includes("luxus")) return LOCAL_PRESETS["fine dining"];
  if (lowerPrompt.includes("cafe") || lowerPrompt.includes("káva") || lowerPrompt.includes("ranajky")) return LOCAL_PRESETS["cafe"];
  if (lowerPrompt.includes("bistro") || lowerPrompt.includes("jedlo")) return LOCAL_PRESETS["bistro"];
  
  // Default fallback if no keywords match
  return [
    { label: "Domov", url: "/" },
    { label: "Menu", url: "#menu", children: [{ label: "Ukážka", url: "#" }] },
    { label: "O nás", url: "#about" },
    { label: "Kontakt", url: "#contact" }
  ];
};
