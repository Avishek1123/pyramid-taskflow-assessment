import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async checkWorkspaceMembership(workspaceId: string, userId: string) {
    const isMember = await this.prisma.workspaceMember.findFirst({
      where: { workspaceId, userId },
    });
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this workspace');
    }
  }

  async checkProjectMembership(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    await this.checkWorkspaceMembership(project.workspaceId, userId);
    return project;
  }

  async findAllInWorkspace(workspaceId: string, userId: string) {
    await this.checkWorkspaceMembership(workspaceId, userId);
    return this.prisma.project.findMany({
      where: { workspaceId },
      include: {
        columns: true,
      },
    });
  }

  async findOne(id: string, userId: string) {
    const project = await this.checkProjectMembership(id, userId);
    return this.prisma.project.findUnique({
      where: { id },
      include: {
        columns: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
  }

  async create(workspaceId: string, name: string, userId: string) {
    await this.checkWorkspaceMembership(workspaceId, userId);
    
    const project = await this.prisma.project.create({
      data: {
        name,
        workspaceId,
      },
    });

    // Auto-seed default columns
    const columns = ['To Do', 'Doing', 'Completed', 'On Hold'];
    for (let i = 0; i < columns.length; i++) {
      await this.prisma.column.create({
        data: {
          name: columns[i],
          order: i,
          projectId: project.id,
        },
      });
    }

    return this.prisma.project.findUnique({
      where: { id: project.id },
      include: {
        columns: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
  }

  async update(id: string, name: string, userId: string) {
    await this.checkProjectMembership(id, userId);
    return this.prisma.project.update({
      where: { id },
      data: { name },
    });
  }

  async remove(id: string, userId: string) {
    await this.checkProjectMembership(id, userId);
    return this.prisma.project.delete({
      where: { id },
    });
  }
}
