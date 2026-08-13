import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IsString, IsNotEmpty } from 'class-validator';

class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

class UpdateProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

@UseGuards(JwtAuthGuard)
@Controller()
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Get('workspaces/:workspaceId/projects')
  findAllInWorkspace(@Param('workspaceId') workspaceId: string, @Req() req: any) {
    return this.projectsService.findAllInWorkspace(workspaceId, req.user.id);
  }

  @Post('workspaces/:workspaceId/projects')
  create(
    @Param('workspaceId') workspaceId: string,
    @Body() body: CreateProjectDto,
    @Req() req: any,
  ) {
    return this.projectsService.create(workspaceId, body.name, req.user.id);
  }

  @Get('projects/:id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.projectsService.findOne(id, req.user.id);
  }

  @Patch('projects/:id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateProjectDto,
    @Req() req: any,
  ) {
    return this.projectsService.update(id, body.name, req.user.id);
  }

  @Delete('projects/:id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.projectsService.remove(id, req.user.id);
  }
}
