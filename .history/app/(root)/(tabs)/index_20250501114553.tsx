import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LineChart } from "react-native-chart-kit"; // Biblioteca de gráfico
import { supabase } from "../../../lib/supabase";
import { Image } from "react-native";
import images from "../../../constants/images";
import icons from "@/constants/icons";

const screenWidth = Dimensions.get("window").width;

export default function Index() {
  const [sleepGlucoseData, setSleepGlucoseData] = useState<{ sleep: number; glucose: number; date: string }[]>([]);
  const [challenges, setChallenges] = useState([
    { id: 1, text: "🌙 Dormir 30 minutos mais cedo", completed: false },
    { id: 2, text: "💧 Beba 2 litros de água", completed: false },
    { id: 3, text: "🚶‍♂️ Caminhada de 10 minutos", completed: false },
    { id: 4, text: "🍎 Coma pelo menos 1 fruta hoje", completed: false },
  ]);
  const [lastReset, setLastReset] = useState<Date | null>(null);

  useEffect(() => {
    const fetchSleepGlucoseData = async () => {
      try {
        const { data, error } = await supabase
          .from("dados_usuario")
          .select("sono, glicose, created_at")
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Erro ao buscar dados:", error);
          Alert.alert("Erro", "Não foi possível carregar os dados.");
          return;
        }

        if (data) {
          const formattedData = data
            .filter((item) => item.sono !== null && item.glicose !== null)
            .map((item) => ({
              sleep: item.sono,
              glucose: item.glicose,
              date: new Date(item.created_at).toLocaleDateString(), // Formata a data
            }));
          setSleepGlucoseData(formattedData);
        }
      } catch (err) {
        console.error("Erro inesperado:", err);
        Alert.alert("Erro", "Erro ao carregar dados do Supabase.");
      }
    };

    fetchSleepGlucoseData();
    resetChallengesIfNecessary();
  }, []);

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

  const chartData = {
    labels: sleepGlucoseData.map((item) => item.date), // Usa as datas como etiquetas
    datasets: [
      {
        data: sleepGlucoseData.map((item) => item.sleep), // Dados de sono
        color: () => "#4A90E2", // Cor da linha de sono
        strokeWidth: 2,
      },
      {
        data: sleepGlucoseData.map((item) => item.glucose), // Dados de glicose
        color: () => "#E94E77", // Cor da linha de glicose
        strokeWidth: 2,
      },
    ],
    legend: ["Sono (0-10)", "Glicose (mg/dL)"],
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
        {sleepGlucoseData.length > 0 ? (
          <LineChart
            data={chartData}
            width={screenWidth - 40}
            height={250}
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
            style={styles.chart}
          />
        ) : (
          <Text style={styles.loadingText}>Carregando dados...</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F0F8FF" },
  scrollContent: { padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  greeting: { fontSize: 18, fontFamily: "Rubik-Medium", color: "#08457E" },
  subGreeting: { fontSize: 14, color: "#888" },
  bellIcon: { width: 24, height: 24 },
  sectionTitle: { fontSize: 20, fontFamily: "Rubik-Bold", color: "#08457E", marginBottom: 10, marginTop: 20 },
  challengeBox: { backgroundColor: "#E0F7FA", padding: 15, borderRadius: 12 },
  challengeItem: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  checkbox: { width: 20, height: 20, borderWidth: 2, borderColor: "#00796B", marginRight: 10, borderRadius: 4 },
  checkboxCompleted: { backgroundColor: "#00796B" },
  challengeText: { fontSize: 14, color: "#00796B" },
  challengeTextCompleted: { textDecorationLine: "line-through", color: "#B0BEC5" },
  chart: { marginVertical: 10, borderRadius: 12 },
  loadingText: { fontSize: 16, color: "#888", textAlign: "center" },
});
