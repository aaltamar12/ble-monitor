export interface PairedDeviceRecord {
  id: string;
  name: string | null;
  services: string[];
  lastConnectedAt: string;
  connectedCount: number;
}

const STORAGE_KEY = "ble:pairedDevices";

function load(): PairedDeviceRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PairedDeviceRecord[]) : [];
  } catch {
    return [];
  }
}

function save(records: PairedDeviceRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // ignore quota errors
  }
}

export function upsertPairedDevice(
  device: Pick<BluetoothDevice, "id" | "name">,
  services: string[],
): PairedDeviceRecord[] {
  const records = load();
  const now = new Date().toISOString();
  const existing = records.find((r) => r.id === device.id);

  if (existing) {
    const updated = records.map((r) =>
      r.id === device.id
        ? { ...r, lastConnectedAt: now, connectedCount: r.connectedCount + 1, services }
        : r,
    );
    save(updated);
    return updated;
  }

  const newRecord: PairedDeviceRecord = {
    id: device.id,
    name: device.name ?? null,
    services,
    lastConnectedAt: now,
    connectedCount: 1,
  };
  const updated = [newRecord, ...records];
  save(updated);
  return updated;
}

export function getPairedDevices(): PairedDeviceRecord[] {
  return load();
}

export function removePairedDevice(deviceId: string): PairedDeviceRecord[] {
  const updated = load().filter((r) => r.id !== deviceId);
  save(updated);
  return updated;
}

/**
 * Reconnect to a previously paired device via Bluetooth.getDevices() (Chrome 85+)
 * without showing the device picker. Returns null when not available.
 */
export async function reconnectPairedDevice(
  deviceId: string,
): Promise<BluetoothDevice | null> {
  if (typeof navigator === "undefined" || !("bluetooth" in navigator)) return null;
  // @ts-expect-error getDevices not yet in all TS lib.dom versions
  if (typeof navigator.bluetooth.getDevices !== "function") return null;

  try {
    // @ts-expect-error
    const devices: BluetoothDevice[] = await navigator.bluetooth.getDevices();
    return devices.find((d) => d.id === deviceId) ?? null;
  } catch {
    return null;
  }
}
