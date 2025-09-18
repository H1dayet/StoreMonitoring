"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeMap = exports.stores = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function loadStores() {
    try {
        const jsonPath = path_1.default.resolve(process.cwd(), '..', 'oba_markets.json');
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
//# sourceMappingURL=stores.data.js.map