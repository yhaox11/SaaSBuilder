import { GoogleGenAI, Type, Chat } from "@google/genai";
import { DashboardMetrics, AIAnalysisResponse } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Initialize a chat session with system instructions suitable for a SaaS assistant
export const createChatSession = (metricsContext?: string): Chat => {
  if (!apiKey) {
    console.warn("Gemini API Key is missing for chat.");
  }
  
  const baseInstruction = `
    Atue como um CFO e Estrategista de Dados Sênior para este SaaS Enterprise.
    Seu objetivo é fornecer respostas diretas, analíticas e funcionais.

    REGRAS RÍGIDAS DE RESPOSTA:
    1. ZERO PREENCHIMENTO: NUNCA inicie respostas com "Com certeza", "Claro", "Entendi", "Olá", "Como modelo de linguagem" ou "Baseado nos dados". Comece respondendo a pergunta imediatamente.
    2. OBJETIVIDADE: Se o usuário perguntar um número, entregue o número e uma breve análise de contexto. Não conte a história da empresa a menos que perguntado.
    3. NÃO SEJA ROBÓTICO: Evite padrões repetitivos como "Para otimizar X, sugiro Y". Varie a estrutura das frases. Fale como um executivo conversando com outro executivo.
    4. CONTEXTO INTELIGENTE: Use os dados fornecidos, mas não os vomite de volta para o usuário a menos que sirva para embasar um argumento.
    5. IDIOMA: Responda estritamente em Português do Brasil.
  `;
  
  const formattingInstruction = `
    FORMATAÇÃO:
    - Use **negrito** para destacar KPIs e números importantes.
    - Use listas (* item) apenas quando houver 3 ou mais pontos de ação.
    - Seja conciso.
  `;

  const contextInstruction = metricsContext 
    ? `\n\nDADOS ATUAIS (Use para análise factual):\n${metricsContext}`
    : "";
  
  return ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: baseInstruction + formattingInstruction + contextInstruction,
      temperature: 0.6, // Slightly lower temperature for more focused/professional answers
    },
  });
};

export const analyzeBusinessMetrics = async (metrics: DashboardMetrics): Promise<AIAnalysisResponse> => {
  if (!apiKey) {
    console.warn("Gemini API Key is missing.");
    return {
      insight: "API Key missing. Please configure your Google Cloud API Key to receive AI insights.",
      recommendation: "Check your environment variables.",
      riskLevel: "low"
    };
  }

  const prompt = `
    Atue como um analista de dados Sênior. Analise as métricas abaixo e forneça um resumo executivo direto, uma recomendação estratégica e o nível de risco.
    Responda em Português do Brasil. Seja curto e grosso.

    Metrics:
    - Total Revenue: $${metrics.totalRevenue}
    - Revenue Growth (MoM): ${metrics.revenueGrowth}%
    - Average Ticket: $${metrics.averageTicket}
    - New Customers: ${metrics.newCustomers}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insight: { type: Type.STRING, description: "Resumo executivo direto da performance (max 20 palavras)." },
            recommendation: { type: Type.STRING, description: "Uma ação estratégica concreta." },
            riskLevel: { type: Type.STRING, description: "Assessment of business risk: low, medium, or high." }
          },
          required: ["insight", "recommendation", "riskLevel"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AIAnalysisResponse;
    }
    throw new Error("No response text generated");

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return {
      insight: "Unable to analyze data at this moment.",
      recommendation: "Please try again later.",
      riskLevel: "low"
    };
  }
};