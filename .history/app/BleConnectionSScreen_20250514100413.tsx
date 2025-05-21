import React, { useState, useEffect } from 'react';
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
import { supabase } from '../lib/supabase';

const manager = new BleManager();
// Substitui estes UUIDs pelos do teu smartwatch
const SERVICE_UUID = '0000180f-0000-1000-8000-00805f9b34fb';
const CHAR_UUID_STEPS = '00002a19-0000-1000-8000-00805f9b34fb';
const CHAR_UUID_SLEEP = '00002a1c-0000-1000-8000-00805f9b34fb';
const CHAR_UUID_EXERCISE = '00002a5b-0000-1000-8000-00805f9b34fb';

export default function BLEConnectionsScreen() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      await requestPermissions();
      startScan();
    })();
    return () => {
      manager.stopDeviceScan();
      manager.destroy();
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
        Alert.alert('Permissões', 'É necessário conceder permissões de Bluetooth e localização.');
      }
    }
  };

  const startScan = () => {
    setDevices([]);
    setIsScanning(true);
    manager.startDeviceScan(null, { allowDuplicates: false }, (error: BleError | null, device: Device | null) => {
      if (error) {
        Alert.alert('Erro BLE', error.message);
        setIsScanning(false);
        return;
      }
      if (device && device.id) {
        setDevices(prev => prev.find(d => d.id === device.id) ? prev : [...prev, device]);
      }
    });
    setTimeout(() => {
      manager.stopDeviceScan();
      setIsScanning(false);
    }, 10000);
  };

  const handleConnectAndFetch = async (device: Device) => {
    try {
      // Conectar
      const connected = await manager.connectToDevice(device.id);
      await connected.discoverAllServicesAndCharacteristics();
      Alert.alert('Conectado', `Dispositivo: ${device.name || device.id}`);

      // Ler características
      const readValue = async (charUUID: string) => {
        const char = await connected.readCharacteristicForService(SERVICE_UUID, charUUID);
        // valor em base64
        const base64 = char.value || '';
        return Buffer.from(base64, 'base64').readUIntLE(0, 4); // ajusta conforme formato
      };

      const passos = await readValue(CHAR_UUID_STEPS);
      const sono = await readValue(CHAR_UUID_SLEEP);
      const exercicio = await readValue(CHAR_UUID_EXERCISE);

      // Guardar no Supabase
      const userId = (await supabase.auth.getUser()).data?.user?.id;
      if (!userId) throw new Error('Usuário não autenticado');

      const inserts = [
        { user_id: userId, tipo: 'passos', valor: passos, unidade: 'unidades' },
        { user_id: userId, tipo: 'sono', valor: sono, unidade: 'minutos' },
        { user_id: userId, tipo: 'exercicio', valor: exercicio, unidade: 'minutos' },
      ];
      const { error } = await supabase.from('dados_smartwatch').insert(inserts);
      if (error) throw error;
      Alert.alert('Dados guardados', `Passos: ${passos}, Sono: ${sono}, Exercício: ${exercicio}`);

    } catch (err: any) {
      console.warn('BLE error', err);
      Alert.alert('Erro', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Dispositivos Bluetooth</Text>
      <Text style={styles.status}>{isScanning ? 'A fazer scan...' : 'Scan concluído'}</Text>
      <FlatList
        data={devices}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => handleConnectAndFetch(item)}>
            <Text style={styles.itemText}>{item.name || 'Sem nome'}</Text>
            <Text style={styles.itemId}>{item.id}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => <Text style={styles.empty}>Nenhum dispositivo encontrado</Text>}
      />
      <TouchableOpacity style={styles.scanButton} onPress={startScan} disabled={isScanning}>
        <Text style={styles.scanText}>{isScanning ? 'A escanear...' : 'Scan'}</Text>
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
