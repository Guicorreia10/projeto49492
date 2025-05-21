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
import { supabase } from '../lib/supabase';
import { Buffer } from 'buffer';

const SERVICE_UUID = '0000180f-0000-1000-8000-00805f9b34fb';
const CHAR_UUID_STEPS = '00002a19-0000-1000-8000-00805f9b34fb';
const CHAR_UUID_SLEEP = '00002a1c-0000-1000-8000-00805f9b34fb';
const CHAR_UUID_EXERCISE = '00002a5b-0000-1000-8000-00805f9b34fb';

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
    managerRef.current.startDeviceScan(null, { allowDuplicates: false }, onDeviceDiscovered);
    // Cancelar scan automático se já existir
    if (scanTimeout.current) clearTimeout(scanTimeout.current);
    scanTimeout.current = setTimeout(() => stopScan(), 10000);
  };

  const onDeviceDiscovered = (error: BleError | null, device: Device | null) => {
    if (error) {
      Alert.alert('Erro BLE', error.message);
      stopScan();
      return;
    }
    if (device && device.id) {
      setDevices(prev => (prev.some(d => d.id === device.id) ? prev : [...prev, device]));
    }
  };

  const stopScan = () => {
    managerRef.current.stopDeviceScan();
    setIsScanning(false);
    if (scanTimeout.current) {
      clearTimeout(scanTimeout.current);
      scanTimeout.current = null;
    }
  };

  const handleConnectAndFetch = async (device: Device) => {
    stopScan();
    try {
      const connected = await managerRef.current.connectToDevice(device.id);
      await connected.discoverAllServicesAndCharacteristics();
      const readValue = async (charUUID: string) => {
        const char = await connected.readCharacteristicForService(SERVICE_UUID, charUUID);
        const buf = Buffer.from(char.value || '', 'base64');
        // Se não houver dados, retorna 0
        if (buf.length === 0) return 0;
        // Lê até 4 bytes (ou menos, se o buffer for menor)
        const readLen = Math.min(buf.length, 4);
        try {
          return buf.readUIntLE(0, readLen);
        } catch (e) {
          console.warn('Erro a interpretar buffer:', e);
          // Em caso de falha, retorna 0 ou valor bruto
          return 0;
        }
      };
      const passos = await readValue(CHAR_UUID_STEPS);
      const sono = await readValue(CHAR_UUID_SLEEP);
      const exercicio = await readValue(CHAR_UUID_EXERCISE);
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id;
      if (!userId) throw new Error('Utilizador não autenticado');
      await supabase.from('dados_smartwatch').insert([
        { user_id: userId, tipo: 'passos', valor: passos, unidade: 'unidades' },
        { user_id: userId, tipo: 'sono', valor: sono, unidade: 'minutos' },
        { user_id: userId, tipo: 'exercicio', valor: exercicio, unidade: 'minutos' },
      ]);
      Alert.alert('Dados guardados', `Passos: ${passos}, Sono: ${sono}, Exercício: ${exercicio}`);
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Dispositivos Bluetooth</Text>
      <Text style={styles.status}>{isScanning ? 'A escanear...' : 'Scan parado'}</Text>
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
      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={[styles.scanButton, isScanning && styles.disabled]}
          onPress={startScan}
          disabled={isScanning}
        >
          <Text style={styles.scanText}>Iniciar Scan</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.stopButton, !isScanning && styles.disabled]}
          onPress={stopScan}
          disabled={!isScanning}
        >
          <Text style={styles.scanText}>Parar Scan</Text>
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
  item: { padding: 12, backgroundColor: '#fff', borderRadius: 8, marginBottom: 10, elevation: 2 },
  itemText: { fontSize: 16, fontWeight: '600', color: '#08457E' },
  itemId: { fontSize: 12, color: '#888' },
  empty: { textAlign: 'center', marginTop: 20, color: '#888' },
  buttonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  scanButton: { flex: 1, padding: 12, backgroundColor: '#007AFF', borderRadius: 10, alignItems: 'center', marginRight: 5 },
  stopButton: { flex: 1, padding: 12, backgroundColor: '#FF3B30', borderRadius: 10, alignItems: 'center', marginLeft: 5 },
  disabled: { opacity: 0.6 },
  scanText: { color: '#fff', fontWeight: 'bold' },
  backButton: { marginTop: 20, alignItems: 'center' },
  backText: { color: '#007AFF', fontSize: 16 },
});
