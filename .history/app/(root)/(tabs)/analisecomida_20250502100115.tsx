import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { recognizeFoodWithClarifai, getFoodNutritionByName, calculateGlycemicImpact } from '../../utils/utils';

const AnaliseComida: React.FC = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [nutritionalData, setNutritionalData] = useState<any | null>(null);

  const pickImage = async () => {
    setNutritionalData(null);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
      analyzeImage(result.assets[0].uri);
    }
  };

  const analyzeImage = async (uri: string) => {
    setIsAnalyzing(true);
    try {
      const foodName = await recognizeFoodWithClarifai(uri);
      const nutrition = await getFoodNutritionByName(foodName);
      const glycemicImpact = calculateGlycemicImpact(nutrition);
      setNutritionalData({ ...nutrition, ...glycemicImpact });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível analisar a imagem.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Analisador de Alimentos</Text>
      
      <TouchableOpacity style={styles.button} onPress={pickImage} disabled={isAnalyzing}>
        <Text style={styles.buttonText}>
          {isAnalyzing ? 'Analisando...' : 'Selecionar Alimento'}
        </Text>
      </TouchableOpacity>
      
      {isAnalyzing && (
        <ActivityIndicator size="large" color="#fff" style={styles.loadingIndicator} />
      )}

      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
        />
      )}

      {nutritionalData && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>Nome: <Text style={styles.bold}>{nutritionalData.name}</Text></Text>
          <Text style={styles.infoText}>Porção: {nutritionalData.portion}</Text>
          <Text style={styles.infoText}>Calorias: {nutritionalData.calories} kcal</Text>
          <Text style={styles.infoText}>Carboidratos: {nutritionalData.carbs} g</Text>
          <Text style={styles.infoText}>Índice Glicêmico: {nutritionalData.glycemicIndex}</Text>
          <Text style={styles.infoText}>{nutritionalData.description}</Text>
        </View>
      )}
    </View>
  );
};

export default AnaliseComida;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 16,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    width: 250,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingIndicator: {
    marginTop: 20,
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  infoBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 10,
    marginTop: 20,
    width: 280,
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  bold: {
    fontWeight: 'bold',
    color: '#007BFF',
  },
});
