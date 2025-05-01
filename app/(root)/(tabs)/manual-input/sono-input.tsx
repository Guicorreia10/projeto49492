import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { supabase } from '../../../../lib/supabase';

const SonoInputScreen = () => {
  const [sleepHours, setSleepHours] = useState('');
  const [sleepQuality, setSleepQuality] = useState('');
  const [difficultySleeping, setDifficultySleeping] = useState('');
  const [wakeFeeling, setWakeFeeling] = useState('');
  const [deviceUsage, setDeviceUsage] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error('Erro ao recuperar user_id:', error);
      } else if (data?.user) {
        setUserId(data.user.id); // ID do usuário logado
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
      // Inserir dados no Supabase
      const { data, error } = await supabase.from('dados_usuario').insert([
        {
          user_id: userId, 
          sono: Number(sleepHours), // Horas dormidas
          qualidade_sono: Number(sleepQuality), // Qualidade do sono (0-10)
          dificuldade_ao_dormir: difficultySleeping, 
          sensacao_ao_acordar: wakeFeeling, // Resposta sobre sensação ao acordar
          uso_dispositivos: deviceUsage, // Resposta sobre uso de dispositivos
          glicose: null, // Placeholder para glicose, se necessário
          created_at: new Date(), // Timestamp opcional
        },
      ]);

      if (error) {
        console.error('Erro ao guardar no Supabase:', error);
        Alert.alert('Erro', 'Erro ao guardar os dados.');
      } else {
        Alert.alert('Sucesso', 'Dados de sono guardados com sucesso!');
        setSleepHours('');
        setSleepQuality('');
        setDifficultySleeping('');
        setWakeFeeling('');
        setDeviceUsage('');
      }
    } catch (e) {
      console.error('Erro inesperado:', e);
      Alert.alert('Erro', 'Erro inesperado ao guardar os dados.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Responder Perguntas Sobre o Sono</Text>

      {/* Pergunta 1: Quantas horas dormidas */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Quantas horas dormiu?</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 8"
          keyboardType="numeric"
          value={sleepHours}
          onChangeText={(text) => setSleepHours(text)}
        />
      </View>

      {/* Pergunta 2: Qualidade do sono (0-10) */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Avalie a qualidade do seu sono de 0 a 10:</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 8"
          keyboardType="numeric"
          value={sleepQuality}
          onChangeText={(text) => setSleepQuality(text)}
        />
      </View>

      {/* Pergunta 3: Dificuldade ao dormir */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Teve dificuldade em dormir? (Sim ou Não)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Sim"
          value={difficultySleeping}
          onChangeText={(text) => setDifficultySleeping(text)}
        />
      </View>

      {/* Pergunta 4: Sensação ao acordar */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Como se sentiu ao acordar? (Ex: Descansado)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Descansado"
          value={wakeFeeling}
          onChangeText={(text) => setWakeFeeling(text)}
        />
      </View>

      {/* Pergunta 5: Uso de dispositivos antes de dormir */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Usou dispositivos antes de dormir? (Sim ou Não)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Sim"
          value={deviceUsage}
          onChangeText={(text) => setDeviceUsage(text)}
        />
      </View>

      <TouchableOpacity
        onPress={handleSave}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Guardar Dados</Text>
      </TouchableOpacity>
    </View>
  );
};

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

export default SonoInputScreen;
