import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../../../../lib/supabase';
import { useRouter } from 'expo-router';

const GlicoseInputScreen = () => {
  const [glucoseLevel, setGlucoseLevel] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserId = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error('Erro ao recuperar user_id:', error);
      } else if (data?.user) {
        setUserId(data.user.id); // Armazena o ID do usuário logado
      }
    };

    fetchUserId();
  }, []);

  const handleSave = async () => {
    if (!glucoseLevel) {
      Alert.alert('Erro', 'Por favor, insira um nível de glicose.');
      return;
    }

    if (!userId) {
      Alert.alert('Erro', 'Utilizador não conectado. Faça login novamente.');
      return;
    }

    try {
      // Registar os dados no Supabase
      const { data, error } = await supabase.from('dados_utilizador').insert([
        {
          user_id: userId, 
          glicose: Number(glucoseLevel), // Nível de glicose inserido pelo utilizador
          sono: null, // Campo opcional, pode ser null caso não seja usado
          created_at: new Date().toISOString(), // Regista a data e hora no formato ISO
        },
      ]);

      if (error) {
        console.error('Erro ao guardar no Supabase:', error);
        Alert.alert('Erro', 'Erro ao guardar os dados.');
      } else {
        Alert.alert('Concluído', 'Dados de glicose guardados com sucesso!');
        setGlucoseLevel(''); // Limpa o campo após salvar
      }
    } catch (e) {
      console.error('Erro inesperado:', e);
      Alert.alert('Erro', 'Erro inesperado ao guardar os dados.');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Inserir Níveis de Glicose</Text>
      <TextInput
        style={{
          backgroundColor: '#fff',
          borderRadius: 10,
          padding: 10,
          borderWidth: 1,
          borderColor: '#ccc',
          width: '80%',
          marginBottom: 20,
        }}
        placeholder="Insira o nível de glicose (mg/dL)"
        keyboardType="numeric"
        value={glucoseLevel}
        onChangeText={(text) => setGlucoseLevel(text)}
      />
      <TouchableOpacity
        onPress={handleSave}
        style={{
          backgroundColor: '#007AFF',
          padding: 15,
          borderRadius: 10,
          width: '80%',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Guardar Dados</Text>
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

export default GlicoseInputScreen;
