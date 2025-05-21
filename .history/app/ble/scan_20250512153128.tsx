import { bleManager, requestPermissions } from './bleManager';
import type { Device } from 'react-native-ble-plx';

export async function scanForWatch(
  onFound: (device: Device) => void
): Promise<void> {
  await requestPermissions();
  bleManager.startDeviceScan(null, null, (error, device) => {
    if (error) {
      console.warn('BLE Scan error:', error);
      return;
    }
    // Ajusta para o nome ou ID do teu relógio
    if (device?.name?.includes('MyWatch')) {
      bleManager.stopDeviceScan();
      onFound(device);
    }
  });
}
