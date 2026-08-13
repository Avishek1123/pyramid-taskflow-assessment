import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

class CreateWorkspaceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;
}

@UseGuards(JwtAuthGuard)
@Controller('workspaces')
export class WorkspacesController {
  constructor(private workspacesService: WorkspacesService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.workspacesService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.workspacesService.findOne(id, req.user.id);
  }

  @Get(':id/members')
  findMembers(@Param('id') id: string, @Req() req: any) {
    return this.workspacesService.findMembers(id, req.user.id);
  }

  @Post()
  create(@Body() body: CreateWorkspaceDto, @Req() req: any) {
    return this.workspacesService.create(body.name, req.user.id, body.avatarUrl);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.workspacesService.remove(id, req.user.id);
  }
}
