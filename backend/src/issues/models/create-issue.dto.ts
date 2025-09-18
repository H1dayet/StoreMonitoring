import { IsOptional, IsString, IsIn, IsNotEmpty } from 'class-validator';
import { IssueSeverity, IssueReason, ISSUE_REASONS } from './issue.entity';
import { storeMap } from '../../stores/stores.data';

export class CreateIssueDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  storeCode!: string; // validated manually against storeMap

  @IsOptional()
  @IsIn(['low', 'medium', 'high', 'critical'])
  severity?: IssueSeverity;

  @IsIn([...ISSUE_REASONS])
  reason!: IssueReason;
}
