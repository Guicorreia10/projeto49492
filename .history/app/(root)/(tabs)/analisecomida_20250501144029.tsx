import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from "react-native";
import { Camera } from "expo-camera";
import * as FileSystem from "expo-file-system";

export default function AnaliseComida() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string>("");
  const cameraRef = useRef<any>(null); // Ref corrigida.

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const captureImage = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        setCapturedImage(photo.uri);
        analyzeFood(photo.uri);
      } catch (error) {
        console.error("Erro ao capturar foto:", error);
        Alert.alert("Erro", "Não foi possível capturar a foto.");
      }
    }
  };

  const analyzeFood = async (imageUri: string) => {
    try {
      const response = await fetch("https://your-api-endpoint.com/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: await FileSystem.readAsStringAsync(imageUri, { encoding: "base64" }),
        }),
      });

      const data = await response.json();
      if (data && data.predictions) {
        const foodName = data.predictions[0].name;
        const glucoseImpact = estimateGlucoseImpact(foodName);
        setAnalysisResult(`Alimento: ${foodName}\nImpacto nos níveis de glicose: ${glucoseImpact}`);
      } else {
        setAnalysisResult("Não foi possível analisar a refeição.");
      }
    } catch (error) {
      console.error("Erro ao analisar a imagem:", error);
      Alert.alert("Erro", "Não foi possível analisar a refeição.");
    }
  };

  const estimateGlucoseImpact = (foodName: string): string => {
    if (foodName.toLowerCase().includes("arroz")) return "Alto impacto (carboidratos rápidos)";
    if (foodName.toLowerCase().includes("fruta")) return "Impacto moderado (frutose)";
    if (foodName.toLowerCase().includes("vegetal")) return "Baixo impacto (fibras)";
    return "Desconhecido";
  };

  if (hasPermission === null) {
    return <Text>Verificando permissões...</Text>;
  }

  if (hasPermission === false) {
    return <Text>Permissão para acessar a câmera negada.</Text>;
  }

  return (
    <View style={styles.container}>
      {!capturedImage ? (
        <Camera
          style={styles.camera}
          ref={cameraRef}
          type={Camera.Constants.Type.back} // Configuração corrigida da câmera traseira.
        >
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={captureImage}>
              <Text style={styles.text}>Capturar</Text>
            </TouchableOpacity>
          </View>
        </Camera>
      ) : (
        <View style={styles.resultContainer}>
          <Image source={{ uri: capturedImage }} style={styles.image} />
          <Text style={styles.resultText}>{analysisResult}</Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#007AFF" }]}
            onPress={() => setCapturedImage(null)}
          >
            <Text style={styles.text}>Nova Captura</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  camera: { flex: 1, width: "100%" },
  buttonContainer: { flex: 1, justifyContent: "flex-end", alignItems: "center", marginBottom: 20 },
  button: { backgroundColor: "#4A90E2", padding: 15, borderRadius: 10, alignItems: "center" },
  text: { color: "#fff", fontSize: 16 },
  resultContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  image: { width: 300, height: 300, borderRadius: 10, marginBottom: 20 },
  resultText: { fontSize: 18, textAlign: "center", color: "#333", marginBottom: 20 },
});
