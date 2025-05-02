import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { recognizeFoodWithClarifai, getRealNutritionData, calculateGlycemicImpact } from '../../utils/utils';

const AnaliseComida: React.FC = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [nutritionalData, setNutritionalData] = useState<any | null>(null);
  const [quantity, setQuantity] = useState('100'); // Quantidade padrão de 100g

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
      
      if (!quantity || isNaN(Number(quantity))) {
        Alert.alert('Erro', 'Por favor, insira uma quantidade válida.');
        setIsAnalyzing(false);
        return;
      }

      const nutrition = await getRealNutritionData(foodName, quantity); // Agora enviamos a quantidade escolhida
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
          {isAnalyzing ? 'Analisando...' : 'Selecionar Alimento da Galeria'}
        </Text>
      </TouchableOpacity>

      {isAnalyzing && <ActivityIndicator size="large" color="#0000ff" style={{ margin: 20 }} />}
      
      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={{ width: 200, height: 200, margin: 20, borderRadius: 10 }}
        />
      )}

      {imageUri && (
        <>
          <Text style={styles.label}>Quantidade (g):</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 150"
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
          />
        </>
      )}

      {nutritionalData && (
        <View style={styles.info}>
          <Text>Nome: {nutritionalData.name}</Text>
          <Text>Porção: {nutritionalData.portion}</Text>
          <Text>Calorias: {nutritionalData.calories} kcal</Text>
          <Text>Carboidratos: {nutritionalData.carbs} g</Text>
          <Text>Índice Glicêmico: {nutritionalData.glycemicIndex}</Text>
          <Text>{nutritionalData.description}</Text>
        </View>
      )}
    </View>
  );
};

export default AnaliseComida;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  button: { backgroundColor: 'blue', padding: 15, borderRadius: 8, marginTop: 20 },
  buttonText: { color: 'white', fontSize: 18, textAlign: 'center' },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
  input: { borderWidth: 1, padding: 10, width: 200, textAlign: 'center', borderRadius: 5 },
  info: { padding: 20, backgroundColor: '#eee', borderRadius: 10, marginTop: 20, width: 250 },
});
