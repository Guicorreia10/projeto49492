import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { recognizeFoodWithClarifai, getRealNutritionData, calculateGlycemicImpact } from '../../utils/utils';

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

    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
      analyzeImage(result.assets[0].uri);
    }
  };

  const analyzeImage = async (uri: string) => {
    setIsAnalyzing(true);
    try {
      const foodName = await recognizeFoodWithClarifai(uri);
      console.log("Alimento identificado:", foodName);

      if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
        Alert.alert('Erro', 'Por favor, insira uma quantidade válida maior que zero.');
        setIsAnalyzing(false);
        return;
      }

      const nutrition = await getRealNutritionData(foodName, quantity);
      console.log("Dados nutricionais processados:", nutrition);

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
      <TouchableOpacity style={styles.button} onPress={pickImage} disabled={isAnalyzing}>
        <Text style={styles.buttonText}>
          {isAnalyzing ? 'Analisando...' : 'Selecionar Alimento'}
        </Text>
      </TouchableOpacity>

      {isAnalyzing && <ActivityIndicator size="large" color="#0000ff" style={styles.spinner} />}

      {imageUri && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
          <Text style={styles.label}>Quantidade (g):</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
          />
        </View>
      )}

      {nutritionalData && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Informações Nutricionais</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>Nome: {nutritionalData.name}</Text>
            <Text style={styles.infoText}>Porção: {nutritionalData.portion}</Text>
            <Text style={styles.infoText}>Calorias: {nutritionalData.calories} kcal</Text>
            <Text style={styles.infoText}>Carboidratos: {nutritionalData.carbs} g</Text>
            <Text style={styles.infoText}>Índice Glicêmico: {nutritionalData.glycemicIndex}</Text>
            <Text style={styles.glycemicImpact}>
              {nutritionalData.glycemicLoad} ({nutritionalData.classification})
            </Text>
          </View>
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
    backgroundColor: '#f4f4f9',
  },
  button: {
    backgroundColor: '#1E90FF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    width: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  spinner: {
    margin: 20,
  },
  imageContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    width: 200,
    textAlign: 'center',
    borderRadius: 5,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  infoContainer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    width: 300,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  infoBox: {
    paddingVertical: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  glycemicImpact: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6347',
    marginTop: 10,
  },
});
