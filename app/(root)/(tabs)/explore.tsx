import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Alert } from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { supabase } from "../../../lib/supabase";

interface Registro {
  id: string;
  data: string; // Data formatada
  dia: string; // Nome do dia (e.g., Seg, Ter)
  hora: string; // Hora formatada
  tipo: "glicose" | "sono";
  valorGlicose?: string;
  detalhesSono?: string;
}

const Explore = () => {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [selectedRegistro, setSelectedRegistro] = useState<Registro | null>(null);
  const [modalVisivel, setModalVisivel] = useState(false);

  useEffect(() => {
    const fetchRegistros = async () => {
      try {
        // Procura dados de glicose e sono no Supabase
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
          // Formata os dados recebidos
          const formattedData = data.map((item) => ({
            id: item.id,
            data: new Date(item.created_at).toLocaleDateString(), // Data formatada
            dia: new Date(item.created_at).toLocaleDateString("pt-PT", { weekday: "short" }), // Dia (e.g., Seg, Ter)
            hora: new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), // Hora formatada
            tipo: item.glicose ? "glicose" : "sono", // Define se é glicose ou sono
            valorGlicose: item.glicose ? item.glicose.toString() : undefined,
            detalhesSono: item.sono ? `Duração do sono: ${item.sono} horas` : undefined,
          })) as Registro[];
          setRegistros(formattedData);
        }
      } catch (err) {
        console.error("Erro inesperado ao carregar registos:", err);
        Alert.alert("Erro", "Erro inesperado ao carregar os dados.");
      }
    };

    fetchRegistros();
  }, []);

  const renderItem = ({ item }: { item: Registro }) => {
    let iconComponent;

    if (item.tipo === "glicose") {
      iconComponent = (
        <View style={[styles.iconBackground, { backgroundColor: "blue" }]}>
          <MaterialCommunityIcons name="water-opacity" size={16} color="white" />
        </View>
      );
    } else if (item.tipo === "sono") {
      iconComponent = (
        <View style={[styles.iconBackground, { backgroundColor: "purple" }]}>
          <Ionicons name="bed" size={16} color="white" />
        </View>
      );
    }

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

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Histórico</Text>
      <FlatList
        data={registros}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<View style={{ height: 20 }} />}
        ListFooterComponent={<View style={{ height: 20 }} />}
      />

      {/* Modal */}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#f0f0f0" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  item: { backgroundColor: "white", padding: 10, borderRadius: 5, marginBottom: 10 },
  itemHeader: { flexDirection: "column", marginBottom: 5 },
  data: { fontSize: 14, fontWeight: "600", color: "#555", marginBottom: 5 },
  hora: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  details: { fontSize: 16 },
  itemDetails: { flexDirection: "row", alignItems: "center", marginTop: 10 },
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
  buttonClose: { backgroundColor: "#2196F3" },
  textStyle: { color: "white", fontWeight: "bold", textAlign: "center" },
  modalTitle: { marginBottom: 15, textAlign: "center", fontSize: 20, fontWeight: "bold" },
  iconBackground: { borderRadius: 12, width: 24, height: 24, justifyContent: "center", alignItems: "center" },
});

export default Explore;
