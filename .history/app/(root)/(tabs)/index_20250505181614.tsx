import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "react-native";
import { supabase } from "../../../lib/supabase";
import icons from "@/constants/icons";
import images from "../../../constants/images";
import { LineChart } from "react-native-chart-kit";

export default function Index() {
  const [sleepEvaluation, setSleepEvaluation] = useState<number | null>(null);
  const [sleepMessage, setSleepMessage] = useState<string>("A carregar...");
  const [glucoseValue, setGlucoseValue] = useState<number | null>(null);
  const [glucoseMessage, setGlucoseMessage] = useState<string>("A carregar...");
  const [challenges, setChallenges] = useState([
    { id: 2, text: "💧 Beber 8 copos de água hoje", completed: false },
  ]);
  const [lastReset, setLastReset] = useState<Date | null>(null);
  const [dadosSono, setDadosSono] = useState<number[]>([]);
  const [dadosGlicose, setDadosGlicose] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);

  useEffect(() => {
    fetchLast7DaysAverages();
    resetChallengesIfNecessary();
  }, []);

  const fetchLast7DaysAverages = async () => {
    try {
      const { data, error } = await supabase
        .from("dados_usuario")
        .select("created_at, sono, qualidade_sono, dificuldade_ao_dormir, uso_dispositivos, glicose")
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Erro ao buscar dados:", error);
        Alert.alert("Erro", "Não foi possível carregar os dados.");
        return;
      }

      const agrupados: Record<string, any[]> = {};

      for (const item of data) {
        const date = new Date(item.created_at).toISOString().split("T")[0];
        if (!agrupados[date]) agrupados[date] = [];
        agrupados[date].push(item);
      }

      const dias = Object.keys(agrupados).sort();
      const labelsFormatados: string[] = [];
      const sonoMedias: number[] = [];
      const glicoseMedias: number[] = [];

      for (const dia of dias) {
        const registos = agrupados[dia];
        let totalSono = 0;
        let countSono = 0;
        let totalGlicose = 0;
        let countGlicose = 0;

        for (const r of registos) {
          if (
            r.sono !== null &&
            r.qualidade_sono !== null &&
            r.dificuldade_ao_dormir !== null &&
            r.uso_dispositivos !== null
          ) {
            const hoursScore = Math.min((r.sono / 8) * 10, 10) * 0.4;
            const qualityScore = r.qualidade_sono * 0.3;
            const difficultyScore = r.dificuldade_ao_dormir === "Sim" ? 0 : 10 * 0.2;
            const deviceScore = r.uso_dispositivos === "Sim" ? 0 : 10 * 0.1;
            const finalScore = hoursScore + qualityScore + difficultyScore + deviceScore;
            totalSono += finalScore;
            countSono++;
          }
          if (r.glicose !== null) {
            totalGlicose += r.glicose;
            countGlicose++;
          }
        }

        const mediaSono = countSono > 0 ? Number((totalSono / countSono).toFixed(1)) : 0;
        const mediaGlicose = countGlicose > 0 ? Number((totalGlicose / countGlicose).toFixed(0)) : 0;

        labelsFormatados.push(dia.split("-").reverse().slice(0, 2).join("/"));
        sonoMedias.push(mediaSono);
        glicoseMedias.push(mediaGlicose);
      }

      setLabels(labelsFormatados);
      setDadosSono(sonoMedias);
      setDadosGlicose(glicoseMedias);
    } catch (err) {
      console.error("Erro inesperado:", err);
      Alert.alert("Erro", "Erro ao carregar dados.");
    }
  };

  const resetChallengesIfNecessary = () => {
    const now = new Date();
    if (!lastReset || now.getDate() !== lastReset.getDate()) {
      setChallenges((prev) => prev.map((c) => ({ ...c, completed: false })));
      setLastReset(now);
    }
  };

  const toggleChallenge = (id: number) => {
    setChallenges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, completed: !c.completed } : c))
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image source={images.avatar} style={styles.avatar} />
            <View>
              <Text style={styles.greeting}>Olá, Gui 👋</Text>
              <Text style={styles.subGreeting}>Pronto para hoje?</Text>
            </View>
          </View>
          <Image source={icons.bell} style={styles.bellIcon} />
        </View>

        <Text style={styles.sectionTitle}>Relação Sono x Glicose</Text>
        <LineChart
          data={{
            labels: labels,
            datasets: [
              {
                data: dadosSono,
                color: () => "#4A90E2",
                strokeWidth: 2,
              },
              {
                data: dadosGlicose,
                color: () => "#E94E77",
                strokeWidth: 2,
              },
            ],
            legend: ["Sono (0-10)", "Glicose (mg/dL)"],
          }}
          width={Dimensions.get("window").width - 40}
          height={220}
          chartConfig={{
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
            labelColor: () => "#333",
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#fff",
            },
          }}
          bezier
          style={{ borderRadius: 12, marginVertical: 10 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F0F8FF" },
  scrollContent: { padding: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  greeting: { fontSize: 18, fontWeight: "600", color: "#08457E" },
  subGreeting: { fontSize: 14, color: "#888" },
  bellIcon: { width: 24, height: 24 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#08457E",
    marginBottom: 10,
    marginTop: 20,
  },
});
