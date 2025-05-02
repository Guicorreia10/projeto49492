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
      console.log("Dados nutricionais recebidos:", nutrition);

      if (nutrition) {
        const glycemicImpact = calculateGlycemicImpact(nutrition);
        setNutritionalData({ ...nutrition, ...glycemicImpact });
      } else {
        throw new Error('Erro ao processar os dados nutricionais.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível analisar a imagem ou os dados nutricionais.');
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

      {isAnalyzing && <ActivityIndicator size="large" color="#0000ff" style={{ margin: 20 }} />}

      {imageUri && (
        <>
          <Image source={{ uri: imageUri }} style={styles.image} />
          <Text style={styles.label}>Quantidade (g):</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
          />
        </>
      )}

      {nutritionalData && (
        <View style={styles.info}>
          <Text style={styles.infoText}>Nome: {nutritionalData.name}</Text>
          <Text style={styles.infoText}>Porção: {nutritionalData.portion}</Text>
          <Text style={styles.infoText}>Calorias: {nutritionalData.calories} kcal</Text>
          <Text style={styles.infoText}>Carboidratos: {nutritionalData.carbs} g</Text>
          <Text style={styles.infoText}>Proteínas: {nutritionalData.protein} g</Text>
          <Text style={styles.infoText}>Gordura: {nutritionalData.fat} g</Text>
          <Text style={styles.infoText}>Fibra: {nutritionalData.fiber} g</Text>
          <Text style={styles.infoText}>Índice Glicêmico: {nutritionalData.glycemicIndex}</Text>
          <Text style={styles.infoText}>Classificação: {nutritionalData.classification}</Text>
          <Text style={styles.infoText}>{nutritionalData.description}</Text>
        </View>
      )}
    </View>
  );
};

export default AnaliseComida;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  button: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 8, marginTop: 20 },
  buttonText: { color: 'white', fontSize: 18, textAlign: 'center' },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
  input: { borderWidth: 1, padding: 10, width: 200, textAlign: 'center', borderRadius: 5, marginBottom: 20 },
  info: { padding: 20, backgroundColor: '#f8f8f8', borderRadius: 10, marginTop: 20, width: 250 },
  infoText: { fontSize: 16, color: '#333', marginVertical: 5 },
  image: { width: 200, height: 200, borderRadius: 10, marginBottom: 20 },
});
