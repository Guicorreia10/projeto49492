import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import icons from "@/constants/icons";
import images from "../../../constants/images";

const Profile = () => {
  const [language, setLanguage] = useState("Português");
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.replace("/sign-in");
      Alert.alert("Sucesso", "Sessão terminada com sucesso!");
    } catch (error) {
      Alert.alert("Erro", "Erro ao terminar sessão.");
    }
  };

  const changeLanguage = (newLanguage: string) => {
    setLanguage(newLanguage);
    Alert.alert("Idioma alterado", `Agora está em: ${newLanguage}`);
  };

  const fetchUserData = async (uid?: string) => {
    try {
      const currentUserId = uid ?? userId;
      if (!currentUserId) return;

      const { data: dados, error: dadosErro } = await supabase
        .from("dados_usuario")
        .select("nome_completo")
        .eq("user_id", currentUserId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (dadosErro) {
        console.error("Erro ao buscar dados_usuario:", dadosErro);
      }

      if (dados && dados.length > 0 && dados[0].nome_completo) {
        setUsername(dados[0].nome_completo);
      }
    } catch (e) {
      console.error("Erro no fetchUserData:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) return;

      setUserId(authData.user.id);
      await fetchUserData(authData.user.id);

      // Subscrição a updates em tempo real
      const channel = supabase
        .channel("user-updates")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "dados_usuario",
            filter: `user_id=eq.${authData.user.id}`,
          },
          (payload) => {
            const novoNome = payload.new?.nome_completo;
            if (novoNome) {
              setUsername(novoNome);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    init();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerClassName="pb-28 px-6">
        {/* Header */}
        <View className="flex-row justify-between items-center mt-6 mb-4">
          <Text className="text-2xl font-bold text-gray-900">
            Olá, {username?.split(" ")[0] || "Utilizador"} 👋
          </Text>
          <Image source={icons.bell} className="w-5 h-5" />
        </View>

        {/* Avatar + Nome */}
        <View className="items-center mt-6 mb-10">
          <Image source={images.avatar} className="w-36 h-36 rounded-full" />
          <Text className="text-xl font-semibold mt-4 text-gray-900">{username}</Text>
        </View>

        {/* Opções */}
        <View className="space-y-4">
          <MenuItem icon={icons.calendar} label="Histórico" onPress={() => router.push("/explore")} />
          <MenuItem icon={icons.altconta} label="Editar Conta" onPress={() => router.push("/(root)/editarconta")} />
          <MenuItem icon={icons.shield} label="Privacidade" onPress={() => router.push("/(root)/politica")} />
        </View>

        {/* Idioma */}
        <View className="mt-10 border-t border-gray-200 pt-6">
          <Text className="text-xl font-bold mb-4 text-gray-800">Idioma</Text>
          <MenuItem
            icon={icons.language}
            label={`Idioma Atual: ${language}`}
            onPress={() =>
              Alert.alert("Alterar Idioma", "Escolhe o idioma:", [
                { text: "Português", onPress: () => changeLanguage("Português") },
                { text: "English", onPress: () => changeLanguage("English") },
                { text: "Cancelar", style: "cancel" },
              ])
            }
          />
        </View>

        {/* Ajuda e Terminar Sessão */}
        <View className="mt-10 border-t border-gray-200 pt-6 space-y-4">
          <MenuItem icon={icons.info} label="Ajuda e Informações" onPress={() => router.push("/help/help")} />
          <MenuItem
            icon={icons.logout}
            label="Terminar Sessão"
            textColor="text-red-600"
            bgColor="bg-red-100"
            onPress={handleLogout}
            noArrow
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const MenuItem = ({
  icon,
  label,
  onPress,
  textColor = "text-gray-800",
  bgColor = "bg-gray-100",
  noArrow = false,
}: {
  icon: any;
  label: string;
  onPress: () => void;
  textColor?: string;
  bgColor?: string;
  noArrow?: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className={`flex-row items-center justify-between ${bgColor} p-4 rounded-xl`}
  >
    <View className="flex-row items-center space-x-3">
      <Image source={icon} className="w-6 h-6" />
      <Text className={`text-base font-medium ${textColor}`}>{label}</Text>
    </View>
    {!noArrow && <Image source={icons.rightArrow} className="w-4 h-4" />}
  </TouchableOpacity>
);

export default Profile;
