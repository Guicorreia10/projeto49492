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
  const [images, setImages] = useState<string[]>([]);  // Array para armazenar múltiplas imagens
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [nutritionalData, setNutritionalData] = useState<any | null>(null);
  const [quantity, setQuantity] = useState('100');
  const [mealData, setMealData] = useState<any[]>([]);  // Array para armazenar os alimentos da refeição

  const pickImage = async () => {
    setNutritionalData(null);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setImages((prevImages) => [...prevImages, uri]);  // Adiciona a nova imagem ao array
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
      const foodData = { ...nutrition, glycemicImpact, name: foodName, quantity: Number(quantity) };

      setMealData((prevMealData) => [...prevMealData, foodData]);  // Adiciona o alimento à refeição
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao analisar a imagem. Tente novamente.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculateTotal = () => {
    let totalCalories = 0;
    let totalCarbs = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalFiber = 0;
    let totalGlycemicImpact = 0;
    let totalGlycose = 0;

    mealData.forEach(item => {
      totalCalories += item.calories;
      totalCarbs += item.carbs;
      totalProtein += item.protein;  // Somando proteínas
      totalFat += item.fat;  // Somando gordura
      totalFiber += item.fiber;  // Somando fibra
      totalGlycemicImpact += item.glycemicImpact.value;  // Exemplo de como somar o impacto glicêmico
      totalGlycose += item.glycose;  // Somando glicose
    });

    return { totalCalories, totalCarbs, totalProtein, totalFat, totalFiber, totalGlycemicImpact, totalGlycose };
  };

  const clearMeal = () => {
    setMealData([]);  // Limpa os dados da refeição
    setImages([]);  // Limpa as imagens
    setQuantity('100');  // Reseta a quantidade para o valor padrão
  };

  const { totalCalories, totalCarbs, totalProtein, totalFat, totalFiber, totalGlycemicImpact, totalGlycose } = calculateTotal();

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

        {isAnalyzing && <ActivityIndicator size="large" color="#3b82f6" style={styles.loading} />}

        {/* Exibir todas as imagens selecionadas */}
        <View style={styles.imagesContainer}>
          {images.map((uri, index) => (
            <Image key={index} source={{ uri }} style={styles.image} />
          ))}
        </View>

        {images.length > 0 && (
          <>
            <Text style={styles.label}>Quantidade (g):</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Ex: 150"
              value={quantity}
              onChangeText={setQuantity}
            />
            <TouchableOpacity
              style={styles.button}
              onPress={() => analyzeImage(images[images.length - 1])}  // Chama a função para analisar a última imagem
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
            {mealData.map((food, index) => (
              <View key={index} style={styles.result}>
                <Text style={styles.info}>🍽️ Alimento: {food.name}</Text>
                <Text style={styles.info}>⚖️ Quantidade: {food.quantity} g</Text>
                <Text style={styles.info}>🔥 Calorias: {food.calories.toFixed(1)} kcal</Text>
                <Text style={styles.info}>🍞 Carboidratos: {food.carbs.toFixed(1)} g</Text>
                <Text style={styles.info}>🍗 Proteínas: {food.protein.toFixed(1)} g</Text>  {/* Adicionando Proteínas */}
                <Text style={styles.info}>🧈 Gordura: {food.fat.toFixed(1)} g</Text>  {/* Adicionando Gordura */}
                <Text style={styles.info}>🍃 Fibra: {food.fiber.toFixed(1)} g</Text>  {/* Adicionando Fibra */}
                <Text style={styles.info}>🩸 Glicose: {food.glycose.toFixed(1)} g</Text>  {/* Adicionando Glicose */}
                <Text style={styles.info}>📊 Índice Glicêmico: {food.glycemicIndex}</Text>
                <Text style={styles.info}>💡 {food.glycemicImpact.description}</Text>
              </View>
            ))}

            <View style={styles.result}>
              <Text style={styles.info}>🔥 Total Calorias: {totalCalories.toFixed(1)} kcal</Text>
              <Text style={styles.info}>🍞 Total Carboidratos: {totalCarbs.toFixed(1)} g</Text>
              <Text style={styles.info}>🍗 Total Proteínas: {totalProtein.toFixed(1)} g</Text>
              <Text style={styles.info}>🧈 Total Gordura: {totalFat.toFixed(1)} g</Text>
              <Text style={styles.info}>🍃 Total Fibra: {totalFiber.toFixed(1)} g</Text>
              <Text style={styles.info}>🩸 Total Glicose: {totalGlycose.toFixed(1)} g</Text>  {/* Total de Glicose */}
              <Text style={styles.info}>📊 Total Impacto Glicêmico: {totalGlycemicImpact.toFixed(1)}</Text>
            </View>
          </View>
        )}

        {/* Botão para limpar a refeição */}
        {mealData.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={clearMeal}>
            <Text style={styles.buttonText}>Limpar Refeição</Text>
          </TouchableOpacity>
        )}

        {/* Padding extra para garantir que o conteúdo não seja cortado pela barra de navegação */}
        <View style={styles.bottomPadding} />
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
    paddingBottom: 100,  // Aumenta o padding no final para dar espaço para o botão de limpar
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
  clearButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  loading: {
    marginTop: 20,
  },
  image: {
    width: 220,
    height: 220,
    borderRadius: 12,
    marginVertical: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    backgroundColor: '#f5f5f5',
  },
  imagesContainer: {
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'center', 
    marginVertical: 20,
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
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  result: {
    marginBottom: 15,
  },
  info: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  bottomPadding: {
    height: 50,
  },
});
