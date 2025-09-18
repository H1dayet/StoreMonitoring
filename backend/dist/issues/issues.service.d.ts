import { Issue } from './models/issue.entity';
import { CreateIssueDto } from './models/create-issue.dto';
import { UpdateIssueStatusDto } from './models/update-issue-status.dto';
export declare class IssuesService {
    private issues;
    private readonly dataDir;
    private readonly dataFile;
    constructor();
    private bootstrapFromDisk;
    private persist;
    findAll(): Issue[];
    findOne(id: string): Issue | undefined;
    create(dto: CreateIssueDto): Issue;
    updateStatus(id: string, dto: UpdateIssueStatusDto): Issue | undefined;
    remove(id: string): Issue | undefined;
}
