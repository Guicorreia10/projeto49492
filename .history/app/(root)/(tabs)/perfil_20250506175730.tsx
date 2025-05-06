import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import icons from "@/constants/icons";
import images from "@/constants/images";

export default function Profile() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("Português");

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.replace("/sign-in");
    } catch {
      Alert.alert("Erro", "Não foi possível terminar sessão.");
    }
  };

  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    Alert.alert("Idioma alterado", `Agora está em: ${lang}`);
  };

  useEffect(() => {
    const fetchUser = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return;

      const { data } = await supabase
        .from("dados_usuario")
        .select("nome_completo")
        .eq("user_id", auth.user.id)
        .limit(1)
        .single();

      if (data?.nome_completo) setUsername(data.nome_completo);
      setLoading(false);
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]">
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
        {/* Cabeçalho */}
        <View className="px-6 pt-8">
          <Text className="text-[26px] font-semibold text-neutral-900 mb-1 tracking-tight">
            Bem-vindo, {username?.split(" ")[0] || "Utilizador"} 👋
          </Text>
          <Text className="text-sm text-neutral-500">Gerir conta e preferências</Text>
        </View>

        {/* Avatar */}
        <View className="items-center mt-8 mb-4">
          <View className="rounded-full border-[3px] border-[#1E3A8A] p-1 shadow-md">
            <Image source={images.avatar} className="w-32 h-32 rounded-full" />
          </View>
          <Text className="text-lg font-medium mt-3 text-neutral-800">{username}</Text>
        </View>

        {/* Secções */}
        <View className="space-y-6 px-6 mt-4">
          <Section title="Conta">
            <MenuItem icon={icons.calendar} label="Histórico" onPress={() => router.push("/explore")} />
            <MenuItem icon={icons.altconta} label="Editar Conta" onPress={() => router.push("/(root)/editarconta")} />
            <MenuItem icon={icons.shield} label="Privacidade" onPress={() => router.push("/(root)/politica")} />
          </Section>

          <Section title="Preferências">
            <MenuItem
              icon={icons.language}
              label={`Idioma: ${language}`}
              onPress={() =>
                Alert.alert("Idioma", "Escolhe o idioma:", [
                  { text: "Português", onPress: () => changeLanguage("Português") },
                  { text: "English", onPress: () => changeLanguage("English") },
                  { text: "Cancelar", style: "cancel" },
                ])
              }
            />
          </Section>

          <Section title="Ajuda & Sessão">
            <MenuItem icon={icons.info} label="Ajuda e Informações" onPress={() => router.push("/help/help")} />
            <MenuItem
              icon={icons.logout}
              label="Terminar Sessão"
              onPress={handleLogout}
              textColor="text-red-600"
              bgColor="bg-red-100"
              noArrow
            />
          </Section>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View>
    <Text className="text-base font-semibold text-neutral-600 mb-3">{title}</Text>
    <View className="space-y-3">{children}</View>
  </View>
);

const MenuItem = ({
  icon,
  label,
  onPress,
  textColor = "text-neutral-800",
  bgColor = "bg-white",
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
    className={`flex-row items-center justify-between ${bgColor} px-4 py-4 rounded-2xl shadow-sm`}
  >
    <View className="flex-row items-center space-x-4">
      <Image source={icon} className="w-6 h-6 opacity-90" />
      <Text className={`text-[15px] font-medium ${textColor}`}>{label}</Text>
    </View>
    {!noArrow && <Image source={icons.rightArrow} className="w-4 h-4 opacity-40" />}
  </TouchableOpacity>
);
