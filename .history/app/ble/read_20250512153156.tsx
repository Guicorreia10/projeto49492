import type { Device, Characteristic } from 'react-native-ble-plx';
import { Buffer } from 'buffer';

// leitura pontual
export async function readChar(
  device: Device,
  serviceUUID: string,
  charUUID: string
): Promise<Buffer> {
  const char: Characteristic = await device.readCharacteristicForService(
    serviceUUID,
    charUUID
  );
  return Buffer.from(char.value ?? '', 'base64');
}

// monitoramento contínuo
export function monitorChar(
  device: Device,
  serviceUUID: string,
  charUUID: string,
  onData: (data: Buffer) => void
) {
  return device.monitorCharacteristicForService(
    serviceUUID,
    charUUID,
    (error, characteristic) => {
      if (error || !characteristic) {
        console.warn('BLE Monitor error:', error);
        return;
      }
      onData(Buffer.from(characteristic.value ?? '', 'base64'));
    }
  );
}
