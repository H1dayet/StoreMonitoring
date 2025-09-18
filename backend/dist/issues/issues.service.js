"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IssuesService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const stores_data_1 = require("../stores/stores.data");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let IssuesService = class IssuesService {
    constructor() {
        this.issues = [];
        this.dataDir = path.join(process.cwd(), 'data');
        this.dataFile = path.join(this.dataDir, 'issues.json');
        this.bootstrapFromDisk();
    }
    bootstrapFromDisk() {
        try {
            if (!fs.existsSync(this.dataDir)) {
                fs.mkdirSync(this.dataDir, { recursive: true });
            }
            if (fs.existsSync(this.dataFile)) {
                const raw = fs.readFileSync(this.dataFile, 'utf-8');
                const arr = JSON.parse(raw);
                this.issues = (arr || []).map((i) => ({
                    ...i,
                    createdAt: new Date(i.createdAt),
                    updatedAt: new Date(i.updatedAt),
                    endedAt: i.endedAt ? new Date(i.endedAt) : undefined,
                }));
                return;
            }
            this.issues = [
                {
                    id: (0, uuid_1.v4)(),
                    title: 'Database latency spike',
                    description: 'Read queries exceeding 500ms in cluster A',
                    status: 'open',
                    severity: 'high',
                    reason: 'encore_db_baglanti_problemi',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: (0, uuid_1.v4)(),
                    title: 'Memory usage warning',
                    description: 'Service auth-api memory > 85%',
                    status: 'investigating',
                    severity: 'medium',
                    reason: 'internet_baglantisi_problemi',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];
            this.persist();
        }
        catch (err) {
            console.error('Failed to initialize issues store:', err);
            this.issues = [];
        }
    }
    persist() {
        try {
            const serializable = this.issues.map((i) => ({
                ...i,
                createdAt: i.createdAt instanceof Date ? i.createdAt.toISOString() : i.createdAt,
                updatedAt: i.updatedAt instanceof Date ? i.updatedAt.toISOString() : i.updatedAt,
                endedAt: i.endedAt instanceof Date ? i.endedAt.toISOString() : i.endedAt,
            }));
            fs.writeFileSync(this.dataFile, JSON.stringify(serializable, null, 2), 'utf-8');
        }
        catch (err) {
            console.error('Failed to write issues store:', err);
        }
    }
    findAll() {
        return this.issues;
    }
    findOne(id) {
        return this.issues.find((i) => i.id === id);
    }
    create(dto) {
        if (!dto.storeCode || !stores_data_1.storeMap[dto.storeCode]) {
            throw new common_1.BadRequestException('Invalid storeCode');
        }
        const issue = {
            id: (0, uuid_1.v4)(),
            title: dto.title,
            description: dto.description ?? '',
            severity: dto.severity ?? 'low',
            reason: dto.reason,
            storeCode: dto.storeCode,
            status: 'open',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.issues.unshift(issue);
        this.persist();
        return issue;
    }
    updateStatus(id, dto) {
        const issue = this.findOne(id);
        if (!issue)
            return undefined;
        issue.status = dto.status;
        issue.updatedAt = new Date();
        if (dto.status === 'closed') {
            if (!issue.endedAt)
                issue.endedAt = new Date();
        }
        else {
            issue.endedAt = undefined;
        }
        this.persist();
        return issue;
    }
    remove(id) {
        const idx = this.issues.findIndex(i => i.id === id);
        if (idx === -1)
            return undefined;
        const [removed] = this.issues.splice(idx, 1);
        this.persist();
        return removed;
    }
};
exports.IssuesService = IssuesService;
exports.IssuesService = IssuesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], IssuesService);
//# sourceMappingURL=issues.service.js.map