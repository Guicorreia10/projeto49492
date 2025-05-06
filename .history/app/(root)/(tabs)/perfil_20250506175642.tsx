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
      Alert.alert("Sessão terminada", "Até à próxima!");
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

      if (data?.nome_completo) {
        setUsername(data.nome_completo);
      }

      setLoading(false);
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F9FBFC]">
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
        {/* Cabeçalho */}
        <View className="px-6 pt-6">
          <Text className="text-[28px] font-bold text-[#1E2A38] mb-1">
            Olá, {username?.split(" ")[0] || "Utilizador"} 👋
          </Text>
          <Text className="text-base text-gray-500">Bem-vindo ao teu perfil</Text>
        </View>

        {/* Avatar */}
        <View className="items-center mt-8 mb-6">
          <Image
            source={images.avatar}
            className="w-36 h-36 rounded-full"
            style={{ borderWidth: 4, borderColor: "#007AFF" }}
          />
          <Text className="text-xl font-semibold mt-4 text-[#1E2A38]">{username}</Text>
        </View>

        {/* Secção principal */}
        <View className="space-y-4 px-6">
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

          <Section title="Ajuda">
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
    <Text className="text-xl font-bold text-[#1E2A38] mb-2">{title}</Text>
    <View className="space-y-2">{children}</View>
  </View>
);

const MenuItem = ({
  icon,
  label,
  onPress,
  textColor = "text-[#1E2A38]",
  bgColor = "bg-[#F0F4F8]",
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
    className={`flex-row items-center justify-between ${bgColor} p-4 rounded-2xl shadow-sm`}
  >
    <View className="flex-row items-center space-x-3">
      <Image source={icon} className="w-6 h-6" />
      <Text className={`text-base font-medium ${textColor}`}>{label}</Text>
    </View>
    {!noArrow && <Image source={icons.rightArrow} className="w-4 h-4" />}
  </TouchableOpacity>
);
