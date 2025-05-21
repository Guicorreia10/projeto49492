import { Registo } from "../types";
import Constants from "expo-constants";

function getTopNByTipo(registos: Registo[], n: number): Registo[] {
  const tipos = ["glicose", "sono", "comida", "medicamento", "smartwatch_sono", "smartwatch_passos", "smartwatch_exercicio"];
  let selecionados: Registo[] = [];

  for (const tipo of tipos) {
    const filtrados = registos
      .filter((r) => r.tipo === tipo)
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      .slice(0, n);
    selecionados = selecionados.concat(filtrados);
  }

  return selecionados;
}

export async function gerarOpenRouterInsights(registos: Registo[]): Promise<string[]> {
  const apiKey = Constants.expoConfig?.extra?.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.warn(" API key do OpenRouter não encontrada.");
    return ["Erro: Chave de API não configurada."];
  }

  // Limitar registos (3 por tipo, máx 21)
  const dadosFiltrados = getTopNByTipo(registos, 3);
  console.log("📤 Dados enviados para IA:", JSON.stringify(dadosFiltrados, null, 2));

  const mensagens = [
    {
      role: "system",
      content:
        "És um assistente de saúde inteligente. Com base nos registos fornecidos (sono, glicose, alimentação, medicamentos), gera insights personalizados e úteis. Foca-te em padrões, correlações e sugestões realistas. Fala sempre em português de Portugal.",
    },
    {
      role: "user",
      content: `Aqui estão os dados do utilizador (JSON):\n${JSON.stringify(dadosFiltrados, null, 2)}\n\nCria 5 insights personalizados em bullet points. Dá pelo menos um insight sobre cada tipo de registo: glicose, sono, alimentação, medicamentos.`,
    },
  ];

  try {
    const resposta = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://glicosleep.app",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: mensagens,
        temperature: 0.7,
        max_tokens: 400,
      }),
    });

    const data = await resposta.json();
    console.log("🤖 Resposta da IA:", JSON.stringify(data, null, 2));

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
