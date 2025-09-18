import { Body, Controller, Get, Param, Patch, Post, Delete, UseGuards } from '@nestjs/common';
import { IssuesService } from './issues.service';
import { CreateIssueDto } from './models/create-issue.dto';
import { UpdateIssueStatusDto } from './models/update-issue-status.dto';
import { AdminGuard } from '../auth/admin.guard';

@Controller('issues')
export class IssuesController {
  constructor(private readonly issuesService: IssuesService) {}

  @Get()
  findAll() {
    return this.issuesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.issuesService.findOne(id);
  }

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() dto: CreateIssueDto) {
    return this.issuesService.create(dto);
  }

  @Patch(':id/status')
  @UseGuards(AdminGuard)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateIssueStatusDto) {
    return this.issuesService.updateStatus(id, dto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.issuesService.remove(id);
  }
}
