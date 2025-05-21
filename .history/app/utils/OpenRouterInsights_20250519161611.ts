import { supabase } from "../../lib/supabase";
import Constants from "expo-constants";

interface Registo {
  id: string;
  data: string;
  hora: string;
  tipo: string;
  valor?: number | string;
  unidade?: string;
  detalhes?: string;
}

export async function gerarOpenRouterInsights(): Promise<string[]> {
  const apiKey = Constants.expoConfig?.extra?.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.warn("🔑 API key do OpenRouter não encontrada.");
    return ["Erro: Chave de API não configurada."];
  }

  try {
    const registos: Registo[] = [];

    // 🟦 DADOS USUARIO (sono e glicose)
    const { data: dadosUsuario } = await supabase
      .from("dados_usuario")
      .select("id, created_at, glicose, sono")
      .order("created_at", { ascending: false });

    dadosUsuario?.forEach((r) => {
      const dt = new Date(r.created_at);
      const base = {
        id: r.id,
        data: dt.toISOString().split("T")[0],
        hora: dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      if (r.glicose !== null) {
        registos.push({ ...base, tipo: "glicose", valor: r.glicose });
      }
      if (r.sono !== null) {
        registos.push({ ...base, tipo: "sono", valor: r.sono, unidade: "horas" });
      }
    });

    // 🥗 COMIDA
    const { data: comida } = await supabase
      .from("comida")
      .select("id, created_at, food_name, quantity, calories, carbs, glycemic_index, glycemic_impact");

    comida?.forEach((r) => {
      const dt = new Date(r.created_at);
      registos.push({
        id: r.id,
        data: dt.toISOString().split("T")[0],
        hora: dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        tipo: "comida",
        detalhes: `${r.food_name}, Qtd: ${r.quantity}, Cal: ${r.calories}, Carbs: ${r.carbs}, IG: ${r.glycemic_index}, CG: ${r.glycemic_impact}`,
      });
    });

    // 💊 MEDICAMENTOS
    const { data: meds } = await supabase
      .from("medicamentos")
      .select("id, created_at, tipo, quantidade, descricao");

    meds?.forEach((r) => {
      const dt = new Date(r.created_at);
      registos.push({
        id: r.id,
        data: dt.toISOString().split("T")[0],
        hora: dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        tipo: "medicamento",
        detalhes: `${r.tipo} (${r.quantidade}) — ${r.descricao}`,
      });
    });

    // ⌚ SMARTWATCH
    const { data: smart } = await supabase
      .from("dados_smartwatch")
      .select("id, data_registo, tipo, valor, unidade")
      .order("data_registo", { ascending: false });

    smart?.forEach((r) => {
      const dt = new Date(r.data_registo);
      registos.push({
        id: r.id,
        data: dt.toISOString().split("T")[0],
        hora: dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        tipo: `smartwatch_${r.tipo}`,
        valor: r.valor,
        unidade: r.unidade,
      });
    });

    // 🔗 PREPARAR MENSAGEM PARA OPENROUTER
    const mensagens = [
      {
        role: "system",
        content:
          "És um assistente de saúde inteligente. Com base nos registos fornecidos (sono, glicose, alimentação, medicamentos, smartwatch), gera 5 insights personalizados e úteis para melhorar a saúde metabólica do utilizador. Cada insight deve ser claro, explicativo e cobrir um tema diferente: 1 de comida, 1 de glicose, 1 de sono, 1 de medicamentos, 1 de smartwatch.",
      },
      {
        role: "user",
        content: `Dados recentes (JSON):\n${JSON.stringify(registos.slice(0, 30), null, 2)}`,
      },
    ];

    const resposta = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: mensagens,
        temperature: 0.7,
        max_tokens: 400,
      }),
    });

    const data = await resposta.json();
    console.log("📩 Resposta OpenRouter:", data);

    const conteudo = data.choices?.[0]?.message?.content;
    if (!conteudo) return ["Não foi possível criar insights neste momento."];

    return conteudo
      .split("\n")
      .map((linha: string) => linha.trim())
      .filter((linha: string) => linha.length > 0);
  } catch (err) {
    console.error("❌ Erro ao gerar insights:", err);
    return ["Erro ao gerar insights com IA."];
  }
}
