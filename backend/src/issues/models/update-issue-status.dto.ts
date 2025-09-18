import { IsIn } from 'class-validator';
import { IssueStatus } from './issue.entity';

export class UpdateIssueStatusDto {
  @IsIn(['open', 'investigating', 'closed'])
  status!: IssueStatus;
}
