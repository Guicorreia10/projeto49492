// app/root/tabs/manual-input/insulina.tsx

import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView
} from "react-native";
import { supabase } from "../../../../lib/supabase";
import { useRouter } from "expo-router";

const tipos = ["Insulina", "Diabetes", "Sono"];

export default function RegistarMedicacao() {
  const [tipo, setTipo] = useState("Insulina");
  const [quantidade, setQuantidade] = useState("");
  const [descricao, setDescricao] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const guardar = async () => {
    if (!quantidade || isNaN(Number(quantidade))) {
      Alert.alert("Erro", "Introduza uma quantidade válida.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      const user = authData?.user;
      if (authErr || !user) throw new Error("Utilizador sem autenticação feita.");

      const { error: insertErr } = await supabase.from("medicamentos").insert({
        user_id: user.id,
        tipo,
        descricao,
        quantidade: Number(quantidade),
      });

      if (insertErr) throw insertErr;

      Alert.alert("Sucesso", "Registo guardado com sucesso.");
      setQuantidade("");
      setDescricao("");
      setTipo("Insulina");
    } catch (err: any) {
      Alert.alert("Erro", err.message || "Erro ao guardar registo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Registar Medicação</Text>
        {/* Botão Voltar */}
              <TouchableOpacity
                onPress={() => router.back()}
                style={{
                  position: 'absolute',
                  top: 20,
                  left: 10,
                  padding: 10,
                  backgroundColor: '#007AFF',
                  borderRadius: 5,
                  zIndex: 10,
                }}
              ></TouchableOpacity>

        <Text style={styles.label}>Tipo:</Text>
        <View style={styles.tipoRow}>
          {tipos.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tipoBtn, tipo === t && styles.tipoBtnAtivo]}
              onPress={() => setTipo(t)}
            >
              <Text style={tipo === t ? styles.tipoTextAtivo : styles.tipoText}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Quantidade:</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={quantidade}
          onChangeText={setQuantidade}
          placeholder="Dose"
        />

        <Text style={styles.label}>Descrição (opcional):</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          multiline
          value={descricao}
          onChangeText={setDescricao}
          placeholder="Ex: Horas/Possiveis sintomas"
        />

        <TouchableOpacity
          style={styles.botao}
          onPress={guardar}
          disabled={isSubmitting}
        >
          <Text style={styles.botaoTexto}>
            {isSubmitting ? "A guardar..." : "Guardar"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scroll: { padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  label: { fontSize: 16, fontWeight: "600", marginTop: 20, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#f9f9f9",
  },
  tipoRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  tipoBtn: {
    flex: 1,
    marginHorizontal: 4,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
  },
  tipoBtnAtivo: {
    backgroundColor: "#4A90E2",
  },
  tipoText: { color: "#333" },
  tipoTextAtivo: { color: "#fff", fontWeight: "bold" },
  botao: {
    marginTop: 30,
    backgroundColor: "#4A90E2",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  botaoTexto: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
