// Ecrã de questionário PSQI-PT com cálculo e envio ao Supabase
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';

const opcoes = ['Nunca', 'Menos de 1x/semana', '1 ou 2x/semana', '3x/semana ou mais'];
const valores = [0, 1, 2, 3];

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
    const comp4 = Math.min(
      3,
      Math.round(
        disturbiosKeys.reduce((acc, key) => acc + (respostas[key] ?? 0), 0) / disturbiosKeys.length
      )
    );

    const comp5 = respostas['7'] ?? 0;
    const comp6 = respostas['8'] ?? 0;
    const comp7 = respostas['9'] ?? 0;

    const total = comp1 + comp2 + comp3 + comp4 + comp5 + comp6 + comp7;
    return total;
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

        <Text style={styles.label}>Distúrbios do sono (5a–5i):</Text>
        {['a','b','c','d','e','f','g','h','i'].map((k) => (
          <View key={k} style={{ marginBottom: 6 }}>
            <Text style={{ fontWeight: '600' }}>5{k})</Text>
            {opcoes.map((txt, i) => (
              <TouchableOpacity key={i} style={[styles.option, respostas[`5${k}`] === i && styles.selected]} onPress={() => handleSelecionar(`5${k}`, i)}>
                <Text style={respostas[`5${k}`] === i ? styles.selectedText : styles.optionText}>{txt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <Text style={styles.label}>5j) Outra razão (descreva):</Text>
        <TextInput style={styles.input} value={outrosTexto} onChangeText={setOutrosTexto} placeholder="ex: barulho exterior" />
        <Text style={styles.label}>Frequência:</Text>
        {opcoes.map((txt, i) => (
          <TouchableOpacity key={i} style={[styles.option, outrosFreq === i && styles.selected]} onPress={() => setOutrosFreq(i)}>
            <Text style={outrosFreq === i ? styles.selectedText : styles.optionText}>{txt}</Text>
          </TouchableOpacity>
        ))}

        {[7,8,9].map((n) => (
          <View key={n} style={{ marginBottom: 10 }}>
            <Text style={{ fontWeight: '600' }}>{n})</Text>
            {opcoes.map((txt, i) => (
              <TouchableOpacity key={i} style={[styles.option, respostas[n] === i && styles.selected]} onPress={() => handleSelecionar(String(n), i)}>
                <Text style={respostas[n] === i ? styles.selectedText : styles.optionText}>{txt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <Text style={styles.label}>10) Vive com um(a) companheiro(a)?</Text>
        {["Não", "Sim, mas em outro quarto", "Sim, no mesmo quarto mas não na mesma cama", "Sim, na mesma cama"].map((txt, i) => (
          <TouchableOpacity key={i} style={[styles.option, companheiro === i && styles.selected]} onPress={() => setCompanheiro(i)}>
            <Text style={companheiro === i ? styles.selectedText : styles.optionText}>{txt}</Text>
          </TouchableOpacity>
        ))}

        {companheiro !== 0 && (
          <>
            {['a','b','c','d'].map((k) => (
              <View key={k} style={{ marginBottom: 6 }}>
                <Text style={{ fontWeight: '600' }}>10{k})</Text>
                {opcoes.map((txt, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.option, companheiroSintomas[`10${k}`] === i && styles.selected]}
                    onPress={() => setCompanheiroSintomas(prev => ({ ...prev, [`10${k}`]: i }))}
                  >
                    <Text style={companheiroSintomas[`10${k}`] === i ? styles.selectedText : styles.optionText}>{txt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
            <Text style={styles.label}>10e) Outros sintomas:</Text>
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
  submit: { marginTop: 20, backgroundColor: '#10b981', padding: 14, borderRadius: 10, alignItems: 'center' },
  submitText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  resultBox: { marginTop: 20, backgroundColor: '#D1FAE5', padding: 16, borderRadius: 10 },
  resultText: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#065F46' },
});
