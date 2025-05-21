import { Registo } from "../types";
import Constants from "expo-constants";

export async function gerarOpenRouterInsights(registos: Registo[]): Promise<string[]> {
  const apiKey = Constants.expoConfig?.extra?.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("🔑 API key do Gemini não encontrada.");
    return ["Erro: Chave de API não configurada."];
  }

  const mensagens = [
    {
      role: "user",
      parts: [
        {
          text:
            `És um assistente de saúde inteligente. Avalia os dados da semana do utilizador com foco em glicose, sono, alimentação e medicação. Analisa padrões, correlações e dá sugestões práticas. Dados em JSON:\n\n${JSON.stringify(
              registos.filter((r) => r.data >= getDataUltimos7Dias()),
              null,
              2
            )}\n\nGera exatamente 8 insights (2 por categoria: glicose, sono, comida, medicamentos). Usa linguagem clara.`,
        },
      ],
    },
  ];

  try {
    const resposta = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + apiKey, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ contents: mensagens }),
    });

    const data = await resposta.json();
    const conteudo = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!conteudo) return ["Não foi possível gerar insights neste momento."];

    return conteudo
      .split("\n")
      .map((linha: string) => linha.trim())
      .filter((linha: string) => linha.length > 0);
  } catch (err) {
    console.error("❌ Erro ao contactar o Gemini:", err);
    return ["Erro ao gerar insights com IA."];
  }
}

function getDataUltimos7Dias(): string {
  const hoje = new Date();
  hoje.setDate(hoje.getDate() - 6); // últimos 7 dias incluindo hoje
  return hoje.toISOString().split("T")[0];
}