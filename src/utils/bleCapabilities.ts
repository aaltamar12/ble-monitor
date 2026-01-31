export interface BleCapabilities {
  webBluetoothSupported: boolean;
  getDevicesSupported: boolean;
  bluetoothAvailable: boolean | null;
  isHttps: boolean;
}

export async function detectBleCapabilities(): Promise<BleCapabilities> {
  if (typeof navigator === "undefined" || !("bluetooth" in navigator)) {
    return {
      webBluetoothSupported: false,
      getDevicesSupported: false,
      bluetoothAvailable: null,
      isHttps: false,
    };
  }

  const isHttps =
    typeof window !== "undefined" &&
    (window.location.protocol === "https:" || window.location.hostname === "localhost");

  // @ts-expect-error getDevices not in all TS lib.dom versions
  const getDevicesSupported = typeof navigator.bluetooth.getDevices === "function";

  let bluetoothAvailable: boolean | null = null;
  try {
    // @ts-expect-error getAvailability not in all TS lib.dom versions
    if (typeof navigator.bluetooth.getAvailability === "function") {
      // @ts-expect-error
      bluetoothAvailable = await navigator.bluetooth.getAvailability();
    }
  } catch {
    bluetoothAvailable = null;
  }

  return { webBluetoothSupported: true, getDevicesSupported, bluetoothAvailable, isHttps };
}
