import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import icons from "@/constants/icons";
import images from "../../../constants/images";

const Profile = () => {
  const [language, setLanguage] = useState<string>("Português");
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.replace("/sign-in");
      Alert.alert("Sucesso", "Sessão terminada com sucesso!");
    } catch (error: unknown) {
      Alert.alert("Erro", "Erro ao terminar sessão.");
    }
  };

  const changeLanguage = (newLanguage: string) => {
    setLanguage(newLanguage);
    Alert.alert("Idioma alterado", `Agora está em: ${newLanguage}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerClassName="pb-32 px-6">
        {/* Header */}
        <View className="flex-row justify-between items-center mt-4 mb-4">
          <Text className="text-xl font-bold">Perfil</Text>
          <Image source={icons.bell} className="w-5 h-5" />
        </View>

        {/* Avatar + Nome */}
        <View className="items-center mt-6">
          <Image source={images.avatar} className="w-40 h-40 rounded-full" />
          <TouchableOpacity className="absolute bottom-6 right-8">
            <Image source={icons.edit} className="w-8 h-8" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold mt-4">Gui</Text>
        </View>

        {/* Secção principal */}
        <View className="mt-10 space-y-4">
          <TouchableOpacity
            className="flex-row items-center justify-between bg-gray-100 p-4 rounded-xl"
            onPress={() => router.push("/explore")}
          >
            <View className="flex-row items-center space-x-3">
              <Image source={icons.calendar} className="w-6 h-6" />
              <Text className="text-base font-medium">Histórico</Text>
            </View>
            <Image source={icons.rightArrow} className="w-4 h-4" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between bg-gray-100 p-4 rounded-xl">
            <View className="flex-row items-center space-x-3">
              <Image source={icons.settings} className="w-6 h-6" />
              <Text className="text-base font-medium">Preferências</Text>
            </View>
            <Image source={icons.rightArrow} className="w-4 h-4" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between bg-gray-100 p-4 rounded-xl">
            <View className="flex-row items-center space-x-3">
              <Image source={icons.user} className="w-6 h-6" />
              <Text className="text-base font-medium">Editar Conta</Text>
            </View>
            <Image source={icons.rightArrow} className="w-4 h-4" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between bg-gray-100 p-4 rounded-xl">
            <View className="flex-row items-center space-x-3">
              <Image source={icons.shield} className="w-6 h-6" />
              <Text className="text-base font-medium">Privacidade</Text>
            </View>
            <Image source={icons.rightArrow} className="w-4 h-4" />
          </TouchableOpacity>
        </View>

        {/* Idioma */}
        <View className="mt-10 border-t border-gray-300 pt-6">
          <Text className="text-xl font-bold mb-4">Idioma</Text>
          <TouchableOpacity
            className="flex-row items-center justify-between bg-gray-100 p-4 rounded-xl"
            onPress={() =>
              Alert.alert("Alterar Idioma", "Escolhe o idioma:", [
                { text: "Português", onPress: () => changeLanguage("Português") },
                { text: "English", onPress: () => changeLanguage("English") },
                { text: "Cancelar", style: "cancel" },
              ])
            }
          >
            <View className="flex-row items-center space-x-3">
              <Image source={icons.language} className="w-6 h-6" />
              <Text className="text-base font-medium">Idioma Atual: {language}</Text>
            </View>
            <Image source={icons.rightArrow} className="w-4 h-4" />
          </TouchableOpacity>
        </View>

        {/* Ajuda + Logout */}
        <View className="mt-10 border-t border-gray-300 pt-6 space-y-4">
          <TouchableOpacity
            className="flex-row items-center justify-between bg-gray-100 p-4 rounded-xl"
            onPress={() => router.push("/help/help")}
          >
            <View className="flex-row items-center space-x-3">
              <Image source={icons.info} className="w-6 h-6" />
              <Text className="text-base font-medium">Ajuda e Informações</Text>
            </View>
            <Image source={icons.rightArrow} className="w-4 h-4" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between bg-red-100 p-4 rounded-xl"
            onPress={handleLogout}
          >
            <View className="flex-row items-center space-x-3">
              <Image source={icons.logout} className="w-6 h-6" />
              <Text className="text-base font-medium text-red-600">Terminar Sessão</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
