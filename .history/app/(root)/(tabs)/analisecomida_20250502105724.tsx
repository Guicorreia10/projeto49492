import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { recognizeFoodWithClarifai, getRealNutritionData, calculateGlycemicImpact } from '../../utils/utils';

const AnaliseComida: React.FC = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [nutritionalData, setNutritionalData] = useState<any | null>(null);
  const [quantity, setQuantity] = useState('100'); 

  // Função para selecionar a imagem
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

  // Função para analisar a imagem
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
      
      // Atualiza o estado com os dados nutricionais e o impacto glicêmico
      setNutritionalData({ ...nutrition, glycemicImpact });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível analisar a imagem. Tente novamente.');
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={pickImage} disabled={isAnalyzing}>
        <Text style={styles.buttonText}>
          {isAnalyzing ? 'A analisar...' : 'Selecionar Alimento proveniente da Galeria'}
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
          <Text style={styles.infoText}>Nome: {nutritionalData.name}</Text>
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
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  button: { backgroundColor: 'blue', padding: 15, borderRadius: 8, marginTop: 20 },
  buttonText: { color: 'white', fontSize: 18, textAlign: 'center' },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
  input: { borderWidth: 1, padding: 10, width: 200, textAlign: 'center', borderRadius: 5 },
  info: { padding: 20, backgroundColor: '#eee', borderRadius: 10, marginTop: 20, width: 250 },
  infoText: { fontSize: 16, marginBottom: 5 },
});
