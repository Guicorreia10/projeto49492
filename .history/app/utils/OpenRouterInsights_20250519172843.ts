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

function getWeekRange(): [string, string] {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return [monday.toISOString().split("T")[0], sunday.toISOString().split("T")[0]];
}

export async function gerarOpenRouterInsights(): Promise<string[]> {
  const apiKey = Constants.expoConfig?.extra?.GEMINI_API_KEY;
  if (!apiKey) return ["Erro: Chave de API do Gemini não configurada."];

  try {
    const [start, end] = getWeekRange();
    const registos: Registo[] = [];

    const { data: dadosUsuario } = await supabase
      .from("dados_usuario")
      .select("id, created_at, glicose, sono")
      .gte("created_at", `${start}T00:00:00`)
      .lte("created_at", `${end}T23:59:59`);

    dadosUsuario?.forEach((r) => {
      const dt = new Date(r.created_at);
      const base = {
        id: r.id,
        data: dt.toISOString().split("T")[0],
        hora: dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      if (r.glicose !== null) registos.push({ ...base, tipo: "glicose", valor: r.glicose });
      if (r.sono !== null) registos.push({ ...base, tipo: "sono", valor: r.sono, unidade: "horas" });
    });

    const { data: comidas } = await supabase
      .from("comida")
      .select("id, created_at, food_name, quantity, calories, carbs, glycemic_index, glycemic_impact")
      .gte("created_at", `${start}T00:00:00`)
      .lte("created_at", `${end}T23:59:59`);

    comidas?.forEach((r) => {
      const dt = new Date(r.created_at);
      registos.push({
        id: r.id,
        data: dt.toISOString().split("T")[0],
        hora: dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        tipo: "comida",
        detalhes: `${r.food_name} (Qtd: ${r.quantity}, Cal: ${r.calories}, Carbs: ${r.carbs}, IG: ${r.glycemic_index}, CG: ${r.glycemic_impact})`
      });
    });

    const { data: meds } = await supabase
      .from("medicamentos")
      .select("id, created_at, tipo, quantidade, descricao")
      .gte("created_at", `${start}T00:00:00`)
      .lte("created_at", `${end}T23:59:59`);

    meds?.forEach((r) => {
      const dt = new Date(r.created_at);
      registos.push({
        id: r.id,
        data: dt.toISOString().split("T")[0],
        hora: dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        tipo: "medicamento",
        detalhes: `Medicamento: ${r.tipo}, Quantidade: ${r.quantidade}, Nota: ${r.descricao}`
      });
    });

    const { data: smart } = await supabase
      .from("dados_smartwatch")
      .select("id, data_registo, tipo, valor, unidade")
      .gte("data_registo", `${start}T00:00:00`)
      .lte("data_registo", `${end}T23:59:59`);

    smart?.forEach((r) => {
      const dt = new Date(r.data_registo);
      registos.push({
        id: r.id,
        data: dt.toISOString().split("T")[0],
        hora: dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        tipo: `smartwatch_${r.tipo}`,
        valor: r.valor,
        unidade: r.unidade
      });
    });

    const tiposDesejados = ["sono", "glicose", "comida", "medicamento", "smartwatch_passos", "smartwatch_exercicio", "smartwatch_sono"];
    const dadosFiltrados: Registo[] = [];
    for (const tipo of tiposDesejados) {
      dadosFiltrados.push(...registos.filter(r => r.tipo === tipo).slice(0, 2));
    }

    const prompt = `Com base nos seguintes registos da semana, gera exatamente 10 insights (2 sobre cada tipo: medicamentos, glicose, sono, comida, smartwatch). Avalia com clareza, realismo e foco em bem-estar:

${JSON.stringify(dadosFiltrados, null, 2)}

Sê conciso e divide os insights por tópicos com bullets.`;

    const resposta = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      })
    });

    const data = await resposta.json();
    const texto = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!texto) return ["Não foi possível gerar insights neste momento."];

    return texto
      .split("\n")
      .map((linha: string) => linha.trim())
      .filter((linha: string) => linha.length > 0);

  } catch (err) {
    console.error("❌ Erro ao gerar insights com Gemini:", err);
    return ["Erro ao gerar insights com IA."];
  }
}
