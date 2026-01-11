import { GoogleGenAI } from "@google/genai";
import { BusinessLead } from "../types";

const apiKey = (process.env.API_KEY || '').trim();
const ai = new GoogleGenAI({ apiKey });

// Helper to robustly extract JSON array from potentially messy text
const cleanJsonString = (str: string) => {
  // 1. Remove markdown code blocks if present
  let cleaned = str.replace(/```json\n?|```/g, '');
  
  // 2. Find the first '[' and last ']' to ignore conversational text
  const firstOpen = cleaned.indexOf('[');
  const lastClose = cleaned.lastIndexOf(']');
  
  if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
    cleaned = cleaned.substring(firstOpen, lastClose + 1);
  }
  
  return cleaned.trim();
};

export const searchBusinesses = async (
  state: string, 
  city: string, 
  niche: string
): Promise<BusinessLead[]> => {
  if (!apiKey || apiKey === 'undefined' || apiKey.length < 10) {
    console.error("API Key missing or invalid");
    throw new Error("Chave de API do Google não configurada ou inválida.");
  }

  // Maps Grounding requires gemini-2.5 series
  const model = "gemini-2.5-flash";
  
  const prompt = `
    Atue como um sistema de API estrito.
    Tarefa: Listar 20 estabelecimentos do nicho "${niche}" em ${city}, ${state}, Brasil.
    
    Ferramentas: Use o Google Maps para validar nomes e endereços reais.

    REGRAS DE FORMATAÇÃO (CRÍTICO):
    1. Retorne APENAS o JSON puro. Não use markdown. Não escreva "Aqui está a lista".
    2. O formato deve ser um ARRAY DE OBJETOS válido (iniciando com '[' e terminando com ']').
    3. Use aspas duplas (") para todas as chaves e valores string.
    4. Certifique-se de não deixar vírgulas sobrando no final de objetos ou arrays.

    Estrutura do JSON:
    [
      {
        "name": "Nome do Local",
        "address": "Endereço Completo",
        "rating": 4.5,
        "phone": "(11) 99999-9999",
        "website": "https://site.com"
      }
    ]
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        maxOutputTokens: 4000,
        temperature: 0.1, // Reduzido para garantir conformidade estrita com o formato
      }
    });

    const text = response.text;
    if (!text) throw new Error("A IA não retornou texto.");

    const cleanedText = cleanJsonString(text);
    
    try {
        const rawData = JSON.parse(cleanedText);
        
        if (!Array.isArray(rawData)) {
            throw new Error("Formato de resposta inválido (não é array).");
        }

        return rawData.map((item: any, index: number) => ({
        id: `lead-${Date.now()}-${index}`,
        name: item.name || "Negócio Desconhecido",
        address: item.address || "Endereço não disponível",
        rating: typeof item.rating === 'number' ? item.rating : null,
        phone: item.phone || null,
        website: item.website || null,
        status: 'new'
        }));
    } catch (parseError) {
        console.error("JSON Parse Error:", parseError, "Cleaned Text:", cleanedText);
        throw new Error("Falha ao processar a estrutura de dados retornada pela IA. Tente novamente.");
    }

  } catch (error: any) {
    console.error("Error fetching places:", error);
    
    if (error.message?.includes("API key not valid") || error.status === 400) {
        throw new Error("Chave de API inválida. Verifique suas configurações.");
    }
    if (error.status === 429) {
        throw new Error("Cota de requisições excedida. Tente novamente mais tarde.");
    }

    throw error;
  }
};