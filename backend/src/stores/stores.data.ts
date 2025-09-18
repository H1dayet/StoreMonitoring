import fs from 'fs';
import path from 'path';

// Store type used by the API
export interface Store { code: string; name: string }

// Load the full list from the root-level oba_markets.json, map to { code, name }, and dedupe by code
function loadStores(): Store[] {
  try {
    // When running `npm run start:dev` from backend folder, cwd is backend; JSON is one level up
    const jsonPath = path.resolve(process.cwd(), '..', 'oba_markets.json');
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