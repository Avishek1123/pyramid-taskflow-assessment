import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ColumnsService } from './columns.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

class CreateColumnDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

class UpdateColumnDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsOptional()
  order?: number;
}

@UseGuards(JwtAuthGuard)
@Controller()
export class ColumnsController {
  constructor(private columnsService: ColumnsService) {}

  @Get('projects/:projectId/columns')
  findAllInProject(@Param('projectId') projectId: string, @Req() req: any) {
    return this.columnsService.findAllInProject(projectId, req.user.id);
  }

  @Post('projects/:projectId/columns')
  create(
    @Param('projectId') projectId: string,
    @Body() body: CreateColumnDto,
    @Req() req: any,
  ) {
    return this.columnsService.create(projectId, body.name, req.user.id);
  }

  @Patch('columns/:id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateColumnDto,
    @Req() req: any,
  ) {
    return this.columnsService.update(id, body.name, body.order, req.user.id);
  }

  @Delete('columns/:id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.columnsService.remove(id, req.user.id);
  }
}
