import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { supabase } from '../../../../lib/supabase';
import { guardarDadoSmartwatch } from '../../../utils/guardarSmartwatch';
import { useRouter } from 'expo-router';

const SonoInputScreen = () => {
  const [sleepHours, setSleepHours] = useState('');
  const [sleepQuality, setSleepQuality] = useState('');
  const [difficultySleeping, setDifficultySleeping] = useState('');
  const [wakeFeeling, setWakeFeeling] = useState('');
  const [deviceUsage, setDeviceUsage] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserId = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error('Erro ao recuperar user_id:', error);
      } else if (data?.user) {
        setUserId(data.user.id);
      }
    };

    fetchUserId();
  }, []);

  const handleSave = async () => {
    if (!sleepHours || !sleepQuality || !difficultySleeping || !wakeFeeling || !deviceUsage) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    if (!userId) {
      Alert.alert('Erro', 'Utilizador não autenticado. Faça login novamente.');
      return;
    }

    try {
      // 1. Guardar no Supabase - tabela dados_usuario
      const { error } = await supabase.from('dados_usuario').insert([
        {
          user_id: userId,
          sono: Number(sleepHours),
          qualidade_sono: Number(sleepQuality),
          dificuldade_ao_dormir: difficultySleeping,
          sensacao_ao_acordar: wakeFeeling,
          uso_dispositivos: deviceUsage,
          glicose: null,
          created_at: new Date(),
        },
      ]);

      if (error) {
        console.error('Erro ao guardar em dados_usuario:', error);
        Alert.alert('Erro', 'Erro ao guardar os dados.');
        return;
      }

      // 2. Também guardar nas leituras de smartwatch
      await guardarDadoSmartwatch('sono', Number(sleepHours), 'horas');

      Alert.alert('Sucesso', 'Dados de sono guardados com sucesso!');
      setSleepHours('');
      setSleepQuality('');
      setDifficultySleeping('');
      setWakeFeeling('');
      setDeviceUsage('');
    } catch (e) {
      console.error('Erro inesperado:', e);
      Alert.alert('Erro', 'Erro inesperado ao guardar os dados.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Responder Perguntas Sobre o Sono</Text>

      {/* Voltar */}
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

      {/* Horas dormidas */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Quantas horas dormiu?</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 8"
          keyboardType="numeric"
          value={sleepHours}
          onChangeText={setSleepHours}
        />
      </View>

      {/* Qualidade */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Avalie a qualidade do seu sono de 0 a 10:</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 8"
          keyboardType="numeric"
          value={sleepQuality}
          onChangeText={setSleepQuality}
        />
      </View>

      {/* Dificuldade */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Teve dificuldade em dormir? (Sim ou Não)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Sim"
          value={difficultySleeping}
          onChangeText={setDifficultySleeping}
        />
      </View>

      {/* Sensação ao acordar */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Como se sentiu ao acordar?</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Descansado"
          value={wakeFeeling}
          onChangeText={setWakeFeeling}
        />
      </View>

      {/* Uso de dispositivos */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Usou dispositivos antes de dormir? (Sim ou Não)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Sim"
          value={deviceUsage}
          onChangeText={setDeviceUsage}
        />
      </View>

      {/* Botão guardar */}
      <TouchableOpacity onPress={handleSave} style={styles.button}>
        <Text style={styles.buttonText}>Guardar Dados</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SonoInputScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
    textAlign: 'center',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#555',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    width: '100%',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
