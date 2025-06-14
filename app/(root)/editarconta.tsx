import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";

const EditarConta = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchUserData = async () => {
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      console.log("Erro auth:", authError);
      Alert.alert("Erro", "Não foi possível obter os dados do utilizador.");
      setLoading(false);
      return;
    }

    console.log("authData:", authData);
    setUserId(authData.user.id);
    setEmail(authData.user.email || "");

    const { data: dados, error: dadosErro } = await supabase
      .from("dados_utilizador")
      .select("nome_completo")
      .eq("user_id", authData.user.id)
      .maybeSingle();

    console.log("dados:", dados);
    console.log("dadosErro:", dadosErro);

    if (dadosErro) {
      Alert.alert("Erro", dadosErro.message || "Erro ao carregar dados do utilizador.");
    } else {
      setNome(dados?.nome_completo || "");
    }

    setLoading(false);
  };

  const handleUpdate = async () => {
    if (!userId) return;

    setLoading(true);

    const { error } = await supabase
      .from("dados_utilizador")
      .update({ nome_completo: nome })
      .eq("user_id", userId);

    const { error: emailError } = await supabase.auth.updateUser({ email });

    setLoading(false);

    if (error || emailError) {
      console.log("Update error:", error || emailError);
      Alert.alert("Erro", "Erro ao atualizar os dados.");
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

      <Text className="text-base font-medium mb-2 text-gray-700">Nome Completo</Text>
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
