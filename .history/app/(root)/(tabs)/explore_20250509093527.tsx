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
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { supabase } from "../../../lib/supabase";
import { Calendar, DateData } from "react-native-calendars";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

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
  nome?: string;
  descricao?: string;
  quantidade?: string;
}

export default function Explore() {
  const [registros, setRegistros] = useState<Registo[]>([]);
  const [selectedRegistro, setSelectedRegistro] = useState<Registo | null>(null);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    const canais = supabase.channel("registo_feed")
      .on("postgres_changes", { event: "INSERT", schema: "public" }, () => fetchAll())
      .subscribe();
    fetchAll();
    return () => {
      supabase.removeChannel(canais);
    };
  }, []);

  const fetchAll = async () => {
    try {
      const { data: dsodata } = await supabase.from("dados_usuario").select("id, created_at, glicose, sono").order("created_at", { ascending: false });
      const { data: comidaData } = await supabase.from("comida").select("id, created_at, food_name, quantity, calories, carbs, glycemic_index, glycemic_impact").order("created_at", { ascending: false });
      const { data: medsData } = await supabase.from("medicamentos").select("id, created_at, nome, descricao, quantidade").order("created_at", { ascending: false });

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

      const regsMeds: Registo[] = (medsData || []).map((item) => {
        const dt = new Date(item.created_at);
        return {
          id: item.id,
          data: dt.toISOString().split("T")[0],
          dia: dt.toLocaleDateString("pt-PT", { weekday: "short" }),
          hora: dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          tipo: "medicamento",
          nome: item.nome,
          descricao: item.descricao,
          quantidade: item.quantidade,
        };
      });

      const todos = [...regsDSO, ...regsComida, ...regsMeds].sort((a, b) => new Date(`${b.data}T${b.hora}`).getTime() - new Date(`${a.data}T${a.hora}`).getTime());
      setRegistros(todos);
    } catch (err: any) {
      Alert.alert("Erro", err.message || "Falha ao carregar histórico.");
    }
  };

  const exportarParaPDF = async () => {
    const resumo = {
      totalGlicose: registros.filter(r => r.tipo === "glicose").length,
      totalSono: registros.filter(r => r.tipo === "sono").length,
      totalComida: registros.filter(r => r.tipo === "comida").length,
      totalMedicamento: registros.filter(r => r.tipo === "medicamento").length,
    };

    const html = `
      <html><head><meta charset="utf-8"/>
        <style>
          body{font-family:Arial;padding:20px;}
          h1{text-align:center;}
          table{width:100%;border-collapse:collapse;margin-bottom:20px;}
          th,td{border:1px solid #ccc;padding:8px;text-align:left;}
          .resumo th{background-color:#f0f0f0;}
        </style>
      </head><body>
      <h1>Histórico de Registos</h1>
      <table class="resumo">
        <tr><th>Tipo</th><th>Total</th></tr>
        <tr><td>Glicose</td><td>${resumo.totalGlicose}</td></tr>
        <tr><td>Sono</td><td>${resumo.totalSono}</td></tr>
        <tr><td>Comida</td><td>${resumo.totalComida}</td></tr>
        <tr><td>Medicamentos</td><td>${resumo.totalMedicamento}</td></tr>
      </table>
      ${registros.map(r => `
        <div style="margin-bottom:12px;padding:8px;border:1px solid #ccc">
          <div><strong>Data:</strong> ${r.data} (${r.dia})</div>
          <div><strong>Hora:</strong> ${r.hora}</div>
          <div><strong>Tipo:</strong> ${r.tipo}</div>
          <div><strong>Detalhes:</strong>
            ${r.tipo === "glicose" ? `Glicose: ${r.valorGlicose} mg/dL` :
              r.tipo === "sono" ? r.detalhesSono :
              r.tipo === "comida" ? `${r.food_name} — ${r.calories} kcal, ${r.carbs}g carbs, IG ${r.glycemic_index}` :
              `${r.nome} — ${r.descricao} — ${r.quantidade}`
            }
          </div>
        </div>`).join('')}
      </body></html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: ".pdf", mimeType: "application/pdf" });
    } catch (e) {
      Alert.alert("Erro", "Falha ao gerar PDF.");
    }
  };

  return <></>; // UI omitida nesta versão
}

const styles = StyleSheet.create({});
