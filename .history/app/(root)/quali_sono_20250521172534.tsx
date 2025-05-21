// Ecrã de questionário PSQI-PT com layout em tabela e envio ao Supabase
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';

const opcoes = ['Nunca', 'Menos de 1x/semana', '1 ou 2x/semana', '3x/semana ou mais'];

export default function QualidadeSonoScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const [respostas, setRespostas] = useState<{ [key: string]: number }>({});
  const [outrosTexto, setOutrosTexto] = useState('');
  const [outrosFreq, setOutrosFreq] = useState<number | null>(null);
  const [companheiro, setCompanheiro] = useState<number | null>(null);
  const [companheiroSintomas, setCompanheiroSintomas] = useState<{ [key: string]: number }>({});
  const [outrosSintomasTexto, setOutrosSintomasTexto] = useState('');
  const [duracaoSono, setDuracaoSono] = useState('');
  const [demoraAdormecer, setDemoraAdormecer] = useState('');
  const [qualidadeSono, setQualidadeSono] = useState<number | null>(null);
  const [resultadoFinal, setResultadoFinal] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data?.user?.id || null);
    })();
  }, []);

  const handleSelecionar = (pergunta: string, valor: number) => {
    setRespostas(prev => ({ ...prev, [pergunta]: valor }));
  };

  const calcularPSQI = () => {
    const duracao = parseFloat(duracaoSono) || 0;
    const latencia = parseFloat(demoraAdormecer) || 0;
    const comp1 = duracao >= 7 ? 0 : duracao >= 6 ? 1 : duracao >= 5 ? 2 : 3;
    const comp2 = latencia <= 15 ? 0 : latencia <= 30 ? 1 : latencia <= 60 ? 2 : 3;
    const comp3 = qualidadeSono ?? 0;
    const disturbiosKeys = ['5a','5b','5c','5d','5e','5f','5g','5h','5i'];
    const comp4 = Math.min(3, Math.round(disturbiosKeys.reduce((acc, key) => acc + (respostas[key] ?? 0), 0) / disturbiosKeys.length));
    const comp5 = respostas['7'] ?? 0;
    const comp6 = respostas['8'] ?? 0;
    const comp7 = respostas['9'] ?? 0;
    return comp1 + comp2 + comp3 + comp4 + comp5 + comp6 + comp7;
  };

  const enviarResultado = async () => {
    if (!userId) return Alert.alert('Erro', 'Utilizador não autenticado.');
    if (!duracaoSono || !demoraAdormecer || qualidadeSono === null) {
      return Alert.alert('Erro', 'Preencha todas as respostas obrigatórias.');
    }
    const score = calcularPSQI();
    setResultadoFinal(score);
    const { error } = await supabase.from('qualidade_sono').insert([
      {
        user_id: userId,
        pontuacao: score,
        data: new Date().toISOString(),
        outros_disturbios: outrosTexto,
        outros_freq: outrosFreq,
        companheiro: companheiro,
        sintomas_companheiro: companheiroSintomas,
        outros_sintomas: outrosSintomasTexto,
      },
    ]);
    if (error) Alert.alert('Erro ao guardar resultado');
    else Alert.alert('Resultado guardado com sucesso');
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>🛌 Avaliação da Qualidade do Sono (PSQI-PT)</Text>

        <Text style={styles.label}>Horas de sono por noite:</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={duracaoSono} onChangeText={setDuracaoSono} placeholder="ex: 7.5" />

        <Text style={styles.label}>Minutos para adormecer:</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={demoraAdormecer} onChangeText={setDemoraAdormecer} placeholder="ex: 20" />

        <Text style={styles.label}>Qualidade do sono:</Text>
        {['Muito boa', 'Boa', 'Má', 'Muito Má'].map((op, i) => (
          <TouchableOpacity key={i} style={[styles.option, qualidadeSono === i && styles.selected]} onPress={() => setQualidadeSono(i)}>
            <Text style={qualidadeSono === i ? styles.selectedText : styles.optionText}>{op}</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.label}>8) Durante o mês passado, teve problemas em ficar acordado durante as refeições, ao conduzir, ou em atividades sociais?</Text>
        <View style={styles.row}>{opcoes.map((txt, i) => (
          <TouchableOpacity key={i} style={[styles.cell, respostas['8'] === i && styles.selected]} onPress={() => handleSelecionar('8', i)}>
            <Text style={respostas['8'] === i ? styles.selectedText : styles.optionText}>{txt}</Text>
          </TouchableOpacity>
        ))}</View>

        <Text style={styles.label}>9) Durante o mês passado, sentiu pouca vontade ou falta de entusiasmo para realizar atividades diárias?</Text>
        <View style={styles.row}>{opcoes.map((txt, i) => (
          <TouchableOpacity key={i} style={[styles.cell, respostas['9'] === i && styles.selected]} onPress={() => handleSelecionar('9', i)}>
            <Text style={respostas['9'] === i ? styles.selectedText : styles.optionText}>{txt}</Text>
          </TouchableOpacity>
        ))}</View>

        <Text style={styles.label}>10) Vive com um(a) companheiro(a)?</Text>
        {["Não", "Sim, mas em outro quarto", "Sim, no mesmo quarto mas não na mesma cama", "Sim, na mesma cama"].map((txt, i) => (
          <TouchableOpacity key={i} style={[styles.option, companheiro === i && styles.selected]} onPress={() => setCompanheiro(i)}>
            <Text style={companheiro === i ? styles.selectedText : styles.optionText}>{txt}</Text>
          </TouchableOpacity>
        ))}

        {companheiro !== 0 && (
          <>
            {['a','b','c','d'].map((k) => (
              <View key={k} style={{ marginBottom: 10 }}>
                <Text style={styles.label}>{`10${k})`} {k === 'a' && 'Ronco alto'}{k === 'b' && ' Pausas na respiração'}{k === 'c' && ' Movimentos das pernas'}{k === 'd' && ' Episódios de confusão'}</Text>
                <View style={styles.row}>{opcoes.map((txt, i) => (
                  <TouchableOpacity key={i} style={[styles.cell, companheiroSintomas[`10${k}`] === i && styles.selected]} onPress={() => setCompanheiroSintomas(prev => ({ ...prev, [`10${k}`]: i }))}>
                    <Text style={companheiroSintomas[`10${k}`] === i ? styles.selectedText : styles.optionText}>{txt}</Text>
                  </TouchableOpacity>
                ))}</View>
              </View>
            ))}
            <Text style={styles.label}>10e) Outros sintomas observados enquanto dorme:</Text>
            <TextInput style={styles.input} value={outrosSintomasTexto} onChangeText={setOutrosSintomasTexto} placeholder="Descreva" />
          </>
        )}

        <TouchableOpacity style={styles.submit} onPress={enviarResultado}>
          <Text style={styles.submitText}>Calcular Resultado</Text>
        </TouchableOpacity>

        {resultadoFinal !== null && (
          <View style={styles.resultBox}>
            <Text style={styles.resultText}>Pontuação PSQI: {resultadoFinal}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#08457E' },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10 },
  option: { padding: 10, borderWidth: 1, borderRadius: 8, borderColor: '#ccc', marginVertical: 3 },
  optionText: { color: '#333' },
  selected: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
  selectedText: { color: 'white', fontWeight: '700' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 10 },
  cell: { padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginRight: 5, marginBottom: 5 },
  submit: { marginTop: 20, backgroundColor: '#10b981', padding: 14, borderRadius: 10, alignItems: 'center' },
  submitText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  resultBox: { marginTop: 20, backgroundColor: '#D1FAE5', padding: 16, borderRadius: 10 },
  resultText: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#065F46' },
});
