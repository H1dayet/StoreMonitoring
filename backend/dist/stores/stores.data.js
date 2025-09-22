"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeMap = exports.stores = void 0;
exports.addStore = addStore;
exports.deleteStore = deleteStore;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const jsonPath = path_1.default.resolve(process.cwd(), 'data', 'oba_markets.json');
function loadStores() {
    try {
        const raw = fs_1.default.readFileSync(jsonPath, 'utf8');
        const data = JSON.parse(raw);
        const map = new Map();
        for (const item of data) {
            const code = String(item.magaza_kodu);
            const name = item.market_adi;
            if (!code || !name)
                continue;
            map.set(code, { code, name });
        }
        return Array.from(map.values()).sort((a, b) => a.code.localeCompare(b.code, 'en', { numeric: true }));
    }
    catch (e) {
        return [
            { code: '1407', name: 'OBA-BEYLEQAN 13' },
            { code: '728', name: 'OBA-SHIRVAN 11' },
        ];
    }
}
exports.stores = loadStores();
exports.storeMap = Object.fromEntries(exports.stores.map(s => [s.code, s]));
function addStore(code, name) {
    const cleanCode = String(code).trim();
    const cleanName = String(name).trim();
    if (!cleanCode || !cleanName) {
        throw new Error('Both code and name are required');
    }
    if (exports.storeMap[cleanCode]) {
        throw new Error('Store code already exists');
    }
    const numeric = parseInt(cleanCode, 10);
    if (!Number.isFinite(numeric)) {
        throw new Error('Store code must be a number');
    }
    const existingRaw = fs_1.default.readFileSync(jsonPath, 'utf8');
    const arr = JSON.parse(existingRaw);
    arr.push({ magaza_kodu: numeric, market_adi: cleanName });
    fs_1.default.writeFileSync(jsonPath, JSON.stringify(arr, null, 2), 'utf8');
    const created = { code: cleanCode, name: cleanName };
    exports.stores.push(created);
    exports.stores.sort((a, b) => a.code.localeCompare(b.code, 'en', { numeric: true }));
    Object.assign(exports.storeMap, Object.fromEntries(exports.stores.map(s => [s.code, s])));
    return created;
}
function deleteStore(code) {
    const cleanCode = String(code).trim();
    if (!cleanCode) {
        throw new Error('Code is required');
    }
    if (!exports.storeMap[cleanCode]) {
        throw new Error('Store code not found');
    }
    const existingRaw = fs_1.default.readFileSync(jsonPath, 'utf8');
    const arr = JSON.parse(existingRaw);
    const newArr = arr.filter(item => String(item.magaza_kodu) !== cleanCode);
    if (newArr.length === arr.length) {
        throw new Error('Store not found in file');
    }
    fs_1.default.writeFileSync(jsonPath, JSON.stringify(newArr, null, 2), 'utf8');
    const idx = exports.stores.findIndex(s => s.code === cleanCode);
    if (idx !== -1)
        exports.stores.splice(idx, 1);
    delete exports.storeMap[cleanCode];
    return { deleted: true };
}
//# sourceMappingURL=stores.data.js.map