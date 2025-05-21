import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { BleManager, Device, BleError } from 'react-native-ble-plx';
import { useRouter } from 'expo-router';

export default function BLEConnectionsScreen() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const scanTimeout = useRef<NodeJS.Timeout | null>(null);
  const managerRef = useRef(new BleManager());
  const router = useRouter();

  useEffect(() => {
    (async () => {
      await requestPermissions();
      startScan();
    })();
    return () => {
      stopScan();
      managerRef.current.destroy();
    };
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);
      const ok = Object.values(granted).every(v => v === PermissionsAndroid.RESULTS.GRANTED);
      if (!ok) {
        Alert.alert('Permissões', 'É necessário conceder permissões de localização e Bluetooth.');
      }
    }
  };

  const startScan = () => {
    if (isScanning) return;
    setDevices([]);
    setIsScanning(true);
    console.log('🔍 Iniciar scan BLE...');
    managerRef.current.startDeviceScan(null, { allowDuplicates: false }, onDeviceDiscovered);
    if (scanTimeout.current) clearTimeout(scanTimeout.current);
    scanTimeout.current = setTimeout(stopScan, 10000);
  };

  const stopScan = () => {
    console.log('🛑 Parar scan BLE');
    managerRef.current.stopDeviceScan();
    setIsScanning(false);
    if (scanTimeout.current) {
      clearTimeout(scanTimeout.current);
      scanTimeout.current = null;
    }
  };

  const onDeviceDiscovered = (error: BleError | null, device: Device | null) => {
    if (error) {
      Alert.alert('Erro BLE', error.message);
      stopScan();
      return;
    }
    if (device && device.id) {
      console.log('📡 Encontrado:', device.name || 'Sem nome', device.id);
      setDevices(prev => (prev.some(d => d.id === device.id) ? prev : [...prev, device]));
    }
  };

  const handleConnectAndFetch = async (device: Device) => {
  stopScan();
  try {
    const connected = await managerRef.current.connectToDevice(device.id);
    await connected.discoverAllServicesAndCharacteristics();
    console.log('🔗 Ligado ao dispositivo');

    // MONITOR PASSOS
    await connected.monitorCharacteristicForService(
      '0000180f-0000-1000-8000-00805f9b34fb',
      '00002a19-0000-1000-8000-00805f9b34fb',
      (error, char) => {
        if (error) {
          console.warn('Erro monitor:', error.message);
          return;
        }
        const buf = Buffer.from(char?.value || '', 'base64');
        const val = buf.readUIntLE(0, Math.min(4, buf.length));
        console.log('📶 Passos recebidos via monitor:', val);
        Alert.alert('Passos monitorizados', `${val} passos`);
      }
    );

    // LEITURA COMANDO OPCIONAL
    const tryRead = async (service: string, char: string, nome: string) => {
      try {
        const c = await connected.readCharacteristicForService(service, char);
        const buf = Buffer.from(c.value || '', 'base64');
        const val = buf.readUIntLE(0, Math.min(4, buf.length));
        console.log(`📖 ${nome}: ${val}`);
        return val;
      } catch (e: any) {
        console.warn(`Erro ao ler ${nome}:`, e.message);
        return 0;
      }
    };

    await tryRead('000055ff-0000-1000-8000-00805f9b34fb', '000033f1-0000-1000-8000-00805f9b34fb', 'Comando A');
    await tryRead('000055ff-0000-1000-8000-00805f9b34fb', '0000b003-0000-1000-8000-00805f9b34fb', 'Comando B');

    Alert.alert('Ligado com sucesso', 'A monitorizar passos. Vê os logs!');
  } catch (err: any) {
    console.error('Erro:', err);
    Alert.alert('Erro', err.message || 'Erro ao ligar ao dispositivo.');
  }
};


  return (
    <View style={styles.container}>
      <Text style={styles.header}>Dispositivos Bluetooth</Text>
      <Text style={styles.status}>{isScanning ? '🔄 A procurar dispositivos...' : '⏹ Scan parado'}</Text>

      <FlatList
        data={devices}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => handleConnectAndFetch(item)}>
            <Text style={styles.itemText}>{item.name || 'Sem nome'}</Text>
            <Text style={styles.itemId}>{item.id}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum dispositivo encontrado</Text>}
      />

      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={[styles.scanButton, isScanning && styles.disabled]}
          onPress={startScan}
          disabled={isScanning}
        >
          <Text style={styles.scanText}>🔍 Iniciar Scan</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.stopButton, !isScanning && styles.disabled]}
          onPress={stopScan}
          disabled={!isScanning}
        >
          <Text style={styles.scanText}>🛑 Parar Scan</Text>
        </TouchableOpacity>
      </View>

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
  item: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  itemText: { fontSize: 16, fontWeight: '600', color: '#08457E' },
  itemId: { fontSize: 12, color: '#888' },
  empty: { textAlign: 'center', marginTop: 20, color: '#888' },
  buttonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  scanButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 5,
  },
  stopButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: 5,
  },
  disabled: { opacity: 0.6 },
  scanText: { color: '#fff', fontWeight: 'bold' },
  backButton: { marginTop: 20, alignItems: 'center' },
  backText: { color: '#007AFF', fontSize: 16 },
});
