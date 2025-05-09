// app/(root)/tabs/Explore.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Modal,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { supabase } from '../../../lib/supabase';
import { Calendar, DateData } from 'react-native-calendars';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

interface Registo {
  id: string;
  data: string;
  dia: string;
  hora: string;
  tipo: 'glicose' | 'sono' | 'comida' | 'medicamento';
  valorGlicose?: string;
  detalhesSono?: string;
  food_name?: string;
  quantity?: number;
  calories?: number;
  carbs?: number;
  glycemic_index?: number;
  glycemic_impact?: number;
  descricao?: string;
  dose?: string;
}

const Explore = () => {
  const [registros, setRegistros] = useState<Registo[]>([]);
  const [selectedRegistro, setSelectedRegistro] = useState<Registo | null>(null);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const { data: dsodata } = await supabase
          .from('dados_usuario')
          .select('id, created_at, glicose, sono')
          .order('created_at', { ascending: false });

        const { data: comidaData } = await supabase
          .from('comida')
          .select('id, created_at, food_name, quantity, calories, carbs, glycemic_index, glycemic_impact')
          .order('created_at', { ascending: false });

        const { data: medData } = await supabase
          .from('medicamentos')
          .select('id, created_at, descricao, dose')
          .order('created_at', { ascending: false });

        const registros: Registo[] = [];

        dsodata?.forEach((item) => {
          const dt = new Date(item.created_at);
          registros.push({
            id: item.id,
            data: dt.toISOString().split('T')[0],
            dia: dt.toLocaleDateString('pt-PT', { weekday: 'short' }),
            hora: dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            tipo: item.glicose ? 'glicose' : 'sono',
            valorGlicose: item.glicose?.toString(),
            detalhesSono: item.sono ? `Sono: ${item.sono} h` : undefined,
          });
        });

        comidaData?.forEach((item) => {
          const dt = new Date(item.created_at);
          registros.push({
            id: item.id,
            data: dt.toISOString().split('T')[0],
            dia: dt.toLocaleDateString('pt-PT', { weekday: 'short' }),
            hora: dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            tipo: 'comida',
            food_name: item.food_name,
            quantity: item.quantity,
            calories: item.calories,
            carbs: item.carbs,
            glycemic_index: item.glycemic_index,
            glycemic_impact: item.glycemic_impact,
          });
        });

        medData?.forEach((item) => {
          const dt = new Date(item.created_at);
          registros.push({
            id: item.id,
            data: dt.toISOString().split('T')[0],
            dia: dt.toLocaleDateString('pt-PT', { weekday: 'short' }),
            hora: dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            tipo: 'medicamento',
            descricao: item.descricao,
            dose: item.dose,
          });
        });

        registros.sort(
          (a, b) => new Date(`${b.data}T${b.hora}`).getTime() - new Date(`${a.data}T${a.hora}`).getTime()
        );

        setRegistros(registros);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        Alert.alert('Erro', 'Falha ao carregar histórico.');
      }
    };

    fetchAll();
  }, []);

  const exportarParaPDF = async () => {
    const total = {
      glicose: registros.filter(r => r.tipo === 'glicose').length,
      sono: registros.filter(r => r.tipo === 'sono').length,
      comida: registros.filter(r => r.tipo === 'comida').length,
      medicamento: registros.filter(r => r.tipo === 'medicamento').length
    };

    const html = `
      <html><head><meta charset="utf-8"/><style>
        body{font-family:Arial;padding:20px;}
        h1{text-align:center;}
        .r{margin-bottom:12px;border:1px solid #ccc;padding:8px;border-radius:6px;}
        .l{font-weight:bold;}
        .sumario{margin-bottom:20px;}
      </style></head><body>
      <h1>Histórico de Registos</h1>
      <div class="sumario">
        <p><span class="l">Total de Registos:</span></p>
        <ul>
          <li>Glicose: ${total.glicose}</li>
          <li>Sono: ${total.sono}</li>
          <li>Comida: ${total.comida}</li>
          <li>Medicamento: ${total.medicamento}</li>
        </ul>
      </div>
      ${registros.map(r => `
        <div class="r">
          <div class="l">Data:</div> ${r.data} (${r.dia})<br/>
          <div class="l">Hora:</div> ${r.hora}<br/>
          <div class="l">Tipo:</div> ${r.tipo}<br/>
          <div class="l">Valor:</div> ${
            r.tipo === 'glicose' ? r.valorGlicose + ' mg/dL' :
            r.tipo === 'sono' ? r.detalhesSono :
            r.tipo === 'comida' ? `${r.food_name} — ${r.calories} kcal, ${r.carbs}g carbs` :
            r.tipo === 'medicamento' ? `${r.descricao} — ${r.dose}` : ''
          }
        </div>`).join('')}
      </body></html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (e) {
      console.error(e);
      Alert.alert('Erro', 'Falha ao exportar PDF.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Text style={{ fontSize: 24, textAlign: 'center', marginVertical: 10 }}>Histórico</Text>
      <TouchableOpacity style={{ backgroundColor: '#4A90E2', padding: 10, margin: 10, borderRadius: 8 }} onPress={exportarParaPDF}>
        <Text style={{ color: '#fff', textAlign: 'center' }}>Exportar PDF</Text>
      </TouchableOpacity>
      <Calendar
        onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
        markedDates={{ [selectedDate]: { selected: true, selectedColor: '#4A90E2' } }}
      />
      <FlatList
        data={registros.filter(r => r.data === selectedDate)}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => { setSelectedRegistro(item); setModalVisivel(true); }} style={{ backgroundColor: '#fff', margin: 10, padding: 10, borderRadius: 8 }}>
            <Text>{item.hora} - {item.tipo.toUpperCase()}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>Sem registos para este dia.</Text>}
      />

      <Modal visible={modalVisivel} transparent animationType="slide">
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000099' }}>
          <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 12, width: '80%' }}>
            {selectedRegistro && (
              <>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Detalhes</Text>
                <Text>Tipo: {selectedRegistro.tipo}</Text>
                <Text>Hora: {selectedRegistro.hora}</Text>
                {selectedRegistro.tipo === 'glicose' && <Text>Glicose: {selectedRegistro.valorGlicose} mg/dL</Text>}
                {selectedRegistro.tipo === 'sono' && <Text>{selectedRegistro.detalhesSono}</Text>}
                {selectedRegistro.tipo === 'comida' && (
                  <>
                    <Text>Alimento: {selectedRegistro.food_name}</Text>
                    <Text>Calorias: {selectedRegistro.calories}</Text>
                    <Text>Carbs: {selectedRegistro.carbs}</Text>
                  </>
                )}
                {selectedRegistro.tipo === 'medicamento' && (
                  <>
                    <Text>Medicamento: {selectedRegistro.descricao}</Text>
                    <Text>Dose: {selectedRegistro.dose}</Text>
                  </>
                )}
                <TouchableOpacity onPress={() => setModalVisivel(false)} style={{ marginTop: 20, backgroundColor: '#4A90E2', padding: 10, borderRadius: 8 }}>
                  <Text style={{ color: '#fff', textAlign: 'center' }}>Fechar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Explore;
