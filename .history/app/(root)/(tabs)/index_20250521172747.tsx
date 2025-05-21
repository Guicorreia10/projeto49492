import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Dimensions,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "expo-router";
import icons from "@/constants/icons";
import { LineChart } from "react-native-chart-kit";

export default function Index() {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [sleepEvaluation, setSleepEvaluation] = useState<number | null>(null);
  const [sleepMessage, setSleepMessage] = useState<string>("A carregar...");
  const [glucoseValue, setGlucoseValue] = useState<number | null>(null);
  const [glucoseMessage, setGlucoseMessage] = useState<string>("A carregar...");
  const [cronotipo, setCronotipo] = useState<{ pontuacao: number; tipo: string } | null>(null);

  const [smartwatchData, setSmartwatchData] = useState<{
    passos?: string;
    exercicio?: string;
    sono?: string;
  } | null>(null);

  const [challenges, setChallenges] = useState([
    { id: 2, text: "💧 Beber 8 copos de água hoje", completed: false },
  ]);
  const router = useRouter();

  const dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return `${d.getDate()}/${d.getMonth() + 1}`;
  });

  const dadosSono = [6.5, 7.0, 4.8, 8.2, 7.5, 6.9, sleepEvaluation ?? 0];
  const dadosGlicose = [130, 120, 140, 100, 110, 135, glucoseValue ?? 0];

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data?.session) {
        console.log("❌ Sessão ausente, redirecionar para login");
        router.replace("/sign-in");
      } else {
        console.log("✅ Sessão ativa");
        setSessionChecked(true);
      }
    };
    checkSession();
  }, []);

  useEffect(() => {
    if (!sessionChecked) return;

    const fetchLatestData = async () => {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData?.user) throw authError;

        const userId = authData.user.id;

        const { data, error } = await supabase
          .from("dados_usuario")
          .select("sono, qualidade_sono, dificuldade_ao_dormir, uso_dispositivos, glicose")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1);
      const { data: resultadoCronotipo, error: erroCronotipo } = await supabase
        .from("cronotipos")
        .select("pontuacao, tipo")
        .eq("user_id", userId)
        .order("data", { ascending: false })
        .limit(1)
        .single();

      if (resultadoCronotipo && !erroCronotipo) {
        setCronotipo({
          pontuacao: resultadoCronotipo.pontuacao,
          tipo: resultadoCronotipo.tipo,
        });
}

        if (error) {
          console.error("Erro ao buscar dados:", error);
          Alert.alert("Erro", "Não foi possível carregar os dados.");
          return;
        }

        if (data && data.length > 0) {
          const { sono, qualidade_sono, dificuldade_ao_dormir, uso_dispositivos, glicose } = data[0];

          if (
            sono !== null &&
            qualidade_sono !== null &&
            dificuldade_ao_dormir !== null &&
            uso_dispositivos !== null
          ) {
            const hoursScore = Math.min((sono / 8) * 10, 10) * 0.4;
            const qualityScore = qualidade_sono * 0.3;
            const difficultyScore = dificuldade_ao_dormir === "Sim" ? 0 : 10 * 0.2;
            const deviceScore = uso_dispositivos === "Sim" ? 0 : 10 * 0.1;
            const finalScore = hoursScore + qualityScore + difficultyScore + deviceScore;
            setSleepEvaluation(Number(finalScore.toFixed(1)));
            setSleepMessage(finalScore <= 5 ? "Tente dormir melhor hoje!" : "O seu sono está ótimo!");
          }

          if (glicose !== null) {
            setGlucoseValue(glicose);
            if (glicose <= 70) setGlucoseMessage("Atenção: glicose baixa.");
            else if (glicose <= 140) setGlucoseMessage("Glicose dentro do normal!");
            else setGlucoseMessage("Tenha cuidado: glicose elevada.");
          }
        }
      } catch (err) {
        console.error("Erro inesperado:", err);
        Alert.alert("Erro", "Erro ao carregar dados.");
      }
    };

    const fetchSmartwatchData = async () => {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData?.user) throw authError;

        const userId = authData.user.id;

        const tipos = ["passos", "exercicio", "sono"];
        const result: Record<string, string> = {};

        for (const tipo of tipos) {
          const { data, error } = await supabase
            .from("dados_smartwatch")
            .select("valor, unidade")
            .eq("user_id", userId)
            .eq("tipo", tipo)
            .order("data_registo", { ascending: false })
            .limit(1);

          if (error) {
            console.warn(`Erro ao buscar ${tipo}:`, error);
            continue;
          }

          if (data && data.length > 0) {
            result[tipo] = `${data[0].valor} ${data[0].unidade}`;
          }
        }

        setSmartwatchData(result);
      } catch (err) {
        console.error("Erro ao buscar smartwatch:", err);
      }
    };

    fetchLatestData();
    fetchSmartwatchData();

    const intervalId = setInterval(() => {
      fetchLatestData();
      fetchSmartwatchData();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [sessionChecked]);

  const toggleChallenge = (id: number) => {
    setChallenges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, completed: !c.completed } : c))
    );
  };

  if (!sessionChecked) {
    return <View style={{ flex: 1, backgroundColor: "#F0F8FF" }} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Olá</Text>
            <Text style={styles.subGreeting}>Preparado para o dia de hoje?</Text>
          </View>
          <Image source={icons.bell} style={styles.bellIcon} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Resumo do Sono</Text>
          <Text style={styles.cardValue}>
            {sleepEvaluation !== null ? `${sleepEvaluation} / 10` : "A carregar..."}
          </Text>
          <Text style={styles.cardText}>{sleepMessage}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Glicose Atual</Text>
          <Text style={styles.cardValue}>
            {glucoseValue !== null ? `${glucoseValue} mg/dL` : "A carregar..."}
          </Text>
          <Text style={styles.cardText}>{glucoseMessage}</Text>
        </View>

        {smartwatchData && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Dados do Smartwatch</Text>
            <Text style={styles.cardText}>
              👣 Passos: {smartwatchData.passos ?? "N/D"}{"\n"}
              🏃 Exercício: {smartwatchData.exercicio ?? "N/D"}{"\n"}
              💤 Sono: {smartwatchData.sono ?? "N/D"}
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Desafio do Dia</Text>
        {challenges.map((c) => (
          <View key={c.id} style={styles.challengeCard}>
            <Text style={styles.challengeIcon}>{c.text.split(" ")[0]}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.challengeTitle}>{c.text.replace(/^.{2}\s/, "")}</Text>
              <TouchableOpacity
                onPress={() => toggleChallenge(c.id)}
                style={[styles.challengeButton, c.completed && styles.challengeButtonCompleted]}
              >
                <Text
                  style={[styles.challengeButtonText, c.completed && styles.challengeButtonTextCompleted]}
                >
                  {c.completed ? "Concluído ✅" : "Concluir"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Sono x Glicose</Text>
        <LineChart
          data={{
            labels: dias,
            datasets: [
              {
                data: dadosSono,
                color: () => "#4A90E2",
                strokeWidth: 2,
              },
              {
                data: dadosGlicose.map(g => g / 20),
                color: () => "#E94E77",
                strokeWidth: 2,
              },
            ],
            legend: ["Sono (0-10)", "Glicose (mg/dL) (normalizado)"],
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
                <Text style={styles.sectionTitle}>Cronotipo</Text>

        {cronotipo ? (
          <View style={styles.card}>
  <Text style={styles.cardTitle}>🧠 Resultado do Cronotipo</Text>
  <Text style={styles.cardValue}>Tipo: {cronotipo.tipo}</Text>
  <Text style={styles.card}>{cronotipo.pontuacao} pontos</Text>
 

  <TouchableOpacity
    style={styles.botaoCronotipo}
    onPress={() => router.push('../(root)/cronotipos')}
  >
    <Text style={styles.botaoCronotipoTexto}>🔁 Repetir Questionário</Text>
  </TouchableOpacity>
</View>

        ) : (
          <TouchableOpacity style={styles.botaoCronotipo} onPress={() => router.push("../(root)/cronotipos")}>
            <Text style={styles.botaoCronotipoTexto}>📝 Fazer Questionário de Cronotipo</Text>
          </TouchableOpacity>
        )}
<TouchableOpacity style={styles.botaoCronotipo} onPress={() => router.push("../(root)/quali_sono")}>
            <Text style={styles.botaoCronotipoTexto}>📝 Fazer Questionário de Cronotipo</Text>
          </TouchableOpacity>
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
  headerLeft: {},
  greeting: { fontSize: 18, fontWeight: "600", color: "#08457E" },
  subGreeting: { fontSize: 14, color: "#888" },
  bellIcon: { width: 24, height: 24 },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#08457E",
    marginBottom: 5,
  },
  cardValue: { fontSize: 36, fontWeight: "700", color: "#007AFF" },
  cardText: { fontSize: 14, color: "#666", marginTop: 5 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#08457E",
    marginBottom: 10,
    marginTop: 20,
  },
  challengeCard: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 20,
  },
  challengeIcon: { fontSize: 36, marginRight: 16 },
  challengeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#08457E",
    marginBottom: 8,
  },
  challengeButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  challengeButtonCompleted: { backgroundColor: "#4CAF50" },
  challengeButtonText: { color: "#fff", fontSize: 14 },
  challengeButtonTextCompleted: { color: "#e8f5e9" },
    botaoCronotipo: {
    backgroundColor: "#4f46e5",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  botaoCronotipoTexto: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

});
