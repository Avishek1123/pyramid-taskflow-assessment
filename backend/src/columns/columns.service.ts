import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ColumnsService {
  constructor(private prisma: PrismaService) {}

  async checkProjectMembership(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    const isMember = await this.prisma.workspaceMember.findFirst({
      where: { workspaceId: project.workspaceId, userId },
    });
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this workspace');
    }
  }

  async checkColumnMembership(columnId: string, userId: string) {
    const column = await this.prisma.column.findUnique({
      where: { id: columnId },
      include: {
        project: true,
      },
    });
    if (!column) {
      throw new NotFoundException('Column not found');
    }
    await this.checkProjectMembership(column.projectId, userId);
    return column;
  }

  async findAllInProject(projectId: string, userId: string) {
    await this.checkProjectMembership(projectId, userId);
    return this.prisma.column.findMany({
      where: { projectId },
      orderBy: { order: 'asc' },
    });
  }

  async create(projectId: string, name: string, userId: string) {
    await this.checkProjectMembership(projectId, userId);
    const count = await this.prisma.column.count({
      where: { projectId },
    });

    return this.prisma.column.create({
      data: {
        name,
        order: count,
        projectId,
      },
    });
  }

  async update(id: string, name: string, order: number | undefined, userId: string) {
    await this.checkColumnMembership(id, userId);
    return this.prisma.column.update({
      where: { id },
      data: {
        name,
        order,
      },
    });
  }

  async remove(id: string, userId: string) {
    const column = await this.checkColumnMembership(id, userId);
    
    // Delete column
    await this.prisma.column.delete({
      where: { id },
    });

    // Reorder remaining columns
    const columns = await this.prisma.column.findMany({
      where: { projectId: column.projectId },
      orderBy: { order: 'asc' },
    });

    for (let i = 0; i < columns.length; i++) {
      await this.prisma.column.update({
        where: { id: columns[i].id },
        data: { order: i },
      });
    }

    return { success: true };
  }
}
