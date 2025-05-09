import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Modal,
  Alert,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar, DateData } from "react-native-calendars";
import { supabase } from "../../../lib/supabase";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";

interface Registo {
  id: string;
  data: string;
  dia: string;
  hora: string;
  tipo: "glicose" | "sono" | "comida" | "medicamento";
  valorGlicose?: string;
  detalhesSono?: string;
  food_name?: string;
  quantity?: number;
  calories?: number;
  carbs?: number;
  glycemic_index?: number;
  glycemic_impact?: number;
  medicamento?: string;
  dose?: string;
  descricao?: string;
}

export default function Explore() {
  const [registros, setRegistros] = useState<Registo[]>([]);
  const [selectedRegistro, setSelectedRegistro] = useState<Registo | null>(null);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    const carregarTodos = async () => {
      try {
        const { data: dso, error: err1 } = await supabase
          .from("dados_usuario")
          .select("id, created_at, glicose, sono")
          .order("created_at", { ascending: false });

        const { data: comida, error: err2 } = await supabase
          .from("comida")
          .select("id, created_at, food_name, quantity, calories, carbs, glycemic_index, glycemic_impact")
          .order("created_at", { ascending: false });

        const { data: meds, error: err3 } = await supabase
          .from("medicamentos")
          .select("id, created_at, tipo, quantidade, descricao")
          .order("created_at", { ascending: false });

        if (err1 || err2 || err3) throw err1 || err2 || err3;

        const reg1: Registo[] = (dso || []).map((r) => {
          const dt = new Date(r.created_at);
          return {
            id: r.id,
            data: dt.toISOString().split("T")[0],
            dia: dt.toLocaleDateString("pt-PT", { weekday: "short" }),
            hora: dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            tipo: r.glicose ? "glicose" : "sono",
            valorGlicose: r.glicose?.toString(),
            detalhesSono: r.sono ? `${r.sono} horas de sono` : undefined,
          };
        });

        const reg2: Registo[] = (comida || []).map((r) => {
          const dt = new Date(r.created_at);
          return {
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
          };
        });

        const reg3: Registo[] = (meds || []).map((r) => {
          const dt = new Date(r.created_at);
          return {
            id: r.id,
            data: dt.toISOString().split("T")[0],
            dia: dt.toLocaleDateString("pt-PT", { weekday: "short" }),
            hora: dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            tipo: "medicamento",
            medicamento: r.tipo,
            dose: r.quantidade,
            descricao: r.descricao,
                      };
        });

        const todos = [...reg1, ...reg2, ...reg3].sort((a, b) =>
          new Date(`${b.data}T${b.hora}`).getTime() - new Date(`${a.data}T${a.hora}`).getTime()
        );

        setRegistros(todos);
      } catch (err: any) {
        console.error("Erro ao carregar dados:", err);
        Alert.alert("Erro", err.message || "Falha ao carregar histórico.");
      }
    };

    carregarTodos();
  }, []);

  const registosFiltrados = registros.filter((r) => r.data === selectedDate);

  const renderItem = ({ item }: { item: Registo }) => {
    let icon;
    let bg;
    switch (item.tipo) {
      case "glicose":
        icon = <MaterialCommunityIcons name="water-opacity" size={16} color="white" />;
        bg = "#2563eb";
        break;
      case "sono":
        icon = <Ionicons name="bed" size={16} color="white" />;
        bg = "#9333ea";
        break;
      case "comida":
        icon = <MaterialCommunityIcons name="food-apple" size={16} color="white" />;
        bg = "#16a34a";
        break;
      default:
        icon = <FontAwesome5 name="pills" size={16} color="white" />;
        bg = "#eab308";
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
          <Text style={styles.data}>{item.data} - {item.hora}</Text>
          <Text style={styles.details}>
            {item.tipo === "glicose" ? `Glicose: ${item.valorGlicose} mg/dL` :
              item.tipo === "sono" ? item.detalhesSono :
              item.tipo === "comida" ? `${item.food_name} (${item.quantity}g)` :
              `${item.medicamento} (${item.dose})`}
          </Text>
        </View>
        <View style={[styles.icon, { backgroundColor: bg }]}>{icon}</View>
      </TouchableOpacity>
    );
  };
  const exportarPDF = async () => {
    const resumo: Record<string, {
      totalGlicose: number;
      countG: number;
      totalSono: number;
      countS: number;
      alimentos: string[];
      medicamentos: string[];
    }> = {};
  
    registros.forEach((r) => {
      if (!resumo[r.data]) {
        resumo[r.data] = {
          totalGlicose: 0,
          countG: 0,
          totalSono: 0,
          countS: 0,
          alimentos: [],
          medicamentos: [],
        };
      }
  
      if (r.tipo === "glicose" && r.valorGlicose) {
        resumo[r.data].totalGlicose += parseFloat(r.valorGlicose);
        resumo[r.data].countG++;
      }
  
      if (r.tipo === "sono" && r.detalhesSono) {
        const horas = parseFloat(r.detalhesSono);
        if (!isNaN(horas)) {
          resumo[r.data].totalSono += horas;
          resumo[r.data].countS++;
        }
      }
  
      if (r.tipo === "comida" && r.food_name && r.quantity) {
        resumo[r.data].alimentos.push(`${r.food_name} (${r.quantity}g)`);
      }
  
      if (r.tipo === "medicamento" && r.medicamento && r.dose) {
        resumo[r.data].medicamentos.push(`${r.medicamento} (${r.dose})`);
      }
    });
  
    const html = `
      <html><head><meta charset='utf-8'><style>
        body { font-family: Arial; padding: 20px; }
        h1 { text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; vertical-align: top; }
        .registo { margin-top: 20px; border: 1px solid #ddd; border-radius: 8px; padding: 10px; }
        .titulo { font-weight: bold; margin-bottom: 4px; }
      </style></head><body>
        <h1>Histórico de Registos</h1>
  
        <h2>Tabela Resumo</h2>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Média Glicose</th>
              <th>Média Sono</th>
              <th>Comida</th>
              <th>Medicação</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(resumo).map(([data, val]) => {
              const mediaGlicose = val.countG ? (val.totalGlicose / val.countG).toFixed(1) : "-";
              const mediaSono = val.countS ? (val.totalSono / val.countS).toFixed(1) : "-";
              const alimentos = val.alimentos.length ? val.alimentos.join(", ") : "-";
              const medicamentos = val.medicamentos.length ? val.medicamentos.join(", ") : "-";
  
              return `
                <tr>
                  <td>${data}</td>
                  <td>${mediaGlicose} mg/dL</td>
                  <td>${mediaSono} h</td>
                  <td>${alimentos}</td>
                  <td>${medicamentos}</td>
                </tr>`;
            }).join("")}
          </tbody>
        </table>
  
        <h2 style="margin-top: 40px;">Histórico Completo</h2>
        ${registros.map((r) => `
          <div class="registo">
            <div class="titulo">📅 ${r.data} — ${r.hora}</div>
            <div><span class="titulo">Tipo:</span> ${r.tipo.charAt(0).toUpperCase() + r.tipo.slice(1)}</div>
            ${
              r.tipo === "glicose" ? `<div><span class="titulo">Glicose:</span> ${r.valorGlicose} mg/dL</div>` :
              r.tipo === "sono" ? `<div><span class="titulo">Sono:</span> ${r.detalhesSono}</div>` :
              r.tipo === "comida" ? `
                <div><span class="titulo">Alimento:</span> ${r.food_name}</div>
                <div><span class="titulo">Quantidade:</span> ${r.quantity} g</div>
                <div><span class="titulo">Calorias:</span> ${r.calories}</div>
                <div><span class="titulo">Carboidratos:</span> ${r.carbs}</div>
                <div><span class="titulo">Índice Glicémico:</span> ${r.glycemic_index}</div>
                <div><span class="titulo">Impacto Glicémico:</span> ${r.glycemic_impact}</div>` :
              r.tipo === "medicamento" ? `
                <div><span class="titulo">Medicamento:</span> ${r.medicamento}</div>
                <div><span class="titulo">Dose:</span> ${r.dose}</div>
                <div><span class="titulo">Descrição:</span> ${r.descricao}</div>` :
              ''
            }
          </div>
        `).join("")}
  
      </body></html>
    `;
  
    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (e) {
      Alert.alert("Erro", "Erro ao gerar PDF");
      console.error(e);
    }
  };
  const calcularMedias = () => {
    const medias: Record<string, { totalGlicose: number; countG: number; totalSono: number; countS: number; mediaGlicose: number; mediaSono: number }> = {};
    registros.forEach((r) => {
      if (!medias[r.data]) medias[r.data] = { totalGlicose: 0, countG: 0, totalSono: 0, countS: 0, mediaGlicose: 0, mediaSono: 0 };
      if (r.tipo === "glicose" && r.valorGlicose) {
        medias[r.data].totalGlicose += parseFloat(r.valorGlicose);
        medias[r.data].countG++;
      }
      if (r.tipo === "sono" && r.detalhesSono) {
        const horas = parseFloat(r.detalhesSono);
        if (!isNaN(horas)) {
          medias[r.data].totalSono += horas;
          medias[r.data].countS++;
        }
      }
    });
    Object.entries(medias).forEach(([data, val]) => {
      val.mediaGlicose = val.countG ? val.totalGlicose / val.countG : 0;
      val.mediaSono = val.countS ? val.totalSono / val.countS : 0;
    });
    return medias;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Histórico</Text>

      <TouchableOpacity style={styles.botao} onPress={exportarPDF}>
        <Text style={styles.textoBotao}>Exportar PDF</Text>
      </TouchableOpacity>

      <Calendar
        onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
        markedDates={{ [selectedDate]: { selected: true, selectedColor: "#3b82f6" } }}
        theme={{ selectedDayBackgroundColor: "#3b82f6", arrowColor: "#3b82f6" }}
        style={{ marginBottom: 10 }}
      />

      <FlatList
        data={registosFiltrados}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>Sem registos.</Text>}
      />

      <Modal visible={modalVisivel} transparent animationType="slide">
        <View style={styles.centered}>
          <View style={styles.modal}>
            {selectedRegistro && (
              <>
                <Text style={styles.modalTitle}>Detalhes</Text>
                <Text>Data: {selectedRegistro.data}</Text>
                <Text>Hora: {selectedRegistro.hora}</Text>
                {selectedRegistro.tipo === "comida" && (
                  <>
                    <Text>🍽️ {selectedRegistro.food_name}</Text>
                    <Text>⚖️ Quantidade: {selectedRegistro.quantity}g</Text>
                    <Text>🔥 Calorias: {selectedRegistro.calories}</Text>
                    <Text>🍞 Carbohidratos: {selectedRegistro.carbs}</Text>
                    <Text>📊 IG: {selectedRegistro.glycemic_index}</Text>
                    <Text>💡 Impacto: {selectedRegistro.glycemic_impact}</Text>
                  </>
                )}
                {selectedRegistro.tipo === "glicose" && (
                  <Text>Glicose: {selectedRegistro.valorGlicose} mg/dL</Text>
                )}
                {selectedRegistro.tipo === "sono" && (
                  <Text>{selectedRegistro.detalhesSono}</Text>
                )}
                {selectedRegistro.tipo === "medicamento" && (
                  <>
                    <Text>💊 {selectedRegistro.medicamento}</Text>
                    <Text>Dose: {selectedRegistro.dose}</Text>
                    <Text>📝 Descrição: {selectedRegistro.descricao}</Text>
                  </>
                )}
              </>
            )}
            <TouchableOpacity
              style={[styles.botao, { backgroundColor: "#ef4444" }]}
              onPress={() => setModalVisivel(false)}
            >
              <Text style={styles.textoBotao}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", padding: 16 },
  header: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  item: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 12, backgroundColor: "#fff", borderRadius: 10, marginVertical: 6, elevation: 2 },
  itemHeader: { flex: 1 },
  icon: { width: 28, height: 28, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  data: { fontWeight: "600", marginBottom: 4 },
  details: { fontSize: 16, color: "#555" },
  modal: { backgroundColor: "#fff", padding: 20, borderRadius: 12, alignItems: "center", width: "85%" },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.3)" },
  botao: { backgroundColor: "#3b82f6", padding: 10, borderRadius: 8, alignItems: "center", marginVertical: 10 },
  textoBotao: { color: "#fff", fontWeight: "600" },
  empty: { textAlign: "center", color: "#888", marginTop: 20 },
});
