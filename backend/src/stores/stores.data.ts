import fs from 'fs';
import path from 'path';

// Store type used by the API
export interface Store { code: string; name: string }

// Load the full list from the root-level oba_markets.json, map to { code, name }, and dedupe by code
const jsonPath = path.resolve(process.cwd(), 'data', 'oba_markets.json');

function loadStores(): Store[] {
  try {
  const raw = fs.readFileSync(jsonPath, 'utf8');
    const data = JSON.parse(raw) as Array<{ magaza_kodu: number; market_adi: string }>;
    const map = new Map<string, Store>();
    for (const item of data) {
      const code = String(item.magaza_kodu);
      const name = item.market_adi;
      if (!code || !name) continue;
      map.set(code, { code, name });
    }
    return Array.from(map.values()).sort((a, b) => a.code.localeCompare(b.code, 'en', { numeric: true }));
  } catch (e) {
    // Fallback: minimal list in case file not found
    return [
      { code: '1407', name: 'OBA-BEYLEQAN 13' },
      { code: '728', name: 'OBA-SHIRVAN 11' },
    ];
  }
}

export const stores: Store[] = loadStores();

// Fast lookup map
export const storeMap: Record<string, Store> = Object.fromEntries(stores.map(s => [s.code, s]));

// Persist a new store into oba_markets.json and update in-memory caches
export function addStore(code: string, name: string): Store {
  const cleanCode = String(code).trim();
  const cleanName = String(name).trim();
  if (!cleanCode || !cleanName) {
    throw new Error('Both code and name are required');
  }
  if (storeMap[cleanCode]) {
    throw new Error('Store code already exists');
  }
  const numeric = parseInt(cleanCode, 10);
  if (!Number.isFinite(numeric)) {
    throw new Error('Store code must be a number');
  }
  // Read file, append, and write back
  const existingRaw = fs.readFileSync(jsonPath, 'utf8');
  const arr = JSON.parse(existingRaw) as Array<{ magaza_kodu: number; market_adi: string }>;
  arr.push({ magaza_kodu: numeric, market_adi: cleanName });
  fs.writeFileSync(jsonPath, JSON.stringify(arr, null, 2), 'utf8');
  // Update in-memory caches
  const created: Store = { code: cleanCode, name: cleanName };
  stores.push(created);
  stores.sort((a, b) => a.code.localeCompare(b.code, 'en', { numeric: true }));
  Object.assign(storeMap, Object.fromEntries(stores.map(s => [s.code, s])));
  return created;
}

// Remove a store by code from oba_markets.json and update in-memory caches
export function deleteStore(code: string): { deleted: boolean } {
  const cleanCode = String(code).trim();
  if (!cleanCode) {
    throw new Error('Code is required');
  }
  if (!storeMap[cleanCode]) {
    throw new Error('Store code not found');
  }
  const existingRaw = fs.readFileSync(jsonPath, 'utf8');
  const arr = JSON.parse(existingRaw) as Array<{ magaza_kodu: number; market_adi: string }>;
  const newArr = arr.filter(item => String(item.magaza_kodu) !== cleanCode);
  if (newArr.length === arr.length) {
    throw new Error('Store not found in file');
  }
  fs.writeFileSync(jsonPath, JSON.stringify(newArr, null, 2), 'utf8');
  // Update in-memory
  const idx = stores.findIndex(s => s.code === cleanCode);
  if (idx !== -1) stores.splice(idx, 1);
  delete storeMap[cleanCode];
  return { deleted: true };
}