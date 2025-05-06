// app/root/tabs/manual-input/conectbl.tsx
import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';

export default function ConectBL() {
  const [sleepData, setSleepData] = useState<string | null>(null);

  const simulateBluetooth = () => {
    // Simular dados de wearable
    const simulatedHours = (Math.random() * 3 + 5).toFixed(1); // 5.0h - 8.0h
    const now = new Date().toLocaleTimeString();
    const log = `Simulou ${simulatedHours}h às ${now}`;
    console.log('[DEBUG]', log);
    setSleepData(log);
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ marginBottom: 20, fontSize: 18 }}>Monitorização do Sono (Simulada)</Text>
      <Button title="Simular Conexão Bluetooth" onPress={simulateBluetooth} />
      {sleepData && <Text style={{ marginTop: 20 }}>{sleepData}</Text>}
    </View>
  );
}
