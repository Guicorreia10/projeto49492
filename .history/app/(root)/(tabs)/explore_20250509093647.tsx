// app/(root)/tabs/Explore.tsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Modal,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { supabase } from "../../../lib/supabase";
import { Calendar, DateData } from "react-native-calendars";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

interface Registo {
  id: string;
  data: string;
  dia: string;
  hora: string;
  tipo: "glicose" | "sono" | "comida";
  valorGlicose?: string;
  detalhesSono?: string;
  food_name?: string;
  quantity?: number;
  calories?: number;
  carbs?: number;
  glycemic_index?: number;
  glycemic_impact?: number;
}

const Explore = () => {
  const [registros, setRegistros] = useState<Registo[]>([]);
  const [selectedRegistro, setSelectedRegistro] = useState<Registo | null>(null);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const { data: dsodata, error: dsoErr } = await supabase
          .from("dados_usuario")
          .select("id, created_at, glicose, sono")
          .order("created_at", { ascending: false });
        if (dsoErr) throw dsoErr;

        const { data: comidaData, error: comidaErr } = await supabase
          .from("comida")
          .select("id, created_at, food_name, quantity, calories, carbs, glycemic_index, glycemic_impact")
          .order("created_at", { ascending: false });
        if (comidaErr) throw comidaErr;

        const regsDSO: Registo[] = (dsodata || []).map((item) => {
          const dt = new Date(item.created_at);
          return {
            id: item.id,
            data: dt.toISOString().split("T")[0],
            dia: dt.toLocaleDateString("pt-PT", { weekday: "short" }),
            hora: dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            tipo: item.glicose ? "glicose" : "sono",
            valorGlicose: item.glicose?.toString(),
            detalhesSono: item.sono ? `Sono: ${item.sono} h` : undefined,
          };
        });

        const regsComida: Registo[] = (comidaData || []).map((item) => {
          const dt = new Date(item.created_at);
          return {
            id: item.id,
            data: dt.toISOString().split("T")[0],
            dia: dt.toLocaleDateString("pt-PT", { weekday: "short" }),
            hora: dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            tipo: "comida",
            food_name: item.food_name,
            quantity: item.quantity,
            calories: item.calories,
            carbs: item.carbs,
            glycemic_index: item.glycemic_index,
            glycemic_impact: item.glycemic_impact,
          };
        });

        const todos = [...regsDSO, ...regsComida].sort((a, b) =>
          new Date(`${b.data}T${b.hora}`).getTime() -
          new Date(`${a.data}T${a.hora}`).getTime()
        );

        setRegistros(todos);
      } catch (err: any) {
        console.error("Erro ao carregar dados:", err);
        Alert.alert("Erro", err.message || "Falha ao carregar histórico.");
      }
    };

    fetchAll();
  }, []);

  const exportarParaPDF = async () => {
    const totalCalorias = registros.reduce((acc, r) => acc + (r.calories || 0), 0);
    const totalCarbs = registros.reduce((acc, r) => acc + (r.carbs || 0), 0);
    const totalGlicose = registros.filter((r) => r.tipo === "glicose").length;
    const totalSono = registros.filter((r) => r.tipo === "sono").length;

    const html = `
      <html><head><meta charset="utf-8" />
      <style>
        body { font-family: Arial; padding: 24px; }
        h1 { text-align: center; color: #4A90E2; }
        .summary { margin-bottom: 24px; }
        .summary h2 { font-size: 18px; margin-bottom: 8px; }
        .summary table { width: 100%; border-collapse: collapse; }
        .summary td, .summary th { border: 1px solid #ccc; padding: 8px; text-align: left; }
        .entry { margin-bottom: 12px; padding: 10px; border: 1px solid #ddd; border-radius: 6px; }
      </style>
      </head><body>
        <h1>Histórico de Registos</h1>
        <div class="summary">
          <h2>Resumo</h2>
          <table>
            <tr><th>Total de Registos</th><td>${registros.length}</td></tr>
            <tr><th>Registos de Glicose</th><td>${totalGlicose}</td></tr>
            <tr><th>Registos de Sono</th><td>${totalSono}</td></tr>
            <tr><th>Calorias Totais (Comida)</th><td>${totalCalorias.toFixed(1)} kcal</td></tr>
            <tr><th>Carboidratos Totais</th><td>${totalCarbs.toFixed(1)} g</td></tr>
          </table>
        </div>
        ${registros.map(r => `
          <div class="entry">
            <strong>Data:</strong> ${r.data} (${r.dia})<br/>
            <strong>Hora:</strong> ${r.hora}<br/>
            <strong>Tipo:</strong> ${r.tipo}<br/>
            <strong>Valor:</strong> ${
              r.tipo === "glicose" ? r.valorGlicose + " mg/dL" :
              r.tipo === "sono" ? r.detalhesSono :
              `${r.food_name} — ${r.calories} kcal, ${r.carbs}g carbs, IG ${r.glycemic_index}`
            }
          </div>
        `).join("")}
      </body></html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      Alert.alert("Exportar PDF", "Escolha uma opção:", [
        {
          text: "Partilhar",
          onPress: () => Sharing.shareAsync(uri, { UTI: ".pdf", mimeType: "application/pdf" }),
        },
        { text: "Guardar", onPress: () => Alert.alert("Guardado em", uri) },
        { text: "Cancelar", style: "cancel" },
      ]);
    } catch (e) {
      console.error(e);
      Alert.alert("Erro", "Falha ao gerar PDF.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 10 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center" }}>Histórico</Text>
      <TouchableOpacity onPress={exportarParaPDF} style={{ backgroundColor: "#4A90E2", padding: 10, borderRadius: 8, marginVertical: 10 }}>
        <Text style={{ color: "white", textAlign: "center", fontWeight: "bold" }}>Exportar PDF</Text>
      </TouchableOpacity>
      <Calendar
        onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
        markedDates={{ [selectedDate]: { selected: true, selectedColor: "#4A90E2" } }}
      />
      <FlatList
        data={registros.filter(r => r.data === selectedDate)}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => { setSelectedRegistro(item); setModalVisivel(true); }} style={{ backgroundColor: "#fff", marginVertical: 6, padding: 12, borderRadius: 8 }}>
            <Text style={{ fontWeight: "600" }}>{item.data} ({item.dia})</Text>
            <Text>{item.hora}</Text>
            <Text>{item.tipo === "glicose" ? `Glicose: ${item.valorGlicose} mg/dL` : item.tipo === "sono" ? item.detalhesSono : `${item.food_name} (${item.quantity}g)`}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 20 }}>Sem registos para este dia.</Text>}
      />

      <Modal visible={modalVisivel} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.4)" }}>
          <View style={{ backgroundColor: "#fff", padding: 20, borderRadius: 10, width: "80%" }}>
            {selectedRegistro && (
              <>
                <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 10 }}>{selectedRegistro.tipo.toUpperCase()}</Text>
                {selectedRegistro.tipo === "comida" ? (
                  <>
                    <Text>🍽️ {selectedRegistro.food_name}</Text>
                    <Text>⚖️ Quantidade: {selectedRegistro.quantity} g</Text>
                    <Text>🔥 Calorias: {selectedRegistro.calories}</Text>
                    <Text>🍞 Carbs: {selectedRegistro.carbs}</Text>
                    <Text>📊 IG: {selectedRegistro.glycemic_index}</Text>
                    <Text>🛑 Impacto: {selectedRegistro.glycemic_impact}</Text>
                  </>
                ) : selectedRegistro.tipo === "glicose" ? (
                  <Text>Glicose: {selectedRegistro.valorGlicose} mg/dL</Text>
                ) : (
                  <Text>{selectedRegistro.detalhesSono}</Text>
                )}
                <TouchableOpacity onPress={() => setModalVisivel(false)} style={{ marginTop: 20, backgroundColor: "#4A90E2", padding: 10, borderRadius: 6 }}>
                  <Text style={{ color: "white", textAlign: "center" }}>Fechar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Explore;
