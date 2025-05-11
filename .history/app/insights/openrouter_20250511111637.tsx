// app/insights/openrouter.tsx
import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import { gerarOpenRouterInsights } from "../utils/OpenRouterInsights";
import { Registo } from "../types";

export default function OpenRouterInsightsScreen() {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    const fetchAndGenerate = async () => {
      try {
        const dados: Registo[] = [];

        const { data: dso } = await supabase
          .from("dados_usuario")
          .select("id, created_at, glicose, sono")
          .order("created_at", { ascending: false });

        const { data: comida } = await supabase
          .from("comida")
          .select("id, created_at, food_name, quantity, calories, carbs, glycemic_index, glycemic_impact");

        const { data: meds } = await supabase
          .from("medicamentos")
          .select("id, created_at, tipo, quantidade, descricao");

        // Mapear todos os dados para o tipo Registo
        dso?.forEach((r) => {
          const dt = new Date(r.created_at);
          dados.push({
            id: r.id,
            data: dt.toISOString().split("T")[0],
            dia: dt.toLocaleDateString("pt-PT", { weekday: "short" }),
            hora: dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            tipo: r.glicose ? "glicose" : "sono",
            valorGlicose: r.glicose?.toString(),
            detalhesSono: r.sono?.toString(),
          });
        });

        comida?.forEach((r) => {
          const dt = new Date(r.created_at);
          dados.push({
            id: r.id,
            data: dt.toISOString().split("T")[0],
            dia: dt.toLocaleDateString("pt-PT", { weekday: "short" }),
            hora: dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            tipo: "comida",
            food_name: r.food_name,
            quantity: r.quantity,
            calories: r.calories,
            carbs: r.carbs,
            glycemic_index: r.glycemic_index,
            glycemic_impact: r.glycemic_impact,
          });
        });

        meds?.forEach((r) => {
          const dt = new Date(r.created_at);
          dados.push({
            id: r.id,
            data: dt.toISOString().split("T")[0],
            dia: dt.toLocaleDateString("pt-PT", { weekday: "short" }),
            hora: dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            tipo: "medicamento",
            medicamento: r.tipo,
            dose: r.quantidade,
            descricao: r.descricao,
          });
        });

        const result = await gerarOpenRouterInsights(dados);
        setInsights(result);
      } catch (err) {
        console.error("Erro ao gerar insights:", err);
        setInsights(["Erro ao gerar insights."]);
      } finally {
        setLoading(false);
      }
    };

    fetchAndGenerate();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>A nossa Opinião</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#4A90E2" style={{ marginTop: 20 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {insights.map((line, idx) => (
            <Text key={idx} style={styles.insight}>• {line.replace(/^[-*\u2022]\s*/, "")}</Text>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16, textAlign: "center", color: "#4A90E2" },
  scroll: { paddingBottom: 40 },
  insight: { fontSize: 16, marginBottom: 12, lineHeight: 24, color: "#333" },
});
