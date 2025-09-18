import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { User } from './models/user.entity';
import { v4 as uuid } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  private users: User[] = [];
  private readonly dataDir = path.join(process.cwd(), 'data');
  private readonly dataFile = path.join(this.dataDir, 'users.json');

  constructor() {
    this.bootstrapFromDisk();
  }

  private bootstrapFromDisk() {
    try {
      if (!fs.existsSync(this.dataDir)) fs.mkdirSync(this.dataDir, { recursive: true });
      if (fs.existsSync(this.dataFile)) {
        const raw = fs.readFileSync(this.dataFile, 'utf-8');
        const arr = JSON.parse(raw) as any[];
        this.users = (arr || []).map((u) => ({
          ...u,
          createdAt: new Date(u.createdAt),
          updatedAt: new Date(u.updatedAt),
        }));
      } else {
        // Seed an initial admin if none exists
        const now = new Date();
        const passwordHash = bcrypt.hashSync('admin123', 10);
        this.users = [{
          id: uuid(),
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
    } catch (e) {
      console.error('Failed to init users store', e);
      this.users = [];
    }
  }

  private persist() {
    const serializable = this.users.map(u => ({
      ...u,
      createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : u.createdAt,
      updatedAt: u.updatedAt instanceof Date ? u.updatedAt.toISOString() : u.updatedAt,
    }));
    fs.writeFileSync(this.dataFile, JSON.stringify(serializable, null, 2), 'utf-8');
  }

  findAll(): Omit<User, 'passwordHash'>[] {
    return this.users.map(({ passwordHash, ...rest }) => rest);
  }

  findByUsername(username: string): User | undefined {
    return this.users.find(u => u.username === username);
  }

  create(data: { username: string; name: string; role: 'admin' | 'user'; active?: boolean; password: string; }): Omit<User, 'passwordHash'> {
    if (this.findByUsername(data.username)) {
      throw new BadRequestException('Username already exists');
    }
    const now = new Date();
    const user: User = {
      id: uuid(),
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

  update(id: string, data: Partial<{ name: string; role: 'admin' | 'user'; active: boolean; password: string; }>): Omit<User, 'passwordHash'> {
    const user = this.users.find(u => u.id === id);
    if (!user) throw new NotFoundException('User not found');
    if (typeof data.name === 'string') user.name = data.name;
    if (data.role) user.role = data.role;
    if (typeof data.active === 'boolean') user.active = data.active;
    if (data.password) user.passwordHash = bcrypt.hashSync(data.password, 10);
    user.updatedAt = new Date();
    this.persist();
    const { passwordHash, ...safe } = user;
    return safe;
  }

  remove(id: string): Omit<User, 'passwordHash'> {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) throw new NotFoundException('User not found');
    const [removed] = this.users.splice(idx, 1);
    this.persist();
    const { passwordHash, ...safe } = removed;
    return safe;
  }
}
