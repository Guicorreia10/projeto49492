import type { Device, Characteristic } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import { guardarDadoSmartwatch } from '../utils/guardarSmartwatch';


// leitura pontual com gravação automática
export async function readChar(
  device: Device,
  serviceUUID: string,
  charUUID: string,
  tipo: 'sono' | 'passos' | 'exercicio',
  unidade: string
): Promise<Buffer> {
  const char: Characteristic = await device.readCharacteristicForService(
    serviceUUID,
    charUUID
  );
  const decoded = Buffer.from(char.value ?? '', 'base64');

  try {
    const valor = parseFloat(decoded.toString());
    if (!isNaN(valor)) {
      await guardarDadoSmartwatch(tipo, valor, unidade);
    } else {
      console.warn('Valor inválido recebido via BLE:', decoded.toString());
    }
  } catch (e) {
    console.error('Erro ao guardar leitura BLE:', e);
  }

  return decoded;
}
