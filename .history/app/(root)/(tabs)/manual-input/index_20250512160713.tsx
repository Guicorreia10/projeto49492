import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
// Ajusta este caminho se a tua pasta ble estiver noutro lugar
import { scanForWatch } from '../../../ble/scan';
import { connectToWatch } from '../../../ble/connect';
import type { Device } from 'react-native-ble-plx';

const ManualInputScreen: React.FC = () => {
  const router = useRouter();

  // Estado para mostrar status do BLE
  const [bleStatus, setBleStatus] = useState<string>('BLE parado');

  const handleBLEScan = () => {
    setBleStatus('Procurando smartwatch…');
    scanForWatch(async (device: Device) => {
      setBleStatus(`Conectando a ${device.name || device.id}…`);
      try {
        const connected = await connectToWatch(device);
        setBleStatus(`Conectado a ${device.name || device.id}`);
        // Aqui poderias iniciar monitorChar() para ler dados em tempo real
      } catch (err) {
        console.warn(err);
        setBleStatus('Erro na conexão BLE');
      }
    });
  };

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

      {/* Botão e status do BLE */}
      <TouchableOpacity
        onPress={handleBLEScan}
        style={[styles.button, { backgroundColor: '#8844EE', marginTop: 20 }]}
      >
        <Text style={styles.buttonText}>Scan Bluetooth</Text>
      </TouchableOpacity>
      <Text style={styles.bleStatus}>{bleStatus}</Text>
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
