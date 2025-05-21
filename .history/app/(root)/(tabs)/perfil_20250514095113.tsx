// Ecrã de perfil com atualização da foto imediatamente após upload + simulação BLE

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
import * as ImagePicker from "expo-image-picker";
import mime from "react-native-mime-types";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import icons from "@/constants/icons";
import images from "@/constants/images";
import { decode } from "base64-arraybuffer";

export default function Profile() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("Português");
  const [bleStatus, setBleStatus] = useState("BLE desativado");

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

  const handleBLEScan = () => {
    setBleStatus("A simular conexão com um smartwatch...");
    setTimeout(() => {
      const fakeDevice = { id: "1234", name: "Simulado Watch" };
      setBleStatus(`(Simulado) Conectado a ${fakeDevice.name}`);
    }, 2000);
  };

  useEffect(() => {
    const fetchUser = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return;

      const uid = auth.user.id;
      setUserId(uid);

      const { data } = await supabase
        .from("dados_usuario")
        .select("nome_completo, foto_url")
        .eq("user_id", uid)
        .limit(1)
        .single();

      if (data?.nome_completo) setUsername(data.nome_completo);
      if (data?.foto_url) setAvatarUrl(data.foto_url);

      const channel = supabase
        .channel("profile-updates")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "dados_usuario",
            filter: `user_id=eq.${uid}`,
          },
          (payload) => {
            if (payload.new?.foto_url) {
              setAvatarUrl(payload.new.foto_url);
            }
          }
        )
        .subscribe();

      setLoading(false);

      return () => {
        supabase.removeChannel(channel);
      };
    };

    fetchUser();
  }, []);

  const pickAndUploadImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const image = result.assets[0];
      const fileExt = image.uri.split(".").pop();
      const fileName = `${userId}.${fileExt}`;
      const mimeType = mime.lookup(fileExt || "jpg") || "image/jpeg";
      const path = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, decode(image.base64 || ""), {
          contentType: mimeType,
          upsert: true,
        });

      if (uploadError) {
        Alert.alert("Erro", `Falha ao carregar imagem. ${uploadError.message}`);
        return;
      }

      const { data: publicUrl } = supabase.storage.from("avatars").getPublicUrl(path);

      const { error: updateError } = await supabase
        .from("dados_usuario")
        .update({ foto_url: publicUrl.publicUrl })
        .eq("user_id", userId);

      if (!updateError) {
        setAvatarUrl(`${publicUrl.publicUrl}?t=${Date.now()}`);
      }
    }
  };

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
        <View className="px-6 pt-8">
          <Text className="text-[26px] font-semibold text-neutral-900 mb-1 tracking-tight">
            Bem-vindo, {username?.split(" ")[0] || "Utilizador"} 👋
          </Text>
          <Text className="text-sm text-neutral-500">Gerir conta e preferências</Text>
        </View>

        <View className="items-center mt-8 mb-4">
          <View className="relative">
            <Image
              source={{
                uri: avatarUrl ? `${avatarUrl}` : Image.resolveAssetSource(images.avatar).uri,
              }}
              className="w-32 h-32 rounded-full border-[3px] border-[#1E3A8A]"
            />
            <TouchableOpacity
              onPress={pickAndUploadImage}
              className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow"
            >
              <Image source={icons.edit} className="w-5 h-5 tint-[#1E3A8A]" />
            </TouchableOpacity>
          </View>
          <Text className="text-lg font-medium mt-3 text-neutral-800">{username}</Text>
        </View>

        <View className="space-y-6 px-6 mt-4">
          <Section title="Conta">
            <MenuItem icon={icons.calendar} label="Histórico" onPress={() => router.push("/explore")} />
            <MenuItem icon={icons.altconta} label="Editar Conta" onPress={() => router.push("/(root)/editarconta")} />
            <MenuItem icon={icons.shield} label="Privacidade" onPress={() => router.push("/(root)/politica")} />
              <MenuItem
              icon={icons.bed}
              label="Conexões Bluetooth"
              onPress={() => router.push("../../../BleConnectionsScreen")}
/>
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
            <MenuItem
              icon={icons.bed}
              label={bleStatus}
              onPress={handleBLEScan}
            />
          </Section>

          <Section title="Ajuda & Sessão">
            <MenuItem icon={icons.info} label="Ajuda e Informações" onPress={() => router.push("/help")} />
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
