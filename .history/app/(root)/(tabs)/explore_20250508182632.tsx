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

  const registrosFiltrados = registros.filter((r) => r.data === selectedDate);

  const renderItem = ({ item }: { item: Registo }) => {
    let icon;
    let bg: string;
    if (item.tipo === "glicose") {
      icon = <MaterialCommunityIcons name="water-opacity" size={16} color="white" />;
      bg = "blue";
    } else if (item.tipo === "sono") {
      icon = <Ionicons name="bed" size={16} color="white" />;
      bg = "purple";
    } else {
      icon = <MaterialCommunityIcons name="food-apple" size={16} color="white" />;
      bg = "green";
    }

    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => {
          setSelectedRegistro(item);
          setModalVisivel(true);
        }}
      >
        <View style={styles.itemHeader}>
          <Text style={styles.data}>{item.data}</Text>
          <Text style={styles.hora}>
            {item.dia}, {item.hora}
          </Text>
          <Text style={styles.details}>
            {item.tipo === "glicose" && item.valorGlicose
              ? `Glicose: ${item.valorGlicose} mg/dL`
              : item.tipo === "sono" && item.detalhesSono
              ? item.detalhesSono
              : item.tipo === "comida"
              ? `${item.food_name} (${item.quantity}g)`
              : ""}
          </Text>
        </View>
        <View style={[styles.iconBackground, { backgroundColor: bg }]}>
          {icon}
        </View>
      </TouchableOpacity>
    );
  };

  const exportarParaPDF = async () => {
    const html = `
      <html><head><meta charset="utf-8"/>
        <style>
          body{font-family:Arial;padding:20px;}
          h1{text-align:center;}
          .r{margin-bottom:12px;border:1px solid #ccc;padding:8px;border-radius:6px;}
          .l{font-weight:bold;}
        </style>
      </head><body>
      <h1>Histórico de Registos</h1>
      ${registros
        .map(
          (r) => `
        <div class="r">
          <div class="l">Data:</div> ${r.data} (${r.dia})<br/>
          <div class="l">Hora:</div> ${r.hora}<br/>
          <div class="l">Tipo:</div> ${
            r.tipo === "glicose"
              ? "Glicose"
              : r.tipo === "sono"
              ? "Sono"
              : "Comida"
          }<br/>
          <div class="l">Valor:</div>${
            r.tipo === "glicose"
              ? " " + r.valorGlicose + " mg/dL"
              : r.tipo === "sono"
              ? " " + r.detalhesSono
              : ` ${r.food_name} — ${r.calories} kcal, ${r.carbs}g carbs, IG ${r.glycemic_index}`
          }
        </div>
      `
        )
        .join("")}
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
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Histórico</Text>

      <TouchableOpacity style={styles.botaoExportar} onPress={exportarParaPDF}>
        <Text style={styles.textoBotao}>Exportar registos em PDF</Text>
      </TouchableOpacity>

      <FlatList
        data={registrosFiltrados}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Sem registos para este dia.</Text>
        }
        ListHeaderComponent={
          <Calendar
            onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
            markedDates={{
              [selectedDate]: { selected: true, selectedColor: "#4A90E2" },
            }}
            style={styles.calendar}
            theme={{
              selectedDayBackgroundColor: "#4A90E2",
              todayTextColor: "#4A90E2",
              arrowColor: "#4A90E2",
            }}
          />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <Modal
        visible={modalVisivel}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisivel(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {selectedRegistro && selectedRegistro.tipo === "comida" ? (
              <>
                <Text style={styles.modalTitle}>Detalhes da Comida</Text>
                <Text>🍽️ {selectedRegistro.food_name}</Text>
                <Text>⚖️ Quant.: {selectedRegistro.quantity} g</Text>
                <Text>🔥 Calorias: {selectedRegistro.calories}</Text>
                <Text>🍞 Carbs: {selectedRegistro.carbs}</Text>
                <Text>📊 IG: {selectedRegistro.glycemic_index}</Text>
                <Text>🛑 Impacto: {selectedRegistro.glycemic_impact}</Text>
              </>
            ) : selectedRegistro && selectedRegistro.tipo === "glicose" ? (
              <>
                <Text style={styles.modalTitle}>Glicose</Text>
                <Text>{selectedRegistro.valorGlicose} mg/dL</Text>
              </>
            ) : selectedRegistro && selectedRegistro.tipo === "sono" ? (
              <>
                <Text style={styles.modalTitle}>Sono</Text>
                <Text>{selectedRegistro.detalhesSono}</Text>
              </>
            ) : null}

            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisivel(false)}
            >
              <Text style={styles.textStyle}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: "#f0f0f0", padding: 10 },
  header:          { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  calendar:        { marginBottom: 20, borderRadius: 10, elevation: 1 },
  item:            { backgroundColor: "#fff", padding: 10, borderRadius: 5, marginBottom: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  itemHeader:      { flex: 1 },
  data:            { fontSize: 14, color: "#555" },
  hora:            { fontSize: 16, fontWeight: "bold" },
  details:         { fontSize: 16 },
  iconBackground:  { width: 24, height: 24, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  emptyText:       { textAlign: "center", color: "#888", marginTop: 20 },
  centeredView:    { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.3)" },
  modalView:       { width: "80%", backgroundColor: "#fff", borderRadius: 8, padding: 20, alignItems: "center" },
  modalTitle:      { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  button:          { marginTop: 15, padding: 10, borderRadius: 6 },
  buttonClose:     { backgroundColor: "#4A90E2" },
  textStyle:       { color: "#fff" },
  botaoExportar:   { backgroundColor: "#4A90E2", padding: 12, borderRadius: 8, alignItems: "center", marginBottom: 10 },
  textoBotao:      { color: "#fff", fontWeight: "600" },
});

export default Explore;
