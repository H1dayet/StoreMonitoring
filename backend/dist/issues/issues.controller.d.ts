import { IssuesService } from './issues.service';
import { CreateIssueDto } from './models/create-issue.dto';
import { UpdateIssueStatusDto } from './models/update-issue-status.dto';
export declare class IssuesController {
    private readonly issuesService;
    constructor(issuesService: IssuesService);
    findAll(): import("./models/issue.entity").Issue[];
    findOne(id: string): import("./models/issue.entity").Issue | undefined;
    create(dto: CreateIssueDto, req: any): import("./models/issue.entity").Issue;
    updateStatus(id: string, dto: UpdateIssueStatusDto): import("./models/issue.entity").Issue | undefined;
    remove(id: string): import("./models/issue.entity").Issue | undefined;
}
