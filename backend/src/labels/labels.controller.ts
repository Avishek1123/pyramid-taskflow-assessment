import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { LabelsService } from './labels.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IsString, IsNotEmpty } from 'class-validator';

class CreateLabelDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  color: string;
}

@UseGuards(JwtAuthGuard)
@Controller('labels')
export class LabelsController {
  constructor(private labelsService: LabelsService) {}

  @Get()
  findAll() {
    return this.labelsService.findAll();
  }

  @Post()
  create(@Body() body: CreateLabelDto) {
    return this.labelsService.create(body.name, body.color);
  }
}
