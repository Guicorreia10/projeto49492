import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const desafios = [
  "💧 Beber 2L de água hoje",
  "🚶‍♂️ Caminhar 5.000 passos",
  " 🧘‍♀️ Meditar por 10 minutos",
  "🥗 Comer 3 porções de vegetais",
  "📵 Desligar o telemóvel 1h antes de dormir",
];

export default function Desafio() {
  const [indexAtual, setIndexAtual] = useState(0);
  const [concluido, setConcluido] = useState(false);
  const [bloqueado, setBloqueado] = useState(false);
  const router = useRouter();

  // Verifica se desafios já foram completados hoje
  useEffect(() => {
    const verificarEstado = async () => {
      const concluidoHoje = await AsyncStorage.getItem("desafios_concluidos");
      const dataUltimaConclusao = await AsyncStorage.getItem("data_ultima_conclusao");

      if (concluidoHoje === "true" && dataUltimaConclusao) {
        const dataSalva = new Date(dataUltimaConclusao);
        const agora = new Date();

        const passou24h = agora.getTime() - dataSalva.getTime() > 24 * 60 * 60 * 1000;

        if (!passou24h) {
          setIndexAtual(desafios.length);
          setBloqueado(true);
        } else {
          await AsyncStorage.removeItem("desafios_concluidos");
          await AsyncStorage.removeItem("data_ultima_conclusao");
          setIndexAtual(0);
          setBloqueado(false);
        }
      }
    };

    verificarEstado();
  }, []);

  const desafioAtual = desafios[indexAtual];

  const concluirDesafio = async () => {
    setConcluido(true);

    setTimeout(async () => {
      if (indexAtual < desafios.length - 1) {
        setIndexAtual((prev) => prev + 1);
        setConcluido(false);
      } else {
        await AsyncStorage.setItem("desafios_concluidos", "true");
        await AsyncStorage.setItem("data_ultima_conclusao", new Date().toISOString());
        setBloqueado(true);
        Alert.alert("🎉 Parabéns!", "Concluíste todos os desafios de hoje!");
      }
    }, 800);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Desafios do Dia</Text>

      <View style={styles.desafioBox}>
        {bloqueado ? (
          <Text style={styles.desafio}>✔️ Todos os desafios foram concluídos hoje!</Text>
        ) : (
          <Text style={styles.desafio}>{desafioAtual}</Text>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          concluido && styles.buttonDone,
          bloqueado && styles.buttonDisabled,
        ]}
        onPress={concluirDesafio}
        disabled={concluido || bloqueado}
      >
        <Text style={styles.buttonText}>
          {bloqueado
            ? "✔️ Volte amanhã para mais desafios..."
            : concluido
            ? "✅ Concluído!"
            : "Marcar como Concluído"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.voltar}>⬅️ Voltar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F8FF",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#08457E",
    marginBottom: 20,
  },
  desafioBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
    width: "100%",
    alignItems: "center",
  },
  desafio: {
    fontSize: 20,
    color: "#333",
    textAlign: "center",
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 4,
  },
  buttonDone: {
    backgroundColor: "#4CAF50",
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  voltar: {
    fontSize: 16,
    color: "#007AFF",
    marginTop: 10,
  },
});
