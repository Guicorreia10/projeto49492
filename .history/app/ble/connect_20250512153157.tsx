import type { Device } from 'react-native-ble-plx';

export async function connectToWatch(device: Device): Promise<Device> {
  const connected = await device.connect();
  await connected.discoverAllServicesAndCharacteristics();
  return connected;
}
