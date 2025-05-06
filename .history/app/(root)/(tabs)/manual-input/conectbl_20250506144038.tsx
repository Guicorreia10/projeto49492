import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, Platform, PermissionsAndroid } from 'react-native';
import { BleManager } from 'react-native-ble-plx';

const manager = new BleManager();

export default function ConectBL() {
  const [devices, setDevices] = useState<any[]>([]);
  const [scanning, setScanning] = useState(false);

  async function requestPermissions() {
    if (Platform.OS === 'android' && Platform.Version >= 23) {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);
      console.log('Permissões:', granted);
    }
  }

  useEffect(() => {
    requestPermissions();
    return () => {
      manager.stopDeviceScan();
      manager.destroy();
    };
  }, []);

  const startScan = () => {
    setScanning(true);
    setDevices([]);
    console.log('[DEBUG] A iniciar scan...');

    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log('[DEBUG] Erro no scan:', error);
        setScanning(false);
        return;
      }

      if (device && device.name) {
        console.log('[DEBUG] Dispositivo encontrado:', device.name);
        setDevices((prev) => {
          if (!prev.find((d) => d.id === device.id)) {
            return [...prev, device];
          }
          return prev;
        });
      }
    });

    // Parar o scan após 10 segundos
    setTimeout(() => {
      manager.stopDeviceScan();
      setScanning(false);
      console.log('[DEBUG] Scan terminado.');
    }, 10000);
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>Dispositivos Bluetooth</Text>
      <Button title={scanning ? 'A procurar...' : 'Procurar Dispositivos'} onPress={startScan} disabled={scanning} />
      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text style={{ marginTop: 10 }}>{item.name} ({item.id})</Text>
        )}
      />
    </View>
  );
}
