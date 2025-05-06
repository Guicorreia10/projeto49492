import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import icons from "@/constants/icons";
import { useRouter } from "expo-router";
import { Image } from "react-native";

const Privacidade = () => {
  const router = useRouter();

  const exportarDados = () => {
    Alert.alert("Exportar Dados", "Iremos enviar os teus dados por email em breve.");
    // Aqui poderias acionar uma função real com Supabase Functions, se necessário
  };

  const eliminarConta = async () => {
    Alert.alert("Confirmação", "Tens a certeza que queres eliminar a tua conta? Esta ação é irreversível.", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase.auth.signOut();
          // NOTA: para realmente apagar a conta do utilizador, precisas de usar RLS ou Supabase Admin API no backend
          router.replace("/sign-in");
          Alert.alert("Conta eliminada", "A tua conta foi eliminada (simulação).");
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerClassName="px-6 pb-20">
        <Text className="text-2xl font-bold mt-6 mb-4">Privacidade</Text>

        <Text className="text-gray-600 mb-6">
          Gere os teus dados pessoais, exporta informações ou elimina a tua conta.
        </Text>

        <PrivacidadeItem
          icon={icons.download}
          label="Exportar os Meus Dados"
          onPress={exportarDados}
        />

        <PrivacidadeItem
          icon={icons.shield}
          label="Ver Política de Privacidade"
          onPress={() => Linking.openURL("https://glicosleep-politica.netlify.app/")
          }
        />

        <PrivacidadeItem
          icon={icons.trash}
          label="Eliminar Conta"
          textColor="text-red-600"
          bgColor="bg-red-100"
          onPress={eliminarConta}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const PrivacidadeItem = ({
  icon,
  label,
  onPress,
  textColor = "text-gray-800",
  bgColor = "bg-gray-100",
}: {
  icon: any;
  label: string;
  onPress: () => void;
  textColor?: string;
  bgColor?: string;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className={`flex-row items-center justify-between ${bgColor} p-4 rounded-xl mb-4`}
  >
    <View className="flex-row items-center space-x-3">
      <Image source={icon} className="w-6 h-6" />
      <Text className={`text-base font-medium ${textColor}`}>{label}</Text>
    </View>
    <Image source={icons.rightArrow} className="w-4 h-4" />
  </TouchableOpacity>
);

export default Privacidade;
