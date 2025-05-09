// app/(root)/tabs/AnaliseComida.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../../lib/supabase';
import {
  recognizeFoodWithClarifai,
  getRealNutritionData,
  calculateGlycemicImpact,
} from '../../utils/utils';

interface FoodData {
  name: string;
  quantity: number;
  calories: number;
  carbs: number;
  glycemicIndex: number;
  glycemicLoad: number;
  description: string;
}

export default function AnaliseComida() {
  const [images, setImages] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mealData, setMealData] = useState<FoodData[]>([]);
  const [quantity, setQuantity] = useState('100');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled && result.assets.length) {
      setImages(prev => [...prev, result.assets[0].uri]);
    }
  };

  const analyzeImage = async (uri: string) => {
    if (!quantity || isNaN(Number(quantity))) {
      Alert.alert('Erro', 'Por favor, insira uma quantidade válida.');
      return;
    }
    setIsAnalyzing(true);

    try {
      console.log('🔍 Iniciando análise de imagem:', uri, 'quantidade:', quantity);

      // 1) Reconhece o alimento
      const foodName = await recognizeFoodWithClarifai(uri);
      console.log('🤖 Alimento reconhecido:', foodName);

      // 2) Obtém dados nutricionais
      const nutrition = await getRealNutritionData(foodName, quantity);
      if (!nutrition) throw new Error('Não foi possível obter dados nutricionais.');
      console.log('📊 Dados nutricionais:', nutrition);

      // 3) Calcula impacto glicêmico
      const glyImpact       = calculateGlycemicImpact(nutrition);
      const glycemicLoadNum = parseFloat(glyImpact.glycemicLoad);
      console.log('📈 Impacto glicêmico:', glyImpact);

      // 4) Monta o objeto
      const foodData: FoodData = {
        name:          foodName,
        quantity:      Number(quantity),
        calories:      nutrition.calories,
        carbs:         nutrition.carbs,
        glycemicIndex: nutrition.glycemicIndex,
        glycemicLoad:  glycemicLoadNum,
        description:   glyImpact.description,
      };
      console.log('🍽️ Montando registro para inserção:', foodData);

      // 5) Atualiza estado local
      setMealData(prev => [...prev, foodData]);

      // 6) Grava no Supabase
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      console.log('🔑 supabase.auth.getUser():', authData, authErr);
      const user = authData?.user;
      if (authErr || !user) throw new Error('Utilizador não autenticado.');

      const { data: inserted, error: insertErr } = await supabase
        .from('dados_usuario')
        .insert([{
          user_id:         user.id,
          food_name:       foodData.name,
          quantity:        foodData.quantity,
          calories:        foodData.calories,
          carbs:           foodData.carbs,
          glycemic_index:  foodData.glycemicIndex,
          glycemic_impact: foodData.glycemicLoad,
        }])
        .select();

      if (insertErr) {
        console.error(' Erro ao inserir no Supabase:', insertErr);
        Alert.alert('Erro BD', insertErr.message);
      } else {
        console.log('✅ Inserido com sucesso no Supabase:', inserted);
      }
    } catch (err: any) {
      console.error(' Falha na análise ou inserção:', err);
      Alert.alert('Erro', err.message || 'Falha ao analisar e gravar.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearMeal = () => {
    setMealData([]);
    setImages([]);
    setQuantity('100');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Análise de Alimentos</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={pickImage}
          disabled={isAnalyzing}
        >
          <Text style={styles.buttonText}>
            {isAnalyzing ? 'A analisar...' : 'Escolher Imagem do Alimento'}
          </Text>
        </TouchableOpacity>

        <View style={styles.imagesContainer}>
          {images.map((uri, idx) => (
            <Image key={idx} source={{ uri }} style={styles.image} />
          ))}
        </View>

        {images.length > 0 && (
          <>
            <Text style={styles.label}>Quantidade (g):</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
              placeholder="100"
            />
            <TouchableOpacity
              style={styles.button}
              onPress={() => analyzeImage(images[images.length - 1])}
              disabled={isAnalyzing}
            >
              <Text style={styles.buttonText}>
                {isAnalyzing ? 'A analisar...' : 'Adicionar Alimento'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {mealData.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Alimentos Registrados</Text>
            {mealData.map((f, idx) => (
              <View key={idx} style={styles.result}>
                <Text style={styles.info}>🍽️ {f.name}</Text>
                <Text style={styles.info}>⚖️ {f.quantity} g</Text>
                <Text style={styles.info}>🔥 {f.calories.toFixed(1)} kcal</Text>
                <Text style={styles.info}>🍞 {f.carbs.toFixed(1)} g carbs</Text>
                <Text style={styles.info}>📊 IG: {f.glycemicIndex}</Text>
                <Text style={styles.info}>💡 {f.description}</Text>
              </View>
            ))}
          </View>
        )}

        {!isAnalyzing && mealData.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={clearMeal}>
            <Text style={styles.buttonText}>Limpar Refeição</Text>
          </TouchableOpacity>
        )}

        {isAnalyzing && (
          <ActivityIndicator style={styles.loading} size="large" color="#3b82f6" />
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#f8fafc', paddingTop: 30 },
  scroll:          { alignItems: 'center', padding: 20, paddingBottom: 100 },
  title:           { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  button:          { backgroundColor: '#3b82f6', padding: 14, borderRadius: 12, marginVertical: 10 },
  buttonText:      { color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  clearButton:     { backgroundColor: '#ef4444', padding: 14, borderRadius: 12, marginTop: 20 },
  image:           { width: 220, height: 220, borderRadius: 12, marginVertical: 10 },
  imagesContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  label:           { fontSize: 16, fontWeight: '600', marginTop: 10, color: '#333' },
  input:           { width: 150, backgroundColor: '#fff', padding: 10, borderRadius: 8, marginVertical: 5, textAlign: 'center' },
  card:            { backgroundColor: '#fff', padding: 20, borderRadius: 16, marginTop: 30, width: '100%' },
  cardTitle:       { fontSize: 18, fontWeight: '700', marginBottom: 10, textAlign: 'center', color: '#3b82f6' },
  result:          { marginTop: 15 },
  info:            { fontSize: 16, marginBottom: 6, color: '#555' },
  loading:         { marginTop: 20 },
  bottomPadding:   { height: 100 },
});
