import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, Alert } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';
import { supabase } from '@/lib/supabase';

const manager = new BleManager();

const Conectar = () => {
  const [devices, setDevices] = useState<Device[]>([]);

  const startScan = () => {
    setDevices([]);
    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        Alert.alert("Erro", error.message);
        return;
      }

      if (device?.name && !devices.some((d) => d.id === device.id)) {
        setDevices((prev) => [...prev, device]);
      }
    });

    setTimeout(() => {
      manager.stopDeviceScan();
    }, 8000);
  };

  const connectToDevice = async (device: Device) => {
    try {
      manager.stopDeviceScan();

      const connected = await manager.connectToDevice(device.id);
      await connected.discoverAllServicesAndCharacteristics();

      // Simulação
      const glicose = Math.floor(80 + Math.random() * 40);
      const sono = parseFloat((Math.random() * 8).toFixed(2));

      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;

      if (!userId) {
        Alert.alert("Erro", "Utilizador não logado.");
        return;
      }

      const { error } = await supabase.from("dados_usuario").insert({
        glicose,
        sono,
        user_id: userId,
      });

      if (error) {
        Alert.alert("Erro ao guardar no Supabase", error.message);
      } else {
        Alert.alert("Perfeito!", `Glicose: ${glicose} mg/dL | Sono: ${sono} h`);
      }
    } catch (err) {
      if (err instanceof Error) {
        Alert.alert("Erro na conexão", err.message);
      } else {
        Alert.alert("Erro desconhecido", JSON.stringify(err));
      }
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
        Conectar Dispositivos Bluetooth
      </Text>

      <Button title="Procurar dispositivos" onPress={startScan} />

      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => connectToDevice(item)}
            style={{
              padding: 15,
              marginTop: 10,
              backgroundColor: '#E3F2FD',
              borderRadius: 10,
            }}
          >
            <Text style={{ fontSize: 16 }}>{item.name || 'Sem Nome'}</Text>
            <Text style={{ fontSize: 12, color: '#666' }}>{item.id}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default Conectar;
