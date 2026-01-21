"use client";
import { useEffect, useState } from "react";
import { useBluetooth } from "@/hooks/useBluetooth";

export default function BluetoothMonitor() {
  const { isSupported, device, connecting, error, heartRate, connect, disconnect } = useBluetooth();
  const [history, setHistory] = useState<number[]>([]);

  useEffect(() => {
    if (heartRate !== null) setHistory((prev) => [...prev.slice(-29), heartRate]);
  }, [heartRate]);

  if (!isSupported) return (
    <div className="p-4 bg-yellow-50 text-yellow-700 rounded">
      Web Bluetooth requires Chrome/Edge on HTTPS (not iOS Safari).
    </div>
  );

  return (
    <div className="max-w-sm mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">BLE Heart Rate Monitor</h1>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="p-4 border rounded-xl text-center">
        {heartRate !== null ? (
          <>
            <p className="text-6xl font-bold text-red-500">{heartRate}</p>
            <p className="text-gray-500">BPM</p>
          </>
        ) : (
          <p className="text-gray-400">No data</p>
        )}
      </div>
      {history.length > 1 && (
        <div className="flex items-end gap-0.5 h-16 border-b">
          {history.map((bpm, i) => (
            <div key={i} className="flex-1 bg-red-400 rounded-t" style={{ height: `${((bpm - 40) / 160) * 100}%` }} />
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <button onClick={connect} disabled={connecting || !!device?.connected} className="flex-1 bg-indigo-600 text-white py-2 rounded disabled:opacity-50">
          {connecting ? "Connecting…" : device?.connected ? "Connected" : "Connect"}
        </button>
        <button onClick={disconnect} disabled={!device?.connected} className="flex-1 bg-gray-200 py-2 rounded disabled:opacity-50">Disconnect</button>
      </div>
      {device && <p className="text-xs text-gray-400">{device.name ?? "Unknown device"} ({device.id.slice(0, 8)}…)</p>}
    </div>
  );
}
