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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const bcrypt = __importStar(require("bcryptjs"));
let UsersService = class UsersService {
    constructor() {
        this.users = [];
        this.dataDir = path.join(process.cwd(), 'data');
        this.dataFile = path.join(this.dataDir, 'users.json');
        this.bootstrapFromDisk();
    }
    bootstrapFromDisk() {
        try {
            if (!fs.existsSync(this.dataDir))
                fs.mkdirSync(this.dataDir, { recursive: true });
            if (fs.existsSync(this.dataFile)) {
                const raw = fs.readFileSync(this.dataFile, 'utf-8');
                const arr = JSON.parse(raw);
                this.users = (arr || []).map((u) => ({
                    ...u,
                    createdAt: new Date(u.createdAt),
                    updatedAt: new Date(u.updatedAt),
                }));
            }
            else {
                const now = new Date();
                const passwordHash = bcrypt.hashSync('admin123', 10);
                this.users = [{
                        id: (0, uuid_1.v4)(),
                        username: 'admin',
                        name: 'Administrator',
                        role: 'admin',
                        active: true,
                        passwordHash,
                        createdAt: now,
                        updatedAt: now,
                    }];
                this.persist();
            }
        }
        catch (e) {
            console.error('Failed to init users store', e);
            this.users = [];
        }
    }
    persist() {
        const serializable = this.users.map(u => ({
            ...u,
            createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : u.createdAt,
            updatedAt: u.updatedAt instanceof Date ? u.updatedAt.toISOString() : u.updatedAt,
        }));
        fs.writeFileSync(this.dataFile, JSON.stringify(serializable, null, 2), 'utf-8');
    }
    findAll() {
        return this.users.map(({ passwordHash, ...rest }) => rest);
    }
    findByUsername(username) {
        return this.users.find(u => u.username === username);
    }
    create(data) {
        if (this.findByUsername(data.username)) {
            throw new common_1.BadRequestException('Username already exists');
        }
        const now = new Date();
        const user = {
            id: (0, uuid_1.v4)(),
            username: data.username,
            name: data.name,
            role: data.role,
            active: data.active ?? true,
            passwordHash: bcrypt.hashSync(data.password, 10),
            createdAt: now,
            updatedAt: now,
        };
        this.users.push(user);
        this.persist();
        const { passwordHash, ...safe } = user;
        return safe;
    }
    update(id, data) {
        const user = this.users.find(u => u.id === id);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (typeof data.name === 'string')
            user.name = data.name;
        if (data.role)
            user.role = data.role;
        if (typeof data.active === 'boolean')
            user.active = data.active;
        if (data.password)
            user.passwordHash = bcrypt.hashSync(data.password, 10);
        user.updatedAt = new Date();
        this.persist();
        const { passwordHash, ...safe } = user;
        return safe;
    }
    remove(id) {
        const idx = this.users.findIndex(u => u.id === id);
        if (idx === -1)
            throw new common_1.NotFoundException('User not found');
        const [removed] = this.users.splice(idx, 1);
        this.persist();
        const { passwordHash, ...safe } = removed;
        return safe;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], UsersService);
//# sourceMappingURL=users.service.js.map