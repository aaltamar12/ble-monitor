export function parseHeartRateMeasurement(value: DataView): { bpm: number; contact: boolean; energy?: number; intervals?: number[] } {
  const flags = value.getUint8(0);
  const format16bit = !!(flags & 0x01);
  const contactSupported = !!(flags & 0x04);
  const contactDetected = !!(flags & 0x02);
  const energyPresent = !!(flags & 0x08);
  const rrPresent = !!(flags & 0x10);

  let offset = 1;
  const bpm = format16bit ? value.getUint16(offset, true) : value.getUint8(offset);
  offset += format16bit ? 2 : 1;

  let energy: number | undefined;
  if (energyPresent) { energy = value.getUint16(offset, true); offset += 2; }

  const intervals: number[] = [];
  if (rrPresent) {
    while (offset + 1 < value.byteLength) {
      intervals.push(value.getUint16(offset, true) / 1024 * 1000); // in ms
      offset += 2;
    }
  }

  return { bpm, contact: !contactSupported || contactDetected, energy, intervals: intervals.length ? intervals : undefined };
}
