import { Issue } from './models/issue.entity';
import { CreateIssueDto } from './models/create-issue.dto';
import { UpdateIssueStatusDto } from './models/update-issue-status.dto';
import { UsersService } from '../users/users.service';
export declare class IssuesService {
    private readonly usersService;
    private issues;
    private readonly dataDir;
    private readonly dataFile;
    constructor(usersService: UsersService);
    private bootstrapFromDisk;
    private persist;
    findAll(): Issue[];
    findOne(id: string): Issue | undefined;
    create(dto: CreateIssueDto, user?: {
        sub?: string;
        username?: string;
        name?: string;
    }): Issue;
    updateStatus(id: string, dto: UpdateIssueStatusDto): Issue | undefined;
    remove(id: string): Issue | undefined;
}
