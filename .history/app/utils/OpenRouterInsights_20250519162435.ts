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

function getWeekDates(): [string, string] {
  const today = new Date();
  const first = new Date(today.setDate(today.getDate() - today.getDay() + 1));
  const last = new Date(today.setDate(first.getDate() + 6));
  return [first.toISOString().split("T")[0], last.toISOString().split("T")[0]];
}

export async function gerarOpenRouterInsights(): Promise<string[]> {
  const apiKey = Constants.expoConfig?.extra?.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.warn("🔑 API key do OpenRouter não encontrada.");
    return ["Erro: Chave de API não configurada."];
  }

  try {
    const [startDate, endDate] = getWeekDates();
    const registos: Registo[] = [];

    // 🧠 SONO + GLICOSE
    const { data: dadosUsuario } = await supabase
      .from("dados_usuario")
      .select("id, created_at, glicose, sono")
      .gte("created_at", `${startDate}T00:00:00`)
      .lte("created_at", `${endDate}T23:59:59`)
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

    // 🍽️ COMIDA
    const { data: comidas } = await supabase
      .from("comida")
      .select("id, created_at, food_name, quantity, calories, carbs, glycemic_index, glycemic_impact")
      .gte("created_at", `${startDate}T00:00:00`)
      .lte("created_at", `${endDate}T23:59:59`);

    comidas?.forEach((r) => {
      const dt = new Date(r.created_at);
      registos.push({
        id: r.id,
        data: dt.toISOString().split("T")[0],
        hora: dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        tipo: "comida",
        detalhes: `${r.food_name}, Quantidade: ${r.quantity}, Calorias: ${r.calories}, Carboidratos: ${r.carbs}, IG: ${r.glycemic_index}, CG: ${r.glycemic_impact}`,
      });
    });

    // 💊 MEDICAMENTOS
    const { data: meds } = await supabase
      .from("medicamentos")
      .select("id, created_at, tipo, quantidade, descricao")
      .gte("created_at", `${startDate}T00:00:00`)
      .lte("created_at", `${endDate}T23:59:59`);

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

    // ⌚ DADOS SMARTWATCH
    const { data: smart } = await supabase
      .from("dados_smartwatch")
      .select("id, data_registo, tipo, valor, unidade")
      .gte("data_registo", `${startDate}T00:00:00`)
      .lte("data_registo", `${endDate}T23:59:59`)
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

    // 🔍 FILTRAR pelo menos 1 de cada tipo
    const tiposDesejados = ["sono", "glicose", "comida", "medicamento", "smartwatch_exercicio", "smartwatch_passos", "smartwatch_sono"];
    const dadosFiltrados: Registo[] = [];

    for (const tipo of tiposDesejados) {
      const encontrado = registos.find((r) => r.tipo === tipo);
      if (encontrado) dadosFiltrados.push(encontrado);
    }

    const mensagens = [
      {
        role: "system",
        content:
          "És um assistente de saúde inteligente. Com base nos registos da semana (sono, glicose, alimentação, medicamentos, smartwatch), gera 5 insights curtos e úteis — um para cada tema. Sê direto, realista e explicativo. Usa linguagem clara.",
      },
      {
        role: "user",
        content: `Eis os registos desta semana:\n${JSON.stringify(dadosFiltrados, null, 2)}`,
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
