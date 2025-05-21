import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../lib/supabase';

const HomeIndex = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [cronotipo, setCronotipo] = useState<{ pontuacao: number; tipo: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const fetchUserAndCronotipo = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getUser();
      if (data?.user?.id) {
        const id = data.user.id;
        setUserId(id);

        const { data: resultado, error } = await supabase
          .from('cronotipos')
          .select('pontuacao, tipo')
          .eq('user_id', id)
          .order('data', { ascending: false })
          .limit(1)
          .single();

        if (resultado && !error) {
          setCronotipo({ pontuacao: resultado.pontuacao, tipo: resultado.tipo });
        }
      }
      setLoading(false);
    };

    fetchUserAndCronotipo();
  }, []);

  const irParaQuestionario = () => {
    router.push('../cronotipo');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>🏠 Bem-vindo à Página Inicial</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#4f46e5" />
      ) : (
        <>
          {cronotipo ? (
            <View style={styles.resultadoBox}>
              <Text style={styles.resultadoTitulo}>🧠 Cronotipo Avaliado</Text>
              <Text style={styles.resultadoTexto}>
                Pontuação: <Text style={styles.resultadoValor}>{cronotipo.pontuacao}</Text>
              </Text>
              <Text style={styles.resultadoTexto}>
                Tipo: <Text style={styles.resultadoValor}>{cronotipo.tipo}</Text>
              </Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.botao} onPress={irParaQuestionario}>
              <Text style={styles.botaoTexto}>📝 Fazer Questionário de Cronotipo</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 20,
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e3a8a',
    marginBottom: 30,
    textAlign: 'center',
  },
  botao: {
    backgroundColor: '#4f46e5',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  botaoTexto: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultadoBox: {
    backgroundColor: '#eef2ff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  resultadoTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3730a3',
    marginBottom: 10,
  },
  resultadoTexto: {
    fontSize: 16,
    color: '#1e3a8a',
    marginBottom: 4,
  },
  resultadoValor: {
    fontWeight: 'bold',
  },
});

export default HomeIndex;
