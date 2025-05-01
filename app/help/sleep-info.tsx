import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const SleepInfoScreen = () => {
  const router = useRouter();
  return (
    <SafeAreaView className="bg-primary-100 h-full">
      <ScrollView contentContainerClassName="px-6 pb-20">
        {/* Cabeçalho */}
        <View className="mt-8 flex items-center">
          <Text className="text-5xl font-bold text-primary-900 text-center">
            🛏️ Níveis de Sono
          </Text>
          <Text className="text-lg text-gray-600 text-center mt-2">
            Explore os ciclos do sono e descubra a sua importância para o bem-estar.
          </Text>
        </View>

     <TouchableOpacity
    onPress={() => router.back()}
    style={{
      position: 'absolute',  // Adiciona posição absoluta
      top: 20,               // Distância do topo
      left: 10,              // Distância da esquerda
      padding: 10,
      backgroundColor: '#007AFF',
      borderRadius: 5,
    }}
  >
  <Text style={{ fontSize: 16, color: '#fff', fontWeight: 'bold' }}>⬅️ Voltar</Text>
</TouchableOpacity>

        {/* Secção: O que é o sono */}
        <View className="mt-10 p-5 bg-white rounded-lg shadow-md">
          <Text className="text-2xl font-semibold text-primary-800">✨ O que é o sono?</Text>
          <Text className="text-md text-gray-700 mt-2">
            O sono é um estado natural de descanso necessário para a recuperação física e mental. Ele ocorre em ciclos e é essencial para o funcionamento do corpo, a consolidação da memória e a saúde emocional.
          </Text>
        </View>

        {/* Secção: Fases do sono */}
        <View className="mt-10 p-5 bg-white rounded-lg shadow-md">
          <Text className="text-2xl font-semibold text-primary-800">🌙 Fases do Sono</Text>
          <Text className="text-md text-gray-700 mt-2">
            Durante a noite, o sono passa por várias fases. Cada uma tem funções específicas:
          </Text>
          <View className="mt-4">
            <View className="mb-4">
              <Text className="text-lg font-semibold text-primary-700">1. Sono Leve</Text>
              <Text className="text-md text-gray-600">
                Este é o ciclo inicial do descanso. O corpo relaxa e os batimentos cardíacos diminuem.
              </Text>
            </View>
            <View className="mb-4">
              <Text className="text-lg font-semibold text-primary-700">2. Sono Profundo</Text>
              <Text className="text-md text-gray-600">
                Nesta fase, o corpo repara células e fortalece o sistema imunológico.
              </Text>
            </View>
            <View>
              <Text className="text-lg font-semibold text-primary-700">3. Sono REM</Text>
              <Text className="text-md text-gray-600">
                Caracterizado por sonhos intensos, é crucial para a aprendizagem e para a memória.
              </Text>
            </View>
          </View>
        </View>

        {/* Secção: Dicas para Melhorar o Sono */}
        <View className="mt-10 p-5 bg-white rounded-lg shadow-md">
          <Text className="text-2xl font-semibold text-primary-800">💡 Dicas para Melhorar o Sono</Text>
          <Text className="text-md text-gray-700 mt-2">
            Um bom descanso é crucial para a saúde. Aqui estão algumas práticas recomendadas:
          </Text>
          <View className="mt-4">
            <Text className="text-md text-gray-600">✔️ Crie um ambiente confortável e tranquilo no quarto.</Text>
            <Text className="text-md text-gray-600">✔️ Evite cafeína e dispositivos eletrónicos antes de dormir.</Text>
            <Text className="text-md text-gray-600">✔️ Estabeleça uma rotina consistente de sono.</Text>
            <Text className="text-md text-gray-600">✔️ Pratique exercícios físicos regularmente.</Text>
          </View>
        </View>

        {/* Secção: Importância do Sono */}
        <View className="mt-10 p-5 bg-white rounded-lg shadow-md">
          <Text className="text-2xl font-semibold text-primary-800">🌟 Importância do Sono</Text>
          <Text className="text-md text-gray-700 mt-2">
            O sono desempenha um papel vital na saúde geral. Este regula processos importantes como o equilíbrio hormonal, recuperação física e saúde mental. A falta de sono pode causar problemas graves, como stresse, ansiedade e fraqueza imunológica.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SleepInfoScreen;
