// app/ble/scan.tsx
// app/ble/scan.tsx
import { bleManager, requestPermissions } from './bleManager';


import type { Device } from 'react-native-ble-plx';

export async function scanForWatch(
  onFound: (device: Device) => void
): Promise<void> {
  await requestPermissions();

  bleManager.startDeviceScan(
    null,
    null,
    (error: Error | null, device: Device | null) => {
      if (error) {
        console.warn('BLE Scan error:', error);
        return;
      }
      if (device?.name?.includes('MyWatch')) {
        bleManager.stopDeviceScan();
        onFound(device);
      }
    }
  );
}
