import { IssueSeverity, IssueReason } from './issue.entity';
export declare class CreateIssueDto {
    title: string;
    description?: string;
    storeCode: string;
    severity?: IssueSeverity;
    reason: IssueReason;
}
