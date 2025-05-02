import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "react-native";
import { supabase } from "../../../lib/supabase";
import icons from "@/constants/icons";
import images from "../../../constants/images";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

export default function Index() {
  const [sleepEvaluation, setSleepEvaluation] = useState<number | null>(null);
  const [sleepMessage, setSleepMessage] = useState<string>("A carregar...");
  const [glucoseValue, setGlucoseValue] = useState<number | null>(null);
  const [glucoseMessage, setGlucoseMessage] = useState<string>("A carregar...");
  const [challenges, setChallenges] = useState([
    { id: 1, text: "🌙 Dormir 30 minutos mais cedo", completed: false },
    { id: 2, text: "💧 Beber 2 litros de água", completed: false },
    { id: 3, text: "🚶‍♂️ Caminhada de 10 minutos", completed: false },
    { id: 4, text: "🍎 Comer pelo menos 1 fruta hoje", completed: false },
  ]);
  const [lastReset, setLastReset] = useState<Date | null>(null); // Última data de redefinição dos desafios

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from("dados_usuario")
          .select("sono, qualidade_sono, dificuldade_ao_dormir, uso_dispositivos, glicose")
          .order("created_at", { ascending: false })
          .limit(1);

        if (error) {
          console.error("Erro ao buscar dados:", error);
          Alert.alert("Erro", "Não foi possível carregar os dados.");
          return;
        }

        if (data && data.length > 0) {
          const { sono, qualidade_sono, dificuldade_ao_dormir, uso_dispositivos, glicose } = data[0];
          setGlucoseValue(glicose);

          const hoursScore = Math.min((sono / 8) * 10, 10) * 0.4;
          const qualityScore = qualidade_sono * 0.3;
          const difficultyScore = dificuldade_ao_dormir === "Sim" ? 0 : 10 * 0.2;
          const deviceScore = uso_dispositivos === "Sim" ? 0 : 10 * 0.1;
          const finalScore = hoursScore + qualityScore + difficultyScore + deviceScore;
          setSleepEvaluation(Number(finalScore.toFixed(1)));

          if (finalScore <= 5) {
            setSleepMessage("Tente dormir melhor hoje!");
          } else {
            setSleepMessage("O seu sono está ótimo!");
          }

          if (glicose <= 70) {
            setGlucoseMessage("Atenção: glicose baixa.");
          } else if (glicose <= 140) {
            setGlucoseMessage("Glicose dentro do normal!");
          } else {
            setGlucoseMessage("Tenha cuidado: glicose elevada.");
          }
        }
      } catch (err) {
        console.error("Erro inesperado:", err);
        Alert.alert("Erro", "Erro ao carregar dados.");
      }
    };

    fetchData();
    resetChallengesIfNecessary();

    // Atualiza os dados a cada 10 segundos (ajustar conforme necessário)
    const intervalId = setInterval(() => {
      fetchData();
    }, 10000);

    return () => clearInterval(intervalId);  // Limpar o intervalo quando o componente for desmontado
  }, [lastReset]);

  const resetChallengesIfNecessary = () => {
    const now = new Date();
    if (!lastReset || now.getDate() !== lastReset.getDate()) {
      // Reinicia os desafios se passou mais de 24 horas ou for um novo dia
      setChallenges((prevChallenges) =>
        prevChallenges.map((challenge) => ({ ...challenge, completed: false }))
      );
      setLastReset(now);
    }
  };

  const toggleChallenge = (id: number) => {
    setChallenges((prevChallenges) =>
      prevChallenges.map((challenge) =>
        challenge.id === id
          ? { ...challenge, completed: !challenge.completed }
          : challenge
      )
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
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

        {/* Resumo do Dia */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Resumo do Sono</Text>
          <Text style={styles.cardValue}>
            {sleepEvaluation ? `${sleepEvaluation} / 10` : "A carregar..."}
          </Text>
          <Text style={styles.cardText}>{sleepMessage}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Glicose Atual</Text>
          <Text style={styles.cardValue}>
            {glucoseValue ? `${glucoseValue} mg/dL` : "A carregar..."}
          </Text>
          <Text style={styles.cardText}>{glucoseMessage}</Text>
        </View>

        {/* Desafios */}
        <Text style={styles.sectionTitle}>Desafios de Hoje</Text>
        <View style={styles.challengeBox}>
          {challenges.map((challenge) => (
            <TouchableOpacity
              key={challenge.id}
              onPress={() => toggleChallenge(challenge.id)}
              style={styles.challengeItem}
            >
              <View
                style={[
                  styles.checkbox,
                  challenge.completed && styles.checkboxCompleted,
                ]}
              />
              
              <Text
                style={[
                  styles.challengeText,
                  challenge.completed && styles.challengeTextCompleted,
                ]}
              >
                {challenge.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Gráfico de Relação */}
        <Text style={styles.sectionTitle}>Relação Sono x Glicose</Text>
        <LineChart
          data={{
            labels: ["Hoje"],
            datasets: [
              {
                data: [sleepEvaluation || 0],
                color: () => "#4A90E2",
                strokeWidth: 2,
              },
              {
                data: [glucoseValue || 0],
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

// Estilos
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F0F8FF" },
  scrollContent: { padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  greeting: { fontSize: 18, fontFamily: "Rubik-Medium", color: "#08457E" },
  subGreeting: { fontSize: 14, color: "#888" },
  bellIcon: { width: 24, height: 24 },
  card: { backgroundColor: "#fff", padding: 20, borderRadius: 16, marginBottom: 20, shadowColor: "#000", shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, elevation: 5 },
  cardTitle: { fontSize: 18, fontFamily: "Rubik-Bold", color: "#08457E", marginBottom: 5 },
  cardValue: { fontSize: 36, fontFamily: "Rubik-Bold", color: "#007AFF" },
  cardText: { fontSize: 14, color: "#666", marginTop: 5 },
  sectionTitle: { fontSize: 20, fontFamily: "Rubik-Bold", color: "#08457E", marginBottom: 10, marginTop: 20 },
  challengeBox: { backgroundColor: "#E0F7FA", padding: 15, borderRadius: 12 },
  challengeItem: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#00796B",
    marginRight: 10,
    borderRadius: 4,
  },
  checkboxCompleted: { backgroundColor: "#00796B" },
  challengeText: { fontSize: 14, color: "#00796B" },
  challengeTextCompleted: { textDecorationLine: "line-through", color: "#B0BEC5" },
});
