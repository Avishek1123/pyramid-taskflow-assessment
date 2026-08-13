import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkspacesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: true,
      },
    });
  }

  async findOne(id: string, userId: string) {
    const isMember = await this.prisma.workspaceMember.findFirst({
      where: { workspaceId: id, userId },
    });

    if (!isMember) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    const workspace = await this.prisma.workspace.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        projects: true,
      },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    return workspace;
  }

  async findMembers(workspaceId: string, userId: string) {
    const isMember = await this.prisma.workspaceMember.findFirst({
      where: { workspaceId, userId },
    });

    if (!isMember) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    const members = await this.prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: true,
      },
    });

    return members.map(m => m.user);
  }

  async create(name: string, userId: string, avatarUrl?: string) {
    const workspace = await this.prisma.workspace.create({
      data: {
        name,
        avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.substring(0, 2))}&backgroundColor=27272a`,
        ownerId: userId,
      },
    });

    await this.prisma.workspaceMember.create({
      data: {
        userId,
        workspaceId: workspace.id,
        role: 'owner',
      },
    });

    return workspace;
  }

  async remove(id: string, userId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    if (workspace.ownerId !== userId) {
      throw new ForbiddenException('Only the workspace owner can delete it');
    }

    const ownedCount = await this.prisma.workspace.count({
      where: { ownerId: userId },
    });

    if (ownedCount <= 1) {
      throw new ForbiddenException('You must keep at least one workspace');
    }

    await this.prisma.workspace.delete({ where: { id } });
    return { success: true };
  }
}
