import { Module } from '@nestjs/common';
import { LabelsService } from './labels.service';
import { LabelsController } from './labels.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [LabelsService],
  controllers: [LabelsController],
  exports: [LabelsService],
})
export class LabelsModule {}
