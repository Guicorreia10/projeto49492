import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'; // Importando KeyboardAwareScrollView
import icons from '@/constants/icons';

const Help = () => {
  const router = useRouter();

  return (
    <SafeAreaView className="bg-primary-100 h-full">
      <KeyboardAwareScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        {/* Cabeçalho */}
        <View className="mt-8 flex items-center">
          <Image source={icons.info} className="size-12" />
          <Text className="text-4xl font-rubik-bold text-primary-900 text-center mt-3">
            Ajuda e Informações
          </Text>
        </View>

        {/* Botão Voltar */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            position: 'absolute',
            top: 20,
            left: 10,
            padding: 10,
            backgroundColor: '#007AFF',
            borderRadius: 5,
          }}
        >
          <Text style={{ fontSize: 16, color: '#fff', fontWeight: 'bold' }}>⬅️ Voltar</Text>
        </TouchableOpacity>

        {/* Introdução */}
        <Text className="text-lg text-gray-700 text-center mt-5">
          Explore os tópicos abaixo para obter mais detalhes sobre como usar a nossa aplicação.
        </Text>

        {/* Botões com ícones e navegação */}
        <View className="flex flex-col mt-10 gap-5">
          <TouchableOpacity
            className="bg-primary-500 p-5 rounded-lg flex-row items-center justify-between shadow-md"
            onPress={() => router.push('/help/sleep-info')}
          >
            <Text className="text-xl text-black font-rubik-bold">🛏️ Níveis de Sono</Text>
            <Image source={icons.rightArrow} className="size-6" />
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-secondary-500 p-5 rounded-lg flex-row items-center justify-between shadow-md"
            onPress={() => router.push('/help/glicose-info')}
          >
            <Text className="text-xl text-black font-rubik-bold">🩸 Níveis de Glicose</Text>
            <Image source={icons.rightArrow} className="size-6" />
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-tertiary-500 p-5 rounded-lg flex-row items-center justify-between shadow-md"
            onPress={() => router.push('/help/app-info')}
          >
            <Text className="text-xl text-black font-rubik-bold">📱 Funcionalidades GlicoSleep</Text>
            <Image source={icons.rightArrow} className="size-6" />
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-indigo-500 p-5 rounded-lg flex-row items-center justify-between shadow-md"
            onPress={() => router.push('/help/chatbot')}
          >
            <Text className="text-xl text-white font-rubik-bold">🤖 Falar com o Chatbot</Text>
            <Image source={icons.rightArrow} className="size-6" />
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default Help;
