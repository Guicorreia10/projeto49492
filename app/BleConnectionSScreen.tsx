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
global.Buffer = Buffer;

const SERVICE_HAYLOU = '0000d0ff-3c17-d293-8e48-14fe2e4da212';
const CHAR_PASSOS = '0000ffd2-0000-1000-8000-00805f9b34fb';
const CHAR_SONO = '0000ffd3-0000-1000-8000-00805f9b34fb';
const CHAR_EXERCICIO = '0000ffd4-0000-1000-8000-00805f9b34fb';

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default function BLEConnectionsScreen() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [passos, setPassos] = useState<number | null>(null);
  const [sono, setSono] = useState<number | null>(null);
  const [exercicio, setExercicio] = useState<number | null>(null);
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
      return ok;
    }
    return true;
  };

  const startScan = () => {
    if (isScanning) return;
    setDevices([]);
    setPassos(null);
    setSono(null);
    setExercicio(null);
    setIsScanning(true);
    managerRef.current.startDeviceScan(null, { allowDuplicates: false }, onDeviceDiscovered);
    if (scanTimeout.current) clearTimeout(scanTimeout.current);
    scanTimeout.current = setTimeout(stopScan, 10000);
  };

  const stopScan = () => {
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

  // Adiciona apenas dispositivos com nome visível e únicos
  if (device?.name && device.id) {
    setDevices(prevDevices => {
      const exists = prevDevices.some(d => d.id === device.id);
      return exists ? prevDevices : [...prevDevices, device];
    });
  }
};



  const handleConnectAndFetch = async (device: Device) => {
    if (isProcessing) return;
    setIsProcessing(true);
    stopScan();
    try {
      console.log("🔗 A ligar ao dispositivo:", device.name || device.id);
      let connected: Device;
      if (await device.isConnected()) {
        connected = device;
      } else {
        connected = await managerRef.current.connectToDevice(device.id);
        await connected.discoverAllServicesAndCharacteristics();
      }

      await delay(3000); // atraso de 3 segundos para garantir atualização de dados no smartwatch

      const readBuffer = async (charUUID: string): Promise<Buffer> => {
        const res = await connected.readCharacteristicForService(SERVICE_HAYLOU, charUUID);
        const buf = Buffer.from(res.value || '', 'base64');
        return buf;
      };

      const passosBuf = await readBuffer(CHAR_PASSOS);
      const sonoBuf = await readBuffer(CHAR_SONO);
      const exercicioBuf = await readBuffer(CHAR_EXERCICIO);

      const passosVal = passosBuf.length >= 3 ? passosBuf[2] & 0x1F : 0;
      const sonoVal = sonoBuf.length >= 1 ? sonoBuf[0] & 0x1F : 0;
      const exercicioVal = exercicioBuf.length >= 1 ? exercicioBuf[0] & 0x1F : 0;

      setPassos(passosVal);
      setSono(sonoVal);
      setExercicio(exercicioVal);

      const { data: auth } = await supabase.auth.getUser();
      const userId = auth?.user?.id;
      if (!userId) throw new Error("Utilizador não autenticado");

      const registos = [
        { tipo: "passos", valor: passosVal, unidade: "unidades" },
        { tipo: "sono", valor: sonoVal, unidade: "minutos" },
        { tipo: "exercicio", valor: exercicioVal, unidade: "minutos" },
      ];

      const { error } = await supabase.from("dados_smartwatch").insert(
        registos.map(r => ({ ...r, user_id: userId }))
      );

      if (error) throw error;

      Alert.alert("✅ Sucesso", `Passos: ${passosVal}\nSono: ${sonoVal} min\nExercício: ${exercicioVal} min`);
    } catch (err: any) {
      console.error("Erro:", err);
      Alert.alert("Erro", err.message || "Erro ao processar dispositivo.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Dispositivos Bluetooth</Text>
      <Text style={styles.status}>{isScanning ? 'A fazer scan...' : 'Scan parado'}</Text>

      {(passos !== null || sono !== null || exercicio !== null) && (
        <View style={styles.dataBox}>
          <Text style={styles.dataText}>👣 Passos: {passos ?? '---'}</Text>
          <Text style={styles.dataText}>🛌 Sono: {sono ?? '---'} minutos</Text>
          <Text style={styles.dataText}>💪 Exercício: {exercicio ?? '---'} minutos</Text>
        </View>
      )}

      <FlatList
        data={devices}
        keyExtractor={(item, index) => item.id + '-' + index}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.item, isProcessing && { opacity: 0.5 }]}
            onPress={() => handleConnectAndFetch(item)}
            disabled={isProcessing}
          >
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
  dataBox: { marginBottom: 15, padding: 16, backgroundColor: '#E6F7FF', borderRadius: 10 },
  dataText: { fontSize: 16, color: '#333', marginBottom: 6 },
});
