import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { getFoodNutrition, calculateGlycemicImpact } from '../../utils/utils';

const AnaliseComida: React.FC = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [nutritionalData, setNutritionalData] = useState<any | null>(null);
  const cameraRef = useRef<any>(null);

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    setIsScanning(true);
    try {
      const photo = await cameraRef.current.takePictureAsync();
      const nutrition = await getFoodNutrition(photo.uri);
      const glycemicImpact = calculateGlycemicImpact(nutrition);
      setNutritionalData({ ...nutrition, glycemicImpact });
    } catch (error) {
      console.error('Erro ao capturar imagem:', error);
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
        facing="back" // <- Aqui está a correção!
      />
      <TouchableOpacity style={styles.button} onPress={handleCapture}>
        <Text style={styles.buttonText}>
          {isScanning ? 'Analisando...' : 'Capturar Alimento'}
        </Text>
      </TouchableOpacity>
      {nutritionalData && (
        <View style={styles.info}>
          <Text>Nome: {nutritionalData.name}</Text>
          <Text>Calorias: {nutritionalData.calories}</Text>
          <Text>Impacto na Glicose: {nutritionalData.glycemicImpact}</Text>
        </View>
      )}
    </View>
  );
};

export default AnaliseComida;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  camera: { flex: 1, width: '100%' },
  button: { backgroundColor: 'blue', padding: 15, marginBottom: 20 },
  buttonText: { color: 'white', fontSize: 18 },
  info: { padding: 10 },
});
