import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Priority } from '../common/types';

@Injectable()
export class TasksService {
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

  async checkTaskMembership(taskId: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    await this.checkProjectMembership(task.projectId, userId);
    return task;
  }

  async findAllInProject(projectId: string, userId: string) {
    await this.checkProjectMembership(projectId, userId);
    return this.prisma.task.findMany({
      where: { projectId },
      include: {
        assignees: true,
        reporter: true,
        labels: true,
      },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string, userId: string) {
    const task = await this.checkTaskMembership(id, userId);
    return this.prisma.task.findUnique({
      where: { id },
      include: {
        assignees: true,
        reporter: true,
        labels: true,
      },
    });
  }

  async create(
    projectId: string,
    data: {
      title: string;
      description?: string;
      columnId: string;
      priority?: Priority;
      dueDate?: Date | null;
      labelIds?: string[];
      assigneeIds?: string[];
      reporterId?: string;
    },
    userId: string,
  ) {
    await this.checkProjectMembership(projectId, userId);

    // Verify column exists and belongs to the project
    const column = await this.prisma.column.findFirst({
      where: { id: data.columnId, projectId },
    });
    if (!column) {
      throw new NotFoundException('Column not found in project');
    }

    // Get order inside that column
    const order = await this.prisma.task.count({
      where: { columnId: data.columnId },
    });

    const { labelIds, assigneeIds, ...rest } = data;

    return this.prisma.task.create({
      data: {
        ...rest,
        order,
        projectId,
        assignees: assigneeIds ? {
          connect: assigneeIds.map(id => ({ id })),
        } : undefined,
        labels: labelIds ? {
          connect: labelIds.map(id => ({ id })),
        } : undefined,
      },
      include: {
        assignees: true,
        reporter: true,
        labels: true,
      },
    });
  }

  async update(
    id: string,
    data: {
      title?: string;
      description?: string | null;
      columnId?: string;
      priority?: Priority;
      status?: string;
      dueDate?: Date | null;
      labelIds?: string[];
      assigneeIds?: string[];
      reporterId?: string | null;
    },
    userId: string,
  ) {
    const task = await this.checkTaskMembership(id, userId);
    const { labelIds, assigneeIds, ...rest } = data;

    // Build update data
    const updateData: any = { ...rest };

    if (labelIds) {
      // Disconnect all first
      updateData.labels = {
        set: labelIds.map(lid => ({ id: lid })),
      };
    }

    if (assigneeIds) {
      // Disconnect all first
      updateData.assignees = {
        set: assigneeIds.map(aid => ({ id: aid })),
      };
    }

    return this.prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignees: true,
        reporter: true,
        labels: true,
      },
    });
  }

  async remove(id: string, userId: string) {
    const task = await this.checkTaskMembership(id, userId);

    await this.prisma.task.delete({
      where: { id },
    });

    // Reorder remaining tasks in that column
    const columnTasks = await this.prisma.task.findMany({
      where: { columnId: task.columnId },
      orderBy: { order: 'asc' },
    });

    for (let i = 0; i < columnTasks.length; i++) {
      await this.prisma.task.update({
        where: { id: columnTasks[i].id },
        data: { order: i },
      });
    }

    return { success: true };
  }

  async duplicate(id: string, userId: string) {
    const task = await this.checkTaskMembership(id, userId);

    const sameColTasksCount = await this.prisma.task.count({
      where: { columnId: task.columnId },
    });

    // Create duplicate
    return this.prisma.task.create({
      data: {
        title: `${task.title} (Copy)`,
        description: task.description,
        projectId: task.projectId,
        columnId: task.columnId,
        priority: task.priority,
        dueDate: task.dueDate,
        reporterId: task.reporterId,
        order: sameColTasksCount,
        assignees: {
          connect: (await this.prisma.user.findMany({
            where: { assignedTasks: { some: { id } } },
          })).map(u => ({ id: u.id })),
        },
        labels: {
          connect: (await this.prisma.label.findMany({
            where: { tasks: { some: { id } } },
          })).map(l => ({ id: l.id })),
        },
      },
      include: {
        assignees: true,
        reporter: true,
        labels: true,
      },
    });
  }

  async move(id: string, columnId: string, order: number, userId: string) {
    const task = await this.checkTaskMembership(id, userId);
    const sourceColumnId = task.columnId;
    const sourceOrder = task.order;

    // Verify target column exists in same project
    const targetColumn = await this.prisma.column.findFirst({
      where: { id: columnId, projectId: task.projectId },
    });
    if (!targetColumn) {
      throw new NotFoundException('Target column not found in project');
    }

    if (sourceColumnId === columnId) {
      // Reordering within the same column
      if (sourceOrder === order) {
        return task;
      }

      const allColTasks = await this.prisma.task.findMany({
        where: { columnId },
        orderBy: { order: 'asc' },
      });

      // Filter tasks between source and target
      if (order < sourceOrder) {
        // Moving up: increment order of tasks in between
        for (const t of allColTasks) {
          if (t.order >= order && t.order < sourceOrder) {
            await this.prisma.task.update({
              where: { id: t.id },
              data: { order: t.order + 1 },
            });
          }
        }
      } else {
        // Moving down: decrement order of tasks in between
        for (const t of allColTasks) {
          if (t.order > sourceOrder && t.order <= order) {
            await this.prisma.task.update({
              where: { id: t.id },
              data: { order: t.order - 1 },
            });
          }
        }
      }

      await this.prisma.task.update({
        where: { id },
        data: { order },
      });

    } else {
      // Moving to a different column

      // 1. Decrement order of subsequent tasks in source column
      const sourceColTasks = await this.prisma.task.findMany({
        where: { columnId: sourceColumnId },
        orderBy: { order: 'asc' },
      });

      for (const t of sourceColTasks) {
        if (t.order > sourceOrder) {
          await this.prisma.task.update({
            where: { id: t.id },
            data: { order: t.order - 1 },
          });
        }
      }

      // 2. Increment order of tasks in target column at or after the target order
      const targetColTasks = await this.prisma.task.findMany({
        where: { columnId },
        orderBy: { order: 'asc' },
      });

      for (const t of targetColTasks) {
        if (t.order >= order) {
          await this.prisma.task.update({
            where: { id: t.id },
            data: { order: t.order + 1 },
          });
        }
      }

      // 3. Move task to target column and set its order
      await this.prisma.task.update({
        where: { id },
        data: {
          columnId,
          order,
        },
      });
    }

    return this.prisma.task.findUnique({
      where: { id },
      include: {
        assignees: true,
        reporter: true,
        labels: true,
      },
    });
  }
}
