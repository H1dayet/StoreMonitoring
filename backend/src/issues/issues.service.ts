import { Injectable, BadRequestException } from '@nestjs/common';
import { Issue, IssueStatus } from './models/issue.entity';
import { CreateIssueDto } from './models/create-issue.dto';
import { UpdateIssueStatusDto } from './models/update-issue-status.dto';
import { v4 as uuid } from 'uuid';
import { storeMap } from '../stores/stores.data';
import * as fs from 'fs';
import * as path from 'path';
import { UsersService } from '../users/users.service';

@Injectable()
export class IssuesService {
  private issues: Issue[] = [];
  private readonly dataDir = path.join(process.cwd(), 'data');
  private readonly dataFile = path.join(this.dataDir, 'issues.json');

  constructor(private readonly usersService: UsersService) {
    this.bootstrapFromDisk();
  }

  private bootstrapFromDisk() {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
      if (fs.existsSync(this.dataFile)) {
        const raw = fs.readFileSync(this.dataFile, 'utf-8');
        const arr = JSON.parse(raw) as any[];
        this.issues = (arr || []).map((i) => ({
          ...i,
          // keep createdBy fields as-is if present
          createdAt: new Date(i.createdAt),
          updatedAt: new Date(i.updatedAt),
          endedAt: i.endedAt ? new Date(i.endedAt) : undefined,
        }));
        return;
      }
      // seed with some initial issues if no file
      this.issues = [
        {
          id: uuid(),
          title: 'Database latency spike',
          description: 'Read queries exceeding 500ms in cluster A',
          status: 'open',
          severity: 'high',
          reason: 'encore_db_baglanti_problemi',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: uuid(),
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
    } catch (err) {
      // fall back to empty array on error, but don't crash the app
      console.error('Failed to initialize issues store:', err);
      this.issues = [];
    }
  }

  private persist() {
    try {
      const serializable = this.issues.map((i) => ({
        ...i,
        createdAt: i.createdAt instanceof Date ? i.createdAt.toISOString() : i.createdAt,
        updatedAt: i.updatedAt instanceof Date ? i.updatedAt.toISOString() : i.updatedAt,
        endedAt: i.endedAt instanceof Date ? i.endedAt.toISOString() : i.endedAt,
      }));
      fs.writeFileSync(this.dataFile, JSON.stringify(serializable, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write issues store:', err);
    }
  }

  findAll(): Issue[] {
    return this.issues;
  }

  findOne(id: string): Issue | undefined {
    return this.issues.find((i) => i.id === id);
  }

  create(dto: CreateIssueDto, user?: { sub?: string; username?: string; name?: string }): Issue {
    const creator = user?.username ? this.usersService.findByUsername(user.username) : undefined;
    if (!dto.storeCode || !storeMap[dto.storeCode]) {
      throw new BadRequestException('Invalid storeCode');
    }
    const issue: Issue = {
      id: uuid(),
      title: dto.title,
      description: dto.description ?? '',
      severity: dto.severity ?? 'low',
      reason: dto.reason,
      storeCode: dto.storeCode,
      status: 'open',
  createdById: user?.sub,
  createdByUsername: user?.username,
  createdByName: creator?.name ?? user?.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.issues.unshift(issue);
    this.persist();
    // no websocket broadcast in simplified version
    return issue;
  }

  updateStatus(id: string, dto: UpdateIssueStatusDto): Issue | undefined {
    const issue = this.findOne(id);
    if (!issue) return undefined;
    issue.status = dto.status;
    issue.updatedAt = new Date();
  // mark end when closed; clear if moving back to open/investigating
  if (dto.status === 'closed') {
      if (!issue.endedAt) issue.endedAt = new Date();
    } else {
      issue.endedAt = undefined;
    }
    this.persist();
    return issue;
  }

  remove(id: string): Issue | undefined {
    const idx = this.issues.findIndex(i => i.id === id);
    if (idx === -1) return undefined;
    const [removed] = this.issues.splice(idx, 1);
    this.persist();
    return removed;
  }
}
