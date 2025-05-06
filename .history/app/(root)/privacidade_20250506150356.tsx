import React, { useState } from "react";
import { View, Text, Switch, TextInput, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native-gesture-handler";

const Privacidade = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [glucoseUnit, setGlucoseUnit] = useState("mg/dL");
  const [sleepGoal, setSleepGoal] = useState("8");

  const handleSave = () => {
    // Aqui podes guardar no Supabase ou localStorage
    Alert.alert("Preferências guardadas", `Modo escuro: ${darkMode ? "Sim" : "Não"}\nUnidade: ${glucoseUnit}\nMeta de sono: ${sleepGoal}h`);
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-6">
      <ScrollView contentContainerStyle={{ paddingVertical: 20 }}>
        <Text className="text-2xl font-bold mb-6">Preferências</Text>

        {/* Modo Escuro */}
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-base font-medium">Modo Escuro</Text>
          <Switch value={darkMode} onValueChange={setDarkMode} />
        </View>

        {/* Unidade de Glicose */}
        <View className="mb-6">
          <Text className="text-base font-medium mb-2">Unidade de Glicose</Text>
          <View className="flex-row space-x-4">
            <TouchableOpacity onPress={() => setGlucoseUnit("mg/dL")}>
              <Text className={`text-base ${glucoseUnit === "mg/dL" ? "font-bold text-blue-600" : "text-gray-500"}`}>mg/dL</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setGlucoseUnit("mmol/L")}>
              <Text className={`text-base ${glucoseUnit === "mmol/L" ? "font-bold text-blue-600" : "text-gray-500"}`}>mmol/L</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Meta de Sono */}
        <View className="mb-6">
          <Text className="text-base font-medium mb-2">Meta de Sono (horas)</Text>
          <TextInput
            keyboardType="numeric"
            value={sleepGoal}
            onChangeText={setSleepGoal}
            placeholder="8"
            className="border border-gray-300 rounded-md px-4 py-2"
          />
        </View>

        {/* Botão Guardar */}
        <TouchableOpacity
          className="bg-blue-600 p-4 rounded-xl items-center mt-4"
          onPress={handleSave}
        >
          <Text className="text-white font-bold text-base">Guardar Preferências</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Privacidade;
