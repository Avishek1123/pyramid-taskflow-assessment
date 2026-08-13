import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { ProjectsModule } from './projects/projects.module';
import { ColumnsModule } from './columns/columns.module';
import { TasksModule } from './tasks/tasks.module';
import { LabelsModule } from './labels/labels.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    WorkspacesModule,
    ProjectsModule,
    ColumnsModule,
    TasksModule,
    LabelsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
