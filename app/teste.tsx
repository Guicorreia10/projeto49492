import React from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { guardarDadoSmartwatch } from './utils/guardarSmartwatch';
import { scanForWatch } from './ble/scan';
import { connectToWatch } from './ble/connect';

import type { Device } from "react-native-ble-plx";

export default function Teste() {
  const user_id = "simulacao-123"; // substitui pelo teu user_id real se quiseres

  const testarGuardar = async (tipo: "sono" | "passos" | "exercicio") => {
    try {
      await guardarDadoSmartwatch(tipo, Math.floor(Math.random() * 10000), user_id);
      Alert.alert("✅ Sucesso", `Simulado guardar ${tipo}`);
    } catch (e) {
      console.error(e);
      Alert.alert("❌ Erro", `Erro ao guardar ${tipo}`);
    }
  };

  const testarBluetooth = () => {
    scanForWatch(async (device: Device) => {
      Alert.alert("🔍 Encontrado", `Smartwatch: ${device.name || device.id}`);
      try {
        await connectToWatch(device);
        Alert.alert("✅ Conectado", `Com ${device.name || device.id}`);
      } catch (err) {
        console.warn(err);
        Alert.alert("❌ Falha", "Erro na conexão BLE");
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔬 Testes de Funções</Text>

      <TouchableOpacity style={styles.button} onPress={() => testarGuardar("sono")}> 
        <Text style={styles.text}>Testar guardar sono</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => testarGuardar("passos")}>
        <Text style={styles.text}>Testar guardar passos</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => testarGuardar("exercicio")}> 
        <Text style={styles.text}>Testar guardar exercício</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: "#8844EE" }]} onPress={testarBluetooth}>
        <Text style={styles.text}>Testar scan BLE</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: "80%",
    alignItems: "center",
  },
  text: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
