import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const ManualInputScreen = () => {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Selecione o tipo de dados a inserir:</Text>

      {/* Navegar para Níveis de Glicose */}
      <TouchableOpacity
        onPress={() => router.push('/manual-input/glicose-input')}
        style={{
          backgroundColor: '#007AFF',
          padding: 15,
          borderRadius: 10,
          marginBottom: 10,
          width: '80%',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Níveis de Glicose</Text>
      </TouchableOpacity>

      {/* Navegar para Dados de Sono */}
      <TouchableOpacity
        onPress={() => router.push('/manual-input/sono-input')}
        style={{
          backgroundColor: '#4CAF50',
          padding: 15,
          borderRadius: 10,
          width: '80%',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Dados do Sono</Text>
      </TouchableOpacity>
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
    </View>
  );
};

export default ManualInputScreen;
