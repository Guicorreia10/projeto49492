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
  const [desafioConcluido, setDesafioConcluido] = useState(false);
  const [mostrarModalDesafio, setMostrarModalDesafio] = useState(false);


  const [smartwatchData, setSmartwatchData] = useState<{
    passos?: string;
    exercicio?: string;
    sono?: string;
  } | null>(null);
  const [sonoPitt, setSonoPitt] = useState<{
  pontuacao: number;
  classificacao: string;
  data_resposta: string;
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
        // Buscar resultado do questionário de qualidade de sono (quest_pitt)
      const { data: resultadoSonoPitt, error: erroSonoPitt } = await supabase
        .from("quest_pitt")
        .select("pontuacao, classificacao, data_resposta")
        .eq("id", userId)
        .order("data_resposta", { ascending: false })
        .limit(1)
        .single();

      if (!erroSonoPitt && resultadoSonoPitt) {
        setSonoPitt(resultadoSonoPitt);
      }


        const { data, error } = await supabase
          .from("dados_utilizador")
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

       
 <View style={styles.cardRow}>
  {/* Resumo do Sono */}
  <View style={styles.sonoBox}>
    <Text style={styles.cardTitleSmall}>Resumo do Sono</Text>
    <Text style={styles.cardValueSmall}>
      {sleepEvaluation !== null ? `${sleepEvaluation} / 10` : "A carregar..."}
    </Text>
    <Text style={styles.cardTextSmall}>{sleepMessage}</Text>
  </View>

  {/* Botão Análise de Comida */}
  <TouchableOpacity style={styles.foodButton} onPress={() => router.push("/analisecomida")}>
  <View style={styles.foodContent}>
    <Text style={styles.foodIcon}>🥗</Text>
    <Text style={styles.foodLabel}>Análise Alimentar</Text>
  </View>
</TouchableOpacity>

</View>




        <View style={styles.cardRow}>
  {/* Glicose Atual */}
  <View style={styles.glicoseBox}>
    <Text style={styles.cardTitleSmall}>Glicose Atual</Text>
    <Text style={styles.cardValueSmall}>
      {glucoseValue !== null ? `${glucoseValue} mg/dL` : "A carregar..."}
    </Text>
    <Text style={styles.cardTextSmall}>{glucoseMessage}</Text>
  </View>

  {/* Desafio do Dia */}
<TouchableOpacity style={styles.challengeButtonCard} onPress={() => router.push("/desafio")}>
  <View style={styles.challengeContent}>
    <Text style={styles.challengeEmoji}>💧</Text>
    <Text style={styles.challengeText}>Desafios Diários</Text>
  </View>
</TouchableOpacity>

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
<Text style={styles.sectionTitle}>Qualidade do Sono (PSQI)</Text>

{sonoPitt ? (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>🛏️ Resultado do Questionário</Text>
    <Text style={styles.cardValue}>{sonoPitt.pontuacao} pontos</Text>
    <Text style={styles.cardText}>Classificação: {sonoPitt.classificacao}</Text>
    <Text style={styles.cardText}>
      Respondido em: {new Date(sonoPitt.data_resposta).toLocaleDateString("pt-PT")}
    </Text>
    <TouchableOpacity
      style={styles.botaoCronotipo}
      onPress={() => router.push("../(root)/quali_sono")}
    >
      <Text style={styles.botaoCronotipoTexto}>🔁 Refazer Questionário</Text>
    </TouchableOpacity>
  </View>
) : (
  <TouchableOpacity
    style={styles.botaoCronotipo}
    onPress={() => router.push("../(root)/quali_sono")}
  >
    <Text style={styles.botaoCronotipoTexto}>📝 Fazer Questionário Qualidade do Sono</Text>
  </TouchableOpacity>
)}

      </ScrollView>
      {mostrarModalDesafio && (
  <View style={styles.modalOverlay}>
    <View style={styles.modalContainer}>
      <Text style={styles.modalTitle}>💧 Desafio do Dia</Text>
      <Text style={styles.modalText}>Beber 8 copos de água hoje</Text>

      <TouchableOpacity
        style={[
          styles.modalButton,
          desafioConcluido ? styles.modalButtonDone : null,
        ]}
        onPress={() => setDesafioConcluido(true)}
        disabled={desafioConcluido}
      >
        <Text style={styles.modalButtonText}>
          {desafioConcluido ? "✅ Desafio Concluído" : "Marcar como Concluído"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setMostrarModalDesafio(false)}>
        <Text style={styles.modalClose}>Fechar</Text>
      </TouchableOpacity>
    </View>
  </View>
)}

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
 cardTitleRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 5,
},
foodButtonText: {
  color: "#007AFF",
  fontWeight: "600",
  fontSize: 13,
},
cardRow: {
  flexDirection: "row",
  backgroundColor: "#fff",
  borderRadius: 16,
  padding: 16,
  marginBottom: 20,
  shadowColor: "#000",
  shadowOpacity: 0.08,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 6,
  elevation: 4,
},

sonoBox: {
  flex: 1,
  paddingRight: 12,
  borderRightWidth: 1,
  borderRightColor: "#eee",
},

foodBox: {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  paddingLeft: 12,
},

cardTitleSmall: {
  fontSize: 16,
  fontWeight: "700",
  color: "#08457E",
},

cardValueSmall: {
  fontSize: 28,
  fontWeight: "700",
  color: "#007AFF",
  marginTop: 6,
},

cardTextSmall: {
  fontSize: 13,
  color: "#666",
  marginTop: 4,
},

foodIcon: {
  fontSize: 32,
  marginBottom: 6,
},

foodLabel: {
  fontSize: 15,
  fontWeight: "600",
  color: "#4f46e5",
},
foodButton: {
  flex: 1,
  backgroundColor: "#E6F0FF",
  paddingVertical: 18,
  paddingHorizontal: 12,
  borderRadius: 12,
  alignItems: "center",
  justifyContent: "center",
  marginLeft: 12,
  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 4,
  elevation: 3,
},

foodContent: {
  alignItems: "center",
},
glicoseBox: {
  flex: 1,
  paddingRight: 12,
  borderRightWidth: 1,
  borderRightColor: "#eee",
},

challengeButtonCard: {
  flex: 1,
  backgroundColor: "#E8F8F5",
  paddingVertical: 18,
  paddingHorizontal: 12,
  borderRadius: 12,
  alignItems: "center",
  justifyContent: "center",
  marginLeft: 12,
  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 4,
  elevation: 3,
},

challengeContent: {
  alignItems: "center",
},

challengeEmoji: {
  fontSize: 32,
  marginBottom: 6,
},

challengeText: {
  fontSize: 15,
  fontWeight: "600",
  color: "#1A7F64",
},
modalOverlay: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999,
},

modalContainer: {
  width: "80%",
  backgroundColor: "#fff",
  padding: 20,
  borderRadius: 12,
  alignItems: "center",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 10,
},

modalTitle: {
  fontSize: 20,
  fontWeight: "700",
  color: "#08457E",
  marginBottom: 10,
},

modalText: {
  fontSize: 16,
  color: "#555",
  marginBottom: 20,
  textAlign: "center",
},

modalButton: {
  backgroundColor: "#007AFF",
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 10,
  marginBottom: 12,
},

modalButtonDone: {
  backgroundColor: "#4CAF50",
},

modalButtonText: {
  color: "#fff",
  fontWeight: "600",
  fontSize: 16,
},

modalClose: {
  color: "#007AFF",
  fontSize: 14,
  marginTop: 8,
},









});
