import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';

const perguntas = [
  {
    id: 1,
    texto: 'Considerando apenas o seu bem-estar pessoal, e com liberdade total para planear o seu dia, a que horas se levantaria?',
    opcoes: [
      { texto: '05:00 às 06:30', valor: 5 },
      { texto: '06:30 às 07:45', valor: 4 },
      { texto: '07:45 às 09:45', valor: 3 },
      { texto: '09:45 às 11:00', valor: 2 },
      { texto: '11:00 às 12:00', valor: 1 },
    ],
  },
  {
    id: 2,
    texto: 'Considerando apenaas o seu bem estar pessoal e com total liberdade de planear a sua noite, a que horas se deitaria?',
    opcoes: [
      { texto: '20:00 às 21:00', valor: 5 },
      { texto: '21:00 às 22:15', valor: 4 },
      { texto: '22:15 às 00:30', valor: 3 },
      { texto: '00:30 às 01:45', valor: 2 },
      { texto: '01:45 às 03:00', valor: 1 },
    ],
  },
  {
    id: 3,
    texto: 'Depende do despertador para acordar de manhã?',
    opcoes: [
      { texto: 'Não dependo', valor: 4 },
      { texto: 'Não sou muito dependente', valor: 3 },
      { texto: 'Sou razoavelmente dependente', valor: 2 },
      { texto: 'Sou muito dependente', valor: 1 },
    ],
  },
  {
    id: 4,
    texto: 'Considera fácil acordar de manhã?',
    opcoes: [
      { texto: 'Muito fácil', valor: 4 },
      { texto: 'Razoavelmente fácil', valor: 3 },
      { texto: 'Não muito fácil', valor: 2 },
      { texto: 'Nada fácil', valor: 1 },
    ],
  },
  {
    id: 5,
    texto: 'Você se sente alerta durante a primeira meia hora depois de acordar?',
    opcoes: [
      { texto: 'Muito alerta', valor: 4 },
      { texto: 'Razoavelmente alerta', valor: 3 },
      { texto: 'Não muito alerta', valor: 2 },
      { texto: 'Nada alerta', valor: 1 },
    ],
  },
  {
    id: 6,
    texto: 'Como é o seu apetite durante a primeira meia hora depois de acordar?',
    opcoes: [
      { texto: 'Muito bom', valor: 4 },
      { texto: 'Razoavelmente bom', valor: 3 },
      { texto: 'Não muito ruim', valor: 2 },
      { texto: 'Muito ruim', valor: 1 },
    ],
  },
  {
    id: 7,
    texto: 'Após meia hora de acordar, sente-se cansado?',
    opcoes: [
      { texto: 'Em plena forma', valor: 4 },
      { texto: 'Razoavelmente em forma', valor: 3 },
      { texto: 'Não muito cansado', valor: 2 },
      { texto: 'Muito cansado', valor: 1 },
    ],
  },
  {
    id: 8,
    texto: 'Na falta de compromissos no dia seguinte e comparando com a sua hora habitual, a que horas se deitaria?',
    opcoes: [
      { texto: 'Nunca mais tarde', valor: 4 },
      { texto: 'Menos de 1 hora mais tarde', valor: 3 },
      { texto: 'Entre 1 a 2 horas mais tarde', valor: 2 },
      { texto: 'Mais do que 2 horas mais tarde', valor: 1 },
    ],
  },
  {
    id: 9,
    texto: 'Um amigo sugeriu o horário das 07:00 às 08:00 horas da manhã para a prática de exercício físico. Considerando apenas o seu bem estar pessoal, o que acha da prática de exercício no respetivo horário?',
    opcoes: [
      { texto: 'Estaria em boa forma', valor: 4 },
      { texto: 'Estaria razoavelmente em forma', valor: 3 },
      { texto: 'Acharia isso difícil', valor: 2 },
      { texto: 'Acharia muito difícil', valor: 1 },
    ],
  },
  {
    id: 10,
    texto: 'A que horas da noite se sente cansado e com vontade de dormir?',
    opcoes: [
      { texto: '20:00 às 21:00', valor: 5 },
      { texto: '21:00 às 22:15', valor: 4 },
      { texto: '22:15 às 00:45', valor: 3 },
      { texto: '00:45 às 02:00', valor: 2 },
      { texto: '02:00 às 03:00', valor: 1 },
    ],
  },
  {
    id: 11,
    texto: 'Quer estar no máximo da sua forma para fazer um teste de que dura 02:00 horas e de que tem conhecimento ser mentalmente cansativo. Considerando apenas o seu bem estar pessoal, qual dos seguintes horários escolheria para realizar o teste?',
    opcoes: [
      { texto: '08:00 às 10:00', valor: 6 },
      { texto: '11:00 às 13:00', valor: 4 },
      { texto: '15:00 às 17:00', valor: 2 },
      { texto: '19:00 às 21:00', valor: 1 },
      
    ],
  },
  {
    id:12,
    texto: 'No caso de se deitar às 23:00 horas, em que nível de cansaço se encontraria?',
    opcoes: [
        {texto:'Muito cansado', valor: 5 },
        {texto:'Razoavelmente cansado', valor: 3 },
        {texto:' Um pouco cansado', valor: 2 },
        {texto:'Nada cansado', valor: 0 },
    ],
  },
  {
    id: 13,
    texto: 'Por alguma razão vai dormir várias horas mais tarde do que é costume. Se no dia seguinte não tiver hora certa para acordar, o que aconteceria?',
    opcoes: [
      { texto: 'Acordaria na hora normal, sem sono', valor: 4 },
      { texto: 'Acordaria na hora normal, com sono', valor: 3 },
      { texto: 'Acordaria na hora normal e dormiria novamente', valor: 2 },
      { texto: 'Acordaria mais tarde do que o costume', valor: 1 },
      
    ],
  },
  {
    id:14,
    texto: 'Se tiver que ficar acordado das 04:00 às 06:00 horas da manhã para realizar uma tarefa e não possuir compromissos no dia seguinte, o que faria?',
    opcoes: [
        {texto: 'Só dormiria antes da tarefa', valor: 4 },
        {texto: 'Dormiria bastante antes e um pouco depois', valor: 3 },
        {texto: 'Dormiria um pouco antes e bastante depois', valor: 2 },
        {texto: 'Só dormiria depois da tarefa', valor: 1 },
    ],
    },
    {
        id:15,
        texto: 'Se necessitasse de fazer duas horas de exercício físico pesado e considerando apenas o seu bem estar pessoal, a que horas o faria?',
        opcoes: [
            {texto: '08:00 às 10:00', valor: 4 },
            {texto: '11:00 às 13:00', valor: 3 },
            {texto: '15:00 às 17:00', valor: 2 },
            {texto: '19:00 às 21:00', valor: 1 },
        ],
    },
    {
        id:16,
        texto:'Decidiu fazer exercício físico. Um amigosugeriu o horário das 22:00 às 23:00 horas, duas vezes por semana. Considerando apenas o seu bem estar pessoal, o que acha do exercício físico nesse horário?',
        opcoes: [
            {texto: 'Acharia muito pouco provável', valor: 4 },
            {texto: 'Acharia pouco provável', valor: 3 },
            {texto: 'Acharia razoavelmente provável', valor: 2 },
            {texto: 'Acharia muito provável', valor: 1 },
        ],
    },
    {
        id:17,
        texto:'Suponha que tem a possibilade de escolher o seu próprio horário de trabalho e que deve trabalhar durante cinco horas seguidas por dia. Imagine que seja um serviço interessante e que ganharia por produção. Qual horário escolheria para começar?',
        opcoes: [
            {texto: '05:00 às 08:00', valor: 5 },
            {texto: '08:00 às 13:00', valor: 4 },
            {texto: '09:00 às 14:00', valor: 3 },
            {texto: '14:00 às 19:00', valor: 2 },
            {texto: '19:00 às 00:00', valor: 1 },
        ],
    },
    {
        id:18,
        texto:'A que horas do dia atinge o seu melhor momento de bem estar?',
        opcoes: [
            {texto: '05:00 às 08:00', valor: 5 },
            {texto: '08:00 às 10:00', valor: 4 },
            {texto: '10:00 às 17:00', valor: 3 },
            {texto: '17:00 às 22:00', valor: 2 },
            {texto: '22:00 às 05:00', valor: 1 },
        ],	
    },
    {
        id:19,
        texto:'Fala-se em pessoas matutinas e vespertinas (as primeiras preferem e gostam de acordar cedo e dormir cedo, as segundas de acordar tarde e dormir tarde). Com qual destas se identifica?',
        opcoes: [
            {texto: 'Tipo matutino', valor: 6},
            {texto: 'Sou mais matutino do que vespertino', valor: 4 },
            {texto: 'Sou mais vespertino do que matutino', valor: 2 },
            {texto: 'Tipo vespertino', valor: 1},
        ],
    }

]
  // Adicionar mais perguntas aqui...


