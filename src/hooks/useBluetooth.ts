"use client";
import { useState, useCallback, useRef } from "react";

export interface BleDevice {
  id: string;
  name: string | undefined;
  connected: boolean;
}

const HEART_RATE_SERVICE = 0x180d;
const HEART_RATE_MEASUREMENT = 0x2a37;

export function useBluetooth() {
  const [isSupported] = useState(() => typeof navigator !== "undefined" && "bluetooth" in navigator);
  const [device, setDevice] = useState<BleDevice | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const bleDeviceRef = useRef<BluetoothDevice | null>(null);

  const connect = useCallback(async () => {
    if (!isSupported) { setError("Bluetooth not supported"); return; }
    setConnecting(true);
    setError(null);
    try {
      const bt = await navigator.bluetooth.requestDevice({
        filters: [{ services: [HEART_RATE_SERVICE] }],
        optionalServices: [HEART_RATE_SERVICE],
      });
      bleDeviceRef.current = bt;
      bt.addEventListener("gattserverdisconnected", () => setDevice((d) => d ? { ...d, connected: false } : null));

      const server = await bt.gatt!.connect();
      const service = await server.getPrimaryService(HEART_RATE_SERVICE);
      const characteristic = await service.getCharacteristic(HEART_RATE_MEASUREMENT);

      characteristic.addEventListener("characteristicvaluechanged", (event) => {
        const value = (event.target as BluetoothRemoteGATTCharacteristic).value!;
        const flags = value.getUint8(0);
        const hr = flags & 0x01 ? value.getUint16(1, true) : value.getUint8(1);
        setHeartRate(hr);
      });
      await characteristic.startNotifications();

      setDevice({ id: bt.id, name: bt.name, connected: true });
    } catch (err) {
      if ((err as Error).name !== "NotFoundError") setError((err as Error).message);
    } finally {
      setConnecting(false);
    }
  }, [isSupported]);

  const disconnect = useCallback(() => {
    bleDeviceRef.current?.gatt?.disconnect();
    setDevice(null);
    setHeartRate(null);
  }, []);

  return { isSupported, device, connecting, error, heartRate, connect, disconnect };
}


/**
 * Android Chrome BLE notification fix:
 * startNotifications() sometimes resolves but never fires events on Android 12+
 * due to aggressive BLE power management dropping the connection to "idle".
 *
 * Fix: immediately read the characteristic after startNotifications() to keep
 * the GATT connection active until the first notification arrives.
 */
export async function startNotificationsWithWarmup(
  characteristic: BluetoothRemoteGATTCharacteristic,
): Promise<void> {
  await characteristic.startNotifications();
  try {
    await characteristic.readValue();
  } catch {
    // Non-fatal: some characteristics are notify-only
  }
}
