import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { getFoodNutrition, calculateGlycemicImpact } from '../../utils/utils';

const AnaliseComida: React.FC = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [nutritionalData, setNutritionalData] = useState<any | null>(null);
  const cameraRef = useRef<any>(null);

  // Simulação: ao clicar, faz análise sem foto real
  const handleCapture = async () => {
    setIsScanning(true);
    try {
      // Simule uma imagem qualquer, pois CameraView ainda não tira foto real
      const fakeImageUri = 'simulated-image-uri';
      const nutrition = await getFoodNutrition(fakeImageUri);
      const glycemicImpact = calculateGlycemicImpact(nutrition);
      setNutritionalData({ ...nutrition, ...glycemicImpact });
    } catch (error) {
      Alert.alert('Erro', 'Erro ao analisar alimento.');
    } finally {
      setIsScanning(false);
    }
  };

  if (!permission) {
    return <Text>Solicitando permissão para acessar a câmera...</Text>;
  }
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text>Permissão para acessar a câmera foi negada.</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Permitir acesso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
      />
      <TouchableOpacity style={styles.button} onPress={handleCapture} disabled={isScanning}>
        <Text style={styles.buttonText}>
          {isScanning ? 'Analisando...' : 'Capturar Alimento'}
        </Text>
      </TouchableOpacity>
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
  container: { flex: 1 },
  camera: { flex: 1 },
  button: { backgroundColor: 'blue', padding: 15, margin: 20, borderRadius: 8 },
  buttonText: { color: 'white', fontSize: 18, textAlign: 'center' },
  info: { padding: 20, backgroundColor: '#eee' },
});
