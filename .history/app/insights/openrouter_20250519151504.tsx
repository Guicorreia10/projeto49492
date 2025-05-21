import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import { gerarOpenRouterInsights } from "../utils/OpenRouterInsights";
import { Registo } from "../types";
import { OPENROUTER_API_KEY } from "@env";

const { width } = Dimensions.get("window");

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
  console.log("API KEY:", OPENROUTER_API_KEY);


  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>✨ A Nossa Opinião</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#4A90E2" style={styles.loading} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {insights.map((line, idx) => (
            <View key={idx} style={styles.card}>
              <Text style={styles.cardText}>• {line.replace(/^[-*\u2022]\s*/, "")}</Text>
            </View>
          ))}
        </ScrollView>
        
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    padding: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
    color: "#1e3a8a",
  },
  scroll: {
    paddingBottom: 40,
    alignItems: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    width: width * 0.9,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 4,
  },
  cardText: {
    fontSize: 16,
    color: "#1f2937",
    lineHeight: 24,
  },
  loading: {
    marginTop: 40,
  },
});
