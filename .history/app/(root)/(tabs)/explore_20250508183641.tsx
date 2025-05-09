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
          .select("id, created_at, glicose, sono");

        const { data: comidaData, error: comidaErr } = await supabase
          .from("comida")
          .select("id, created_at, food_name, quantity, calories, carbs, glycemic_index, glycemic_impact");

        if (dsoErr || comidaErr) throw dsoErr || comidaErr;

        const format = (item: any, tipo: "glicose" | "sono" | "comida"): Registo => {
          const dt = new Date(item.created_at);
          return {
            id: item.id,
            data: dt.toISOString().split("T")[0],
            dia: dt.toLocaleDateString("pt-PT", { weekday: "short" }),
            hora: dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            tipo,
            valorGlicose: item.glicose?.toString(),
            detalhesSono: item.sono ? `Sono: ${item.sono} h` : undefined,
            food_name: item.food_name,
            quantity: item.quantity,
            calories: item.calories,
            carbs: item.carbs,
            glycemic_index: item.glycemic_index,
            glycemic_impact: item.glycemic_impact,
          };
        };

        const dsoRegistos = (dsodata || []).map((i) => format(i, i.glicose ? "glicose" : "sono"));
        const comidaRegistos = (comidaData || []).map((i) => format(i, "comida"));

        setRegistros([...dsoRegistos, ...comidaRegistos].sort((a, b) =>
          new Date(`${b.data}T${b.hora}`).getTime() - new Date(`${a.data}T${a.hora}`).getTime()
        ));
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        Alert.alert("Erro", "Falha ao carregar histórico.");
      }
    };

    fetchAll();

    const channel = supabase
      .channel("real-time-history")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "dados_usuario" }, fetchAll)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "comida" }, fetchAll)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
          <Text style={styles.hora}>{item.dia}, {item.hora}</Text>
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
        <View style={[styles.iconBackground, { backgroundColor: bg }]}>{icon}</View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Histórico</Text>
      <FlatList
        data={registrosFiltrados}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>Sem registos para este dia.</Text>}
        ListHeaderComponent={
          <Calendar
            onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
            markedDates={{ [selectedDate]: { selected: true, selectedColor: "#4A90E2" } }}
            style={styles.calendar}
            theme={{ selectedDayBackgroundColor: "#4A90E2", todayTextColor: "#4A90E2", arrowColor: "#4A90E2" }}
          />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />
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
});

export default Explore;
