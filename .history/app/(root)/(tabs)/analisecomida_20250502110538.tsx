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
import { recognizeFoodWithClarifai, getRealNutritionData, calculateGlycemicImpact } from '../../utils/utils';
import { supabase } from "../../../lib/supabase";

const AnaliseComida: React.FC = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [nutritionalData, setNutritionalData] = useState<any | null>(null);
  const [quantity, setQuantity] = useState('100');
  const [utilizadorId, setUtilizadorId] = useState<string>('user-uuid'); // Substitua por seu usuário autenticado

  // Função para salvar a análise no Supabase
  const saveAnalysisToSupabase = async (nutrition: any, glycemicImpact: any) => {
    try {
      const { data, error } = await supabase
        .from('analises')
        .insert([
          {
            utilizador_id: utilizadorId, // ID do utilizador autenticado
            nome_alimento: nutrition.name,
            quantidade_gramas: parseInt(quantity),
            calorias_kcal: nutrition.calories,
            carboidratos_g: nutrition.carbs,
            indice_glicemico: nutrition.glycemicIndex,
            carga_glicemica: glycemicImpact.glycemicLoad,
            porcao_sugerida: nutrition.portion, // ou outro valor se necessário
          },
        ]);

      if (error) {
        throw error;
      }

      Alert.alert('Sucesso', 'Dados salvos com sucesso no banco de dados.');
      console.log('Dados salvos no Supabase:', data);
    } catch (error) {
      console.error('Erro ao salvar dados no Supabase:', error);
      Alert.alert('Erro', 'Falha ao salvar os dados. Tente novamente.');
    }
  };

  // Função para escolher a imagem
  const pickImage = async () => {
    setNutritionalData(null);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      analyzeImage(uri);
    }
  };

  // Função para analisar a imagem
  const analyzeImage = async (uri: string) => {
    if (!quantity || isNaN(Number(quantity))) {
      Alert.alert('Erro', 'Por favor, insira uma quantidade válida.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const foodName = await recognizeFoodWithClarifai(uri);
      const nutrition = await getRealNutritionData(foodName, quantity);

      if (!nutrition) {
        Alert.alert('Erro', 'Não foi possível obter os dados nutricionais.');
        return;
      }

      const glycemicImpact = calculateGlycemicImpact(nutrition);
      setNutritionalData({ ...nutrition, glycemicImpact });

      // Salva os dados no Supabase
      await saveAnalysisToSupabase(nutrition, glycemicImpact);
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao analisar a imagem. Tente novamente.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity
          style={styles.button}
          onPress={pickImage}
          disabled={isAnalyzing}
        >
          <Text style={styles.buttonText}>
            {isAnalyzing ? 'A analisar...' : 'Selecionar Imagem do Alimento'}
          </Text>
        </TouchableOpacity>

        {isAnalyzing && <ActivityIndicator size="large" color="#3b82f6" style={styles.loading} />}

        {imageUri && (
          <>
            <Image source={{ uri: imageUri }} style={styles.image} />
            <Text style={styles.label}>Quantidade (g):</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Ex: 150"
              value={quantity}
              onChangeText={setQuantity}
            />
          </>
        )}

        {nutritionalData && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Resultado Nutricional</Text>
            <Text style={styles.info}>🍽️ Alimento: {nutritionalData.name}</Text>
            <Text style={styles.info}>⚖️ Porção: {nutritionalData.portion}</Text>
            <Text style={styles.info}>🔥 Calorias: {nutritionalData.calories.toFixed(1)} kcal</Text>
            <Text style={styles.info}>🍞 Carboidratos: {nutritionalData.carbs.toFixed(1)} g</Text>
            <Text style={styles.info}>📊 Índice Glicêmico: {nutritionalData.glycemicIndex}</Text>
            <Text style={styles.info}>💡 {nutritionalData.glycemicImpact.description}</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AnaliseComida;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scroll: {
    alignItems: 'center',
    padding: 20,
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 30,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loading: {
    marginTop: 20,
  },
  image: {
    width: 220,
    height: 220,
    borderRadius: 12,
    marginVertical: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    padding: 10,
    borderRadius: 8,
    width: 150,
    textAlign: 'center',
    marginTop: 5,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    marginTop: 30,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  info: {
    fontSize: 16,
    marginBottom: 6,
  },
});
