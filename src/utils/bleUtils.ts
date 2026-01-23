export const HEART_RATE_SERVICE = "heart_rate";
export const HEART_RATE_CHARACTERISTIC = "heart_rate_measurement";
export const BATTERY_SERVICE = "battery_service";
export const BATTERY_LEVEL_CHARACTERISTIC = "battery_level";
export async function getBatteryLevel(server: BluetoothRemoteGATTServer): Promise<number | null> {
  try {
    const svc = await server.getPrimaryService(BATTERY_SERVICE);
    const char = await svc.getCharacteristic(BATTERY_LEVEL_CHARACTERISTIC);
    const value = await char.readValue();
    return value.getUint8(0);
  } catch { return null; }
}
