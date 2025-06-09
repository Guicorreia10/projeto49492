import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
// Ajusta este caminho se a tua pasta ble estiver noutro lugar



const ManualInputScreen: React.FC = () => {
  const router = useRouter();


 
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecione o tipo de dados a inserir:</Text>

      <TouchableOpacity
        onPress={() => router.push('/manual-input/glicose-input')}
        style={[styles.button, { backgroundColor: '#007AFF' }]}
      >
        <Text style={styles.buttonText}>Níveis de Glicose</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/manual-input/sono-input')}
        style={[styles.button, { backgroundColor: '#4CAF50' }]}
      >
        <Text style={styles.buttonText}>Dados do Sono</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/manual-input/insulina')}
        style={[styles.button, { backgroundColor: '#FFB6C1' }]}
      >
        <Text style={styles.buttonText}>Medicação</Text>
      </TouchableOpacity>

     
    </View>
  );
};

export default ManualInputScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bleStatus: {
    marginTop: 12,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
});
