import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { RadioButton } from 'react-native-paper';
import { supabase } from '../../lib/supabase'; 
import { useRouter } from 'expo-router';

const perguntas = [
  'Não conseguiu dormir em 30 minutos',
  'Acordou a meio da noite ou de manhã muito cedo',
  'Teve de se levantar para ir à casa de banho',
  'Não conseguiu respirar confortavelmente',
  'Tossiu ou ressonou alto',
  'Teve muito frio',
  'Teve muito calor',
  'Teve pesadelos',
  'Teve dores',
  'Tomou medicamentos prescritos (ou não) por médico para o ajudar a dormir',
  'Teve dificuldade em manter-se acordado enquanto conduzia, durante refeições ou em atividades sociais',
  'Teve dificuldade em manter o entusiasmo na realização das suas tarefas',
];

const opcoes = [
  { label: 'Não ocorreu no último mês ', value: 0 },
  { label: 'Menos que uma vez por semana ', value: 1 },
  { label: 'Uma a duas vezes por semana ', value: 2 },
  { label: 'Três ou mais vezes por semana ', value: 3 },
];

export default function QualiSono() {
  const [respostas, setRespostas] = useState<number[]>(Array(perguntas.length).fill(-1));
  const [qualidadeGeral, setQualidadeGeral] = useState<number | null>(null);
  const router = useRouter();

  const handleSelect = (index: number, value: number) => {
    const novas = [...respostas];
    novas[index] = value;
    setRespostas(novas);
  };

  const calcularPontuacao = async () => {
    if (respostas.includes(-1) || qualidadeGeral === null) {
      Alert.alert('Por favor, responda a todas as perguntas.');
      return;
    }

    const total = respostas.reduce((acc, curr) => acc + curr, 0) + qualidadeGeral;

    let interpretacao = '';
    if (total <= 5) interpretacao = 'Boa qualidade de sono';
    else if (total <= 10) interpretacao = 'Qualidade moderada de sono';
    else interpretacao = 'Má qualidade de sono';

    const user = await supabase.auth.getUser();
    const userId = user.data?.user?.id;

    if (!userId) {
      Alert.alert('Erro', 'Utilizador não autenticado.');
      return;
    }

    const { error } = await supabase.from('quest_pitt').insert({
      id: userId,
      data_resposta: new Date().toISOString(),
      respostas: [...respostas, qualidadeGeral],
      pontuacao: total,
      classificacao: interpretacao,
    });

    if (error) {
      Alert.alert('Erro ao guardar', error.message);
    } else {
      Alert.alert(
        'Resultado guardado com sucesso',
        `Pontuação total: ${total}\nClassificação: ${interpretacao}`,
        [
          {
            text: 'Voltar',
           onPress:() => router.replace('/(root)/(tabs)'),
          },
        ]
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
        Questionário de Qualidade do Sono de Pittsburgh
      </Text>

      {perguntas.map((pergunta, i) => (
        <View key={i} style={{ marginBottom: 20 }}>
          <Text style={{ marginBottom: 5 }}>{`${i + 1}. ${pergunta}`}</Text>
          <RadioButton.Group
            onValueChange={(value: string) => handleSelect(i, parseInt(value))}
            value={respostas[i]?.toString()}
          >
            {opcoes.map((opcao, j) => (
              <View key={j} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <RadioButton value={opcao.value.toString()} />
                <Text>{opcao.label}</Text>
              </View>
            ))}
          </RadioButton.Group>
        </View>
      ))}

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontWeight: 'bold' }}>13. Durante o último mês, como avaliaria a qualidade do seu sono no geral?</Text>
        <RadioButton.Group
          onValueChange={(value: string) => setQualidadeGeral(parseInt(value))}
          value={qualidadeGeral?.toString() || ''}
        >
          {[
            'Muito bom (0)',
            'Razoavelmente bom (1)',
            'Consideravelmente mau (2)',
            'Muito mau (3)',
          ].map((label, idx) => (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <RadioButton value={idx.toString()} />
              <Text>{label}</Text>
            </View>
          ))}
        </RadioButton.Group>
      </View>

      <Pressable
        onPress={calcularPontuacao}
        style={{
          backgroundColor: '#4CAF50',
          padding: 12,
          borderRadius: 8,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Calcular Resultado</Text>
      </Pressable>
    </ScrollView>
  );
}
