import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { supabase } from '../lib/supabase';

const EvaluateSleepScreen = () => {
  const [sleepData, setSleepData] = useState<Array<{
    sono: number;
    qualidade_sono: number;
    dificuldade_ao_dormir: string;
    uso_dispositivos: string;
  }> | null>(null);

  useEffect(() => {
    const fetchSleepData = async () => {
      try {
        const { data, error } = await supabase
          .from('dados_usuario')
          .select('sono, qualidade_sono, dificuldade_ao_dormir, uso_dispositivos')
          .order('created_at', { ascending: false })
          .limit(1); // Busca apenas os dados mais recentes

        if (error) {
          console.error('Erro ao buscar dados do sono:', error);
          Alert.alert('Erro', 'Não foi possível carregar os dados do sono.');
        } else if (data.length > 0) {
          setSleepData(data); // Armazena os dados de sono
        } else {
          Alert.alert('Aviso', 'Nenhum dado de sono encontrado.');
        }
      } catch (err) {
        console.error('Erro inesperado:', err);
        Alert.alert('Erro', 'Ocorreu um erro ao carregar os dados.');
      }
    };

    fetchSleepData();
  }, []);

  const evaluateSleep = () => {
    if (!sleepData || sleepData.length === 0) {
      Alert.alert('Erro', 'Dados insuficientes para avaliar o sono.');
      return;
    }

    const { sono, qualidade_sono, dificuldade_ao_dormir, uso_dispositivos } = sleepData[0];

    // Fórmula ponderada
    const hoursScore = Math.min(sono / 8 * 10, 10) * 0.4; // 8 horas é o ideal
    const qualityScore = qualidade_sono * 0.3;
    const difficultyScore = dificuldade_ao_dormir === 'Sim' ? 0 : 10 * 0.2; // Sim = impacto negativo
    const deviceScore = uso_dispositivos === 'Sim' ? 0 : 10 * 0.1; // Sim = impacto negativo

    const finalScore = (hoursScore + qualityScore + difficultyScore + deviceScore).toFixed(1);

    Alert.alert('Avaliação do Sono', `Seu sono foi avaliado com: ${finalScore} / 10.`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Avaliação do Sono</Text>

      {sleepData && sleepData.length > 0 ? (
        <View style={styles.dataContainer}>
          <Text style={styles.label}>Horas Dormidas: {sleepData[0].sono}</Text>
          <Text style={styles.label}>Qualidade do Sono: {sleepData[0].qualidade_sono}</Text>
          <Text style={styles.label}>
            Dificuldade para Dormir: {sleepData[0].dificuldade_ao_dormir}
          </Text>
          <Text style={styles.label}>
            Uso de Dispositivos: {sleepData[0].uso_dispositivos}
          </Text>
        </View>
      ) : (
        <Text style={styles.label}>Carregando dados...</Text>
      )}

      <TouchableOpacity onPress={evaluateSleep} style={styles.button}>
        <Text style={styles.buttonText}>Avaliar Sono</Text>
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
  dataContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
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

export default EvaluateSleepScreen;
