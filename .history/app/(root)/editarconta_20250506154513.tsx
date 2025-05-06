import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";

const EditarConta = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      Alert.alert("Erro", "Não foi possível obter os dados do utilizador.");
      return;
    }
    setNome(data.user.user_metadata?.full_name || "");
    setEmail(data.user.email || "");
    setLoading(false);
  };

  const handleUpdate = async () => {
    setLoading(true);
    const { error: userError } = await supabase.auth.updateUser({
      email,
      data: { full_name: nome },
    });

    setLoading(false);

    if (userError) {
      Alert.alert("Erro", "Não foi possível atualizar a conta.");
    } else {
      Alert.alert("Sucesso", "Dados atualizados com sucesso!");
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white px-6">
      <Text className="text-2xl font-bold mt-6 mb-6">Editar Conta</Text>

      <Text className="text-base font-medium mb-2 text-gray-700">Nome</Text>
      <TextInput
        value={nome}
        onChangeText={setNome}
        className="border border-gray-300 rounded-lg px-4 py-3 mb-5 text-gray-800"
        placeholder="Nome completo"
      />

      <Text className="text-base font-medium mb-2 text-gray-700">Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        className="border border-gray-300 rounded-lg px-4 py-3 mb-5 text-gray-800"
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity
        onPress={handleUpdate}
        className="bg-blue-600 p-4 rounded-xl items-center mt-4"
      >
        <Text className="text-white font-bold text-base">Guardar Alterações</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default EditarConta;
