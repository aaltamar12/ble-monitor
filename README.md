# ble-monitor

Demonstrates the Web Bluetooth API — BLE GATT device scanning, heart rate and battery service subscriptions, R-R interval parsing, and a live chart.

## Web APIs Used

| API | Chrome | Firefox | Safari | Edge | Chrome Android |
|-----|--------|---------|--------|------|----------------|
| Web Bluetooth | 56+ | ❌ | ❌ | 79+ | 56+ |
| GATT heart_rate | 56+ | ❌ | ❌ | 79+ | 56+ |
| GATT battery_service | 56+ | ❌ | ❌ | 79+ | 56+ |
| Bluetooth.getDevices() | 85+ | ❌ | ❌ | 85+ | 85+ |

> Web Bluetooth requires HTTPS or localhost and a user gesture to open the device picker.

## How to Run

```bash
npm install
npm run dev   # http://localhost:3000
```

Pair a BLE heart rate monitor (e.g. Polar H10, Garmin HRM). Click Connect and grant permission.
