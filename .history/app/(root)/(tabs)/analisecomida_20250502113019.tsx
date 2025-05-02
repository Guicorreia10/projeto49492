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
import {
  recognizeFoodWithClarifai,
  getRealNutritionData,
  calculateGlycemicImpact,
} from '../../utils/utils';

const AnaliseComida: React.FC = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [nutritionalData, setNutritionalData] = useState<any | null>(null);
  const [quantity, setQuantity] = useState('100');

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
        <Text style={styles.title}>Análise de Alimento</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={pickImage}
          disabled={isAnalyzing}
        >
          <Text style={styles.buttonText}>
            {isAnalyzing ? 'A analisar...' : 'Escolher Imagem do Alimento'}
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
            <View style={styles.result}>
              <Text style={styles.info}>🍽️ Alimento: {nutritionalData.name}</Text>
              <Text style={styles.info}>⚖️ Porção: {nutritionalData.portion}</Text>
              <Text style={styles.info}>🔥 Calorias: {nutritionalData.calories.toFixed(1)} kcal</Text>
              <Text style={styles.info}>🍞 Carboidratos: {nutritionalData.carbs.toFixed(1)} g</Text>
              <Text style={styles.info}>📊 Índice Glicémico: {nutritionalData.glycemicIndex}</Text>
              <Text style={styles.info}>💡 {nutritionalData.glycemicImpact.description}</Text>
            </View>
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
    paddingTop: 30,
  },
  scroll: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
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
    borderColor: '#ddd',
    borderWidth: 1,
    backgroundColor: '#f5f5f5',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    padding: 10,
    borderRadius: 8,
    width: 150,
    textAlign: 'center',
    marginTop: 5,
    fontSize: 16,
    backgroundColor: '#ffffff',
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
    color: '#3b82f6',
  },
  result: {
    marginTop: 15,
  },
  info: {
    fontSize: 16,
    marginBottom: 6,
    color: '#555',
  },
});

