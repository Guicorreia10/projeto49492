import { Registo } from "../types";
import Constants from "expo-constants";

function getTopNByTipo(registos: Registo[], n: number): Registo[] {
  const tipos = [
    "glicose",
    "sono",
    "comida",
    "medicamento",
    "smartwatch_sono",
    "smartwatch_passos",
    "smartwatch_exercicio",
  ];
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
    console.warn("API key do OpenRouter não encontrada.");
    return [" Erro: Chave de API não configurada."];
  }

  const dadosFiltrados = getTopNByTipo(registos, 3);
  console.log(" Dados enviados para IA:", JSON.stringify(dadosFiltrados, null, 2));

  const mensagens = [
    {
      role: "system",
      content: `És um assistente de saúde digital inteligente. Com base nos registos fornecidos (glicose, sono, alimentação, exercício, medicamentos), cria 5 insights claros, úteis e personalizados. 
      
- Usa português de Portugal.
- Formata com bullet points.
- Foca-te em padrões, correlações e sugestões realistas.
- Evita repetir frases genéricas. Sê útil e específico.
- Inclui pelo menos um insight para cada tipo de registo.`,
    },
    {
      role: "user",
      content: `Dados do utilizador (JSON):\n${JSON.stringify(dadosFiltrados, null, 2)}\n\nGera os insights agora.`,
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
        model: "gpt-4",
        messages: mensagens,
        temperature: 0.6,
        max_tokens: 1000,
      }),
    });

    const data = await resposta.json();
    console.log("🤖 Resposta da IA:", JSON.stringify(data, null, 2));

    const conteudo = data.choices?.[0]?.message?.content;
    if (!conteudo) return ["❌ Não foi possível criar insights neste momento."];

    return conteudo
      .split("\n")
      .map((linha: string) => linha.trim())
      .filter((linha: string) => linha.length > 0);
  } catch (err) {
    console.error("❌ Erro na conexão com o OpenRouter:", err);
    return ["Erro ao criar insights com IA."];
  }
}
