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

const AnaliseComida: React.FC = () => {
  const [images, setImages] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mealData, setMealData] = useState<any[]>([]);
  const [quantity, setQuantity] = useState('100');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled && result.assets.length) {
      setImages((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const analyzeImage = async (uri: string) => {
    if (!quantity || isNaN(Number(quantity))) {
      Alert.alert('Erro', 'Por favor, insira uma quantidade válida.');
      return;
    }
    setIsAnalyzing(true);

    try {
      // 1) Reconhece o nome do alimento
      const foodName = await recognizeFoodWithClarifai(uri);

      // 2) Busca dados nutricionais
      const nutrition = await getRealNutritionData(foodName, quantity);
      if (!nutrition) throw new Error('Não foi possível obter dados nutricionais.');

      // 3) Calcula impacto glicêmico (glycemicLoad é string)
      const glyImpact = calculateGlycemicImpact(nutrition);
      const glycemicLoadNum = parseFloat(glyImpact.glycemicLoad);

      // 4) Monta o objeto
      const foodData = {
        name:            foodName,
        quantity:        Number(quantity),
        calories:        nutrition.calories,
        carbs:           nutrition.carbs,
        glycemicIndex:   nutrition.glycemicIndex,
        glycemicLoad:    glycemicLoadNum,
        description:     glyImpact.description,
      };

      // 5) Atualiza estado
      setMealData((prev) => [...prev, foodData]);

      // 6) Grava no Supabase
      const { data, error: authErr } = await supabase.auth.getUser();
      const user = data?.user;
      if (authErr || !user) throw new Error('Utilizador não autenticado.');

      const { error: insertErr } = await supabase
        .from('dados_usuario')
        .insert({
          food_name:       foodData.name,
          quantity:        foodData.quantity,
          calories:        foodData.calories,
          carbs:           foodData.carbs,
          glycemic_index:  foodData.glycemicIndex,
          glycemic_impact: foodData.glycemicLoad,
        });

      if (insertErr) console.warn('Aviso: não foi possível gravar no servidor.', insertErr);
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculateTotals = () =>
    mealData.reduce(
      (acc, f) => {
        acc.totalCalories += f.calories;
        acc.totalCarbs    += f.carbs;
        acc.totalGlyImpact += f.glycemicLoad;
        return acc;
      },
      { totalCalories: 0, totalCarbs: 0, totalGlyImpact: 0 }
    );

  const clearMeal = () => {
    setMealData([]);
    setImages([]);
    setQuantity('100');
  };

  const { totalCalories, totalCarbs, totalGlyImpact } = calculateTotals();

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
          {images.map((uri, i) => (
            <Image key={i} source={{ uri }} style={styles.image} />
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
            <Text style={styles.cardTitle}>Alimentos na Refeição</Text>
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

            <View style={styles.result}>
              <Text style={styles.info}>
                🔥 Total Calorias: {totalCalories.toFixed(1)} kcal
              </Text>
              <Text style={styles.info}>
                🍞 Total Carbs: {totalCarbs.toFixed(1)} g
              </Text>
              <Text style={styles.info}>
                📊 Total Impacto Glicêmico: {totalGlyImpact.toFixed(1)}
              </Text>
            </View>
          </View>
        )}

        {mealData.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={clearMeal}>
            <Text style={styles.buttonText}>Limpar Refeição</Text>
          </TouchableOpacity>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AnaliseComida;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', paddingTop: 30 },
  scroll: { alignItems: 'center', padding: 20, paddingBottom: 100 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  button: {
    backgroundColor: '#3b82f6',
    padding: 14,
    borderRadius: 12,
    marginVertical: 10,
    elevation: 5,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  clearButton: {
    backgroundColor: '#ef4444',
    padding: 14,
    borderRadius: 12,
    marginTop: 20,
    elevation: 5,
  },
  image: { width: 220, height: 220, borderRadius: 12, marginVertical: 10 },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  label: { fontSize: 16, fontWeight: '600', marginTop: 10, color: '#333' },
  input: {
    width: 150,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginTop: 30,
    width: '100%',
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
    color: '#3b82f6',
  },
  result: { marginTop: 15 },
  info: { fontSize: 16, marginBottom: 6, color: '#555' },
  bottomPadding: { height: 100 },
});
