import { Registo } from "../types"; // ou ajusta o path conforme necessário
import Constants from "expo-constants";


export async function gerarOpenRouterInsights(registos: Registo[]): Promise<string[]> {
 
  const apiKey = Constants.expoConfig?.extra?.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.warn("🔑 API key do OpenRouter não encontrada.");
    return ["Erro: Chave de API não configurada."];
  }

  const mensagens = [
    {
      role: "system",
      content:
        "És um assistente de saúde inteligente. Com base nos registos fornecidos (sono, glicose, alimentação, medicamentos), gera insights personalizados, curtos e úteis para melhorar a saúde metabólica do utilizador. Foca-te em padrões, correlações e sugestões realistas.",
    },
    {
      role: "user",
      content: `Aqui estão os dados do utilizador (formato JSON):\n${JSON.stringify(registos, null, 2)}\n\nGera entre 3 a 5 insights personalizados em bullet points.`,
    },
  ];

  try {
    const resposta = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
  Authorization: `Bearer ${apiKey}`,
  "Content-Type": "application/json",
  "HTTP-Referer": "https://teu-site-ou-app.com", // opcional
},

      body: JSON.stringify({
        model: "gpt-3.5-turbo", // ou outro modelo disponível via OpenRouter
        messages: mensagens,
        temperature: 0.7,
      }),
    });

    const data = await resposta.json();

    const conteudo = data.choices?.[0]?.message?.content;

    if (!conteudo) return ["Não foi possível gerar insights neste momento."];

    return conteudo.split("\n").filter((linha: string) => linha.trim().length > 0);
  } catch (err) {
    console.error("Erro ao contactar o OpenRouter:", err);
    return ["Erro ao gerar insights com IA."];
  }
}
