import { Registo } from "../types";
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
      content: `Aqui estão alguns dados do utilizador (formato JSON):\n${JSON.stringify(registos.slice(0, 20), null, 2)}\n\nCria 10 insights em bullet points acerca destes dados. Cada insight deve ser claro e explicativo.`,
    },
  ];

  try {
    const resposta = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // "HTTP-Referer": "https://glicosleep.app", // Podes ativar depois se necessário
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: mensagens,
        temperature: 0.7,
         max_tokens: 600, // reduzido para evitar respostas longas
      }),
    });

    const data = await resposta.json();
    console.log("Resposta OpenRouter:", data); // 🐞 Debug

    const conteudo = data.choices?.[0]?.message?.content;

    if (!conteudo) return ["Não foi possível criar insights neste momento."];

    return conteudo
      .split("\n")
      .map((linha: string) => linha.trim())
      .filter((linha: string) => linha.length > 0);
  } catch (err) {
    console.error("❌ Erro ao contactar o OpenRouter:", err);
    return ["Erro ao gerar insights com IA."];
  }
}
