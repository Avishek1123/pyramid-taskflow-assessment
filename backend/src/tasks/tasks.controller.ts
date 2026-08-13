import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, IsNumber, IsInt } from 'class-validator';
import { Priority } from '../common/types';
import { Transform } from 'class-transformer';

class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  columnId: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @IsOptional()
  @Transform(({ value }) => value ? new Date(value) : null)
  dueDate?: Date;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  labelIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  assigneeIds?: string[];

  @IsString()
  @IsOptional()
  reporterId?: string;
}

class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  columnId?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @IsString()
  @IsOptional()
  status?: string;

  @IsOptional()
  @Transform(({ value }) => value ? new Date(value) : null)
  dueDate?: Date;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  labelIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  assigneeIds?: string[];

  @IsString()
  @IsOptional()
  reporterId?: string;
}

class MoveTaskDto {
  @IsString()
  @IsNotEmpty()
  columnId: string;

  @IsInt()
  @IsNumber()
  order: number;
}

@UseGuards(JwtAuthGuard)
@Controller()
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get('projects/:projectId/tasks')
  findAllInProject(@Param('projectId') projectId: string, @Req() req: any) {
    return this.tasksService.findAllInProject(projectId, req.user.id);
  }

  @Post('projects/:projectId/tasks')
  create(
    @Param('projectId') projectId: string,
    @Body() body: CreateTaskDto,
    @Req() req: any,
  ) {
    return this.tasksService.create(projectId, body, req.user.id);
  }

  @Get('tasks/:id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.tasksService.findOne(id, req.user.id);
  }

  @Patch('tasks/:id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateTaskDto,
    @Req() req: any,
  ) {
    return this.tasksService.update(id, body, req.user.id);
  }

  @Delete('tasks/:id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.tasksService.remove(id, req.user.id);
  }

  @Post('tasks/:id/duplicate')
  duplicate(@Param('id') id: string, @Req() req: any) {
    return this.tasksService.duplicate(id, req.user.id);
  }

  @Patch('tasks/:id/move')
  move(
    @Param('id') id: string,
    @Body() body: MoveTaskDto,
    @Req() req: any,
  ) {
    return this.tasksService.move(id, body.columnId, body.order, req.user.id);
  }
}
