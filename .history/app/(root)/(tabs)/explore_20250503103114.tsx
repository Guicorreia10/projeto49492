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
import { Calendar } from "react-native-calendars";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing"; // IMPORTAÇÃO CORRETA

interface Registo {
  id: string;
  data: string;
  dia: string;
  hora: string;
  tipo: "glicose" | "sono";
  valorGlicose?: string;
  detalhesSono?: string;
}

const Explore = () => {
  const [registros, setRegistros] = useState<Registo[]>([]);
  const [selectedRegistro, setSelectedRegistro] = useState<Registo | null>(null);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    const fetchRegistos = async () => {
      try {
        const { data, error } = await supabase
          .from("dados_usuario")
          .select("id, created_at, glicose, sono")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Erro ao procurar dados:", error);
          Alert.alert("Erro", "Não foi possível carregar os dados.");
          return;
        }

        if (data) {
          const formattedData = data.map((item) => ({
            id: item.id,
            data: new Date(item.created_at).toISOString().split("T")[0],
            dia: new Date(item.created_at).toLocaleDateString("pt-PT", { weekday: "short" }),
            hora: new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            tipo: item.glicose ? "glicose" : "sono",
            valorGlicose: item.glicose ? item.glicose.toString() : undefined,
            detalhesSono: item.sono ? `Duração do sono: ${item.sono} horas` : undefined,
          })) as Registo[];
          setRegistros(formattedData);
        }
      } catch (err) {
        console.error("Erro inesperado ao carregar registos:", err);
        Alert.alert("Erro", "Erro inesperado ao carregar os dados.");
      }
    };

    fetchRegistos();
  }, []);

  const registrosFiltrados = registros.filter((registro) => registro.data === selectedDate);

  const renderItem = ({ item }: { item: Registo }) => {
    const iconComponent =
      item.tipo === "glicose" ? (
        <View style={[styles.iconBackground, { backgroundColor: "blue" }]}>
          <MaterialCommunityIcons name="water-opacity" size={16} color="white" />
        </View>
      ) : (
        <View style={[styles.iconBackground, { backgroundColor: "purple" }]}>
          <Ionicons name="bed" size={16} color="white" />
        </View>
      );

    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedRegistro(item);
          setModalVisivel(true);
        }}
        style={styles.item}
      >
        <View style={styles.itemHeader}>
          <Text style={styles.data}>{item.data}</Text>
          <Text style={styles.hora}>
            {item.dia}, {item.hora}
          </Text>
          <Text style={styles.details}>
            {item.tipo === "glicose" && item.valorGlicose
              ? `Glicose: ${item.valorGlicose} mg/dL`
              : item.detalhesSono}
          </Text>
        </View>
        <View style={styles.itemDetails}>{iconComponent}</View>
      </TouchableOpacity>
    );
  };

  const exportarParaPDF = async () => {
    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            h1 { text-align: center; color: #4A90E2; }
            .registo { margin-bottom: 16px; padding: 12px; border: 1px solid #ddd; border-radius: 8px; }
            .linha { margin-bottom: 4px; }
            .titulo { font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Histórico de Registos</h1>
          ${registros.map((r) => `
            <div class="registo">
              <div class="linha"><span class="titulo">Data:</span> ${r.data} (${r.dia})</div>
              <div class="linha"><span class="titulo">Hora:</span> ${r.hora}</div>
              <div class="linha"><span class="titulo">Tipo:</span> ${r.tipo === "glicose" ? "Glicose" : "Sono"}</div>
              <div class="linha">
                ${r.tipo === "glicose" ? `<span class="titulo">Valor:</span> ${r.valorGlicose} mg/dL` : r.detalhesSono}
              </div>
            </div>
          `).join("")}
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, {
        UTI: ".pdf",
        mimeType: "application/pdf",
      });
    } catch (erro) {
      console.error("Erro ao gerar PDF:", erro);
      Alert.alert("Erro", "Ocorreu um problema ao gerar o ficheiro PDF.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Histórico</Text>

      <TouchableOpacity style={styles.botaoExportar} onPress={exportarParaPDF}>
        <Text style={styles.textoBotao}>Exportar registos em PDF</Text>
      </TouchableOpacity>

      <Calendar
        onDayPress={(day: { dateString: string }) => setSelectedDate(day.dateString)}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: "#4A90E2" },
        }}
        style={styles.calendar}
        theme={{
          selectedDayBackgroundColor: "#4A90E2",
          selectedDayTextColor: "#fff",
          todayTextColor: "#4A90E2",
          dayTextColor: "#000",
          arrowColor: "#4A90E2",
        }}
      />

      <FlatList
        data={registrosFiltrados}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>Sem registos para este dia.</Text>}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisivel}
        onRequestClose={() => setModalVisivel(!modalVisivel)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{selectedRegistro?.tipo === "sono" ? "Sono" : "Glicose"}</Text>
            <Text>
              {selectedRegistro?.tipo === "sono" && selectedRegistro?.detalhesSono
                ? selectedRegistro.detalhesSono
                : ""}
              {selectedRegistro?.tipo === "glicose" && selectedRegistro?.valorGlicose
                ? `Glicose: ${selectedRegistro.valorGlicose} mg/dL`
                : ""}
            </Text>
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisivel(!modalVisivel)}
            >
              <Text style={styles.textStyle}>Voltar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f0f0", padding: 10 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  calendar: { marginBottom: 20, borderRadius: 10, elevation: 1 },
  item: { backgroundColor: "white", padding: 10, borderRadius: 5, marginBottom: 10 },
  itemHeader: { flexDirection: "column", marginBottom: 5 },
  data: { fontSize: 14, fontWeight: "600", color: "#555", marginBottom: 5 },
  hora: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  details: { fontSize: 16 },
  itemDetails: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  emptyText: { textAlign: "center", color: "#888", marginTop: 20 },
  centeredView: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 22 },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: { borderRadius: 20, padding: 10, elevation: 2 },
  buttonClose: { backgroundColor: "#4A90E2" },
  textStyle: { color: "white", fontWeight: "bold", textAlign: "center" },
  modalTitle: { marginBottom: 15, textAlign: "center", fontSize: 20, fontWeight: "bold" },
  iconBackground: { borderRadius: 12, width: 24, height: 24, justifyContent: "center", alignItems: "center" },
  botaoExportar: {
    backgroundColor: "#4A90E2",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  textoBotao: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default Explore;