const interpretarPontuacao = (score: number) => {
  if (score <= 30) return 'Vespertino Extremo';
  if (score <= 41) return 'Vespertino Moderado';
  if (score <= 58) return 'Intermediário';
  if (score <= 69) return 'Matutino Moderado';
  return 'Matutino Extremo';
};

const CronotipoScreen = () => {
  const [respostas, setRespostas] = useState<{ [key: number]: { valor: number, texto: string } }>({});
  const [resultado, setResultado] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [submetido, setSubmetido] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user?.id) {
        setUserId(data.user.id);
        fetchHistorico(data.user.id);
      }
    };
    fetchUser();
  }, []);

  const fetchHistorico = async (uid: string) => {
    const { data, error } = await supabase
      .from('cronotipos')
      .select('*')
      .eq('user_id', uid)
      .order('data', { ascending: false });
    if (data) {
      console.log('Histórico de cronotipos:', data);
    }
  };

  const handleSelecionar = (perguntaId: number, valor: number, texto: string) => {
    setRespostas({ ...respostas, [perguntaId]: { valor, texto } });
  };

  const calcularResultado = async () => {
    if (Object.keys(respostas).length !== perguntas.length) {
      Alert.alert('Erro', 'Responda todas as perguntas antes de continuar.');
      return;
    }

    const score = Object.values(respostas).reduce((acc, obj) => acc + obj.valor, 0);
    const interpretacao = interpretarPontuacao(score);
    const textoResultado = `Pontuação: ${score} → ${interpretacao}`;
    setResultado(textoResultado);

    if (userId && !submetido) {
      const { error } = await supabase.from('cronotipos').insert([
        {
          user_id: userId,
          pontuacao: score,
          tipo: interpretacao,
          data: new Date().toISOString(),
        },
      ]);
      if (error) {
        console.error('Erro ao guardar cronotipo:', error);
        Alert.alert('Erro ao guardar no Supabase');
      } else {
        setSubmetido(true);
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.titulo}>📋 Avaliação de Cronotipo</Text>

        {perguntas.map((p) => (
          <View key={p.id} style={{ marginBottom: 24 }}>
            <Text style={styles.pergunta}>{p.texto}</Text>
            {p.opcoes.map((op, i) => {
              const selecionado = respostas[p.id]?.valor === op.valor;
              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.botaoOpcao, selecionado && styles.botaoSelecionado]}
                  onPress={() => handleSelecionar(p.id, op.valor, op.texto)}
                >
                  <Text style={selecionado ? styles.opcaoSelecionada : styles.opcaoTexto}>
                    {selecionado ? '✔ ' : ''}{op.texto}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        <TouchableOpacity style={styles.botaoFinalizar} onPress={calcularResultado} disabled={submetido}>
          <Text style={styles.botaoFinalizarTexto}>
            {submetido ? 'Resultado Enviado' : 'Ver Resultado'}
          </Text>
        </TouchableOpacity>

        {resultado && (
          <View style={styles.resultadoBox}>
            <Text style={styles.resultadoTexto}>{resultado}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  titulo: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1e3a8a',
  },
  pergunta: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#111827',
  },
  botaoOpcao: {
    backgroundColor: '#e5e7eb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  botaoSelecionado: {
    backgroundColor: '#4f46e5',
  },
  opcaoTexto: {
    color: '#1f2937',
  },
  opcaoSelecionada: {
    color: 'white',
    fontWeight: '700',
  },
  botaoFinalizar: {
    backgroundColor: '#10b981',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  botaoFinalizarTexto: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  resultadoBox: {
    backgroundColor: '#d1fae5',
    marginTop: 20,
    padding: 16,
    borderRadius: 8,
  },
  resultadoTexto: {
    color: '#065f46',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default CronotipoScreen;