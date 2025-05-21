import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { BleManager, Device, BleError } from 'react-native-ble-plx';
import { useRouter } from 'expo-router';

const manager = new BleManager();

export default function BLEConnectionsScreen() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const router = useRouter();

  useEffect(() => {
    startScan();
    return () => {
      manager.stopDeviceScan();
      manager.destroy();
    };
  }, []);

  const startScan = () => {
    setDevices([]);
    setIsScanning(true);
    manager.startDeviceScan(null, { allowDuplicates: false }, (error: BleError | null, device: Device | null) => {
      if (error) {
        console.warn('BLE Scan error:', error);
        Alert.alert('Erro BLE', error.message);
        setIsScanning(false);
        return;
      }
      if (device && device.id) {
        setDevices(prev => {
          if (prev.find(d => d.id === device.id)) return prev;
          return [...prev, device];
        });
      }
    });
    // Stop scan after 10s
    setTimeout(() => {
      manager.stopDeviceScan();
      setIsScanning(false);
    }, 10000);
  };

  const handleConnect = async (device: Device) => {
    try {
      const connected = await manager.connectToDevice(device.id);
      await connected.discoverAllServicesAndCharacteristics();
      Alert.alert('Conectado', `Dispositivo: ${device.name || device.id}`);
      // Aqui podes ler características, ex:
      // const data = await readChar(connected, SERVICE_UUID, CHAR_UUID);
      // Alert.alert('Leitura', data.toString());
    } catch (err: any) {
      console.warn('Connection error', err);
      Alert.alert('Erro Conexão', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Dispositivos Bluetooth</Text>
      {isScanning ? <Text style={styles.status}>A escanear...</Text> : <Text style={styles.status}>Scan concluído</Text>}
      <FlatList
        data={devices}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => handleConnect(item)}>
            <Text style={styles.itemText}>{item.name || 'Sem nome'}</Text>
            <Text style={styles.itemId}>{item.id}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => <Text style={styles.empty}>Nenhum dispositivo encontrado</Text>}
      />
      <TouchableOpacity style={styles.scanButton} onPress={startScan} disabled={isScanning}>
        <Text style={styles.scanText}>{isScanning ? 'A escanear...' : 'Re-scan'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>⬅️ Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F0F8FF' },
  header: { fontSize: 22, fontWeight: '700', marginBottom: 10, color: '#08457E' },
  status: { marginBottom: 10, color: '#555' },
  item: { padding: 12, backgroundColor: '#fff', borderRadius: 8, marginBottom: 10, elevation: 2 },
  itemText: { fontSize: 16, fontWeight: '600', color: '#08457E' },
  itemId: { fontSize: 12, color: '#888' },
  empty: { textAlign: 'center', marginTop: 20, color: '#888' },
  scanButton: { padding: 15, backgroundColor: '#007AFF', borderRadius: 10, alignItems: 'center', marginTop: 10 },
  scanText: { color: '#fff', fontWeight: 'bold' },
  backButton: { marginTop: 20, alignItems: 'center' },
  backText: { color: '#007AFF', fontSize: 16 },
});
