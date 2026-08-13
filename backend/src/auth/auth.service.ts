import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async createGuestSession() {
    // Reuse the demo account when it already exists so repeat logins resume the same workspace
    const existing = await this.prisma.user.findUnique({
      where: { email: 'Dexter@gmail.com' },
      include: {
        workspaces: {
          include: { workspace: { include: { projects: { orderBy: { createdAt: 'asc' } } } } },
        },
      },
    });

    const existingWorkspace = existing?.workspaces[0]?.workspace;

    if (existing && existingWorkspace && existingWorkspace.projects.length > 0) {
      return {
        user: {
          id: existing.id,
          name: existing.name,
          email: existing.email,
          avatarUrl: existing.avatarUrl,
          isGuest: existing.isGuest,
          createdAt: existing.createdAt,
        },
        token: this.jwtService.sign({ userId: existing.id }),
        workspaceId: existingWorkspace.id,
        projectId: existingWorkspace.projects[0].id,
      };
    }

    const user = await this.prisma.user.create({
      data: {
        name: 'Dexter',
        email: 'Dexter@gmail.com',
        isGuest: true,
        avatarUrl: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Dexter&backgroundColor=b6e3f4',
      },
    });

    // Extra demo members for list avatars / initials
    const memberCN =
      (await this.prisma.user.findUnique({ where: { email: 'cn@example.com' } })) ??
      (await this.prisma.user.create({
        data: {
          name: 'CN',
          email: 'cn@example.com',
          isGuest: true,
          avatarUrl: null,
        },
      }));

    const workspace = await this.prisma.workspace.create({
      data: {
        name: 'Dexter',
        ownerId: user.id,
        avatarUrl: user.avatarUrl,
      },
    });

    await this.prisma.workspaceMember.createMany({
      data: [
        { userId: user.id, workspaceId: workspace.id, role: 'owner' },
        { userId: memberCN.id, workspaceId: workspace.id, role: 'member' },
      ],
    });

    const project = await this.prisma.project.create({
      data: {
        name: 'Design Homepage',
        workspaceId: workspace.id,
      },
    });

    // Match design columns: To Do, Doing, Completed, On Hold
    const columnsData = [
      { name: 'To Do', order: 0 },
      { name: 'Doing', order: 1 },
      { name: 'Completed', order: 2 },
      { name: 'On Hold', order: 3 },
    ];

    const columns: any[] = [];
    for (const col of columnsData) {
      const createdCol = await this.prisma.column.create({
        data: {
          name: col.name,
          order: col.order,
          projectId: project.id,
        },
      });
      columns.push(createdCol);
    }

    const labelsData = [
      { name: 'Deployment', color: '#8b5cf6' },
      { name: 'Testing', color: '#3b82f6' },
      { name: 'Passed', color: '#10b981' },
      { name: 'Design', color: '#ec4899' },
      { name: 'Updated', color: '#06b6d4' },
      { name: 'Audit', color: '#f59e0b' },
      { name: 'Scheduled', color: '#6366f1' },
      { name: 'Research', color: '#14b8a6' },
      { name: 'Development', color: '#0ea5e9' },
      { name: 'Review', color: '#a855f7' },
    ];

    const labels: any[] = [];
    for (const label of labelsData) {
      const createdLabel = await this.prisma.label.create({
        data: label,
      });
      labels.push(createdLabel);
    }

    const labelMap = labels.reduce((acc, l) => {
      acc[l.name] = l.id;
      return acc;
    }, {} as Record<string, string>);

    const getColId = (name: string) => columns.find((c) => c.name === name)?.id || columns[0].id;

    const jul29 = new Date('2026-07-29');
    const jul30 = new Date('2026-07-30');
    const jul31 = new Date('2026-07-31');
    const aug01 = new Date('2026-08-01');
    const sep12 = new Date('2026-09-12');
    const sep15 = new Date('2026-09-15');
    const sep18 = new Date('2026-09-18');

    const tasksData = [
      {
        title: 'Write API Documentation',
        description:
          'Create clear and detailed API documentation to guide developers in using the inventory and sales metrics features effectively.',
        columnId: getColId('To Do'),
        order: 0,
        priority: 'HIGH' as const,
        labels: ['Deployment'],
        assigneeIds: [user.id],
        dueDate: jul31,
        assigneeName: 'Admin',
      },
      {
        title: 'Implement Search Function',
        description: 'Build search across tasks and projects with keyboard shortcut support.',
        columnId: getColId('To Do'),
        order: 1,
        priority: 'MEDIUM' as const,
        labels: ['Deployment'],
        assigneeIds: [user.id],
        dueDate: jul29,
      },
      {
        title: 'Deploy to Production',
        description: 'Ship the latest release to production environments.',
        columnId: getColId('To Do'),
        order: 2,
        priority: 'LOW' as const,
        labels: ['Deployment'],
        assigneeIds: [user.id],
        dueDate: jul29,
      },
      {
        title: 'Design Homepage',
        description: 'Finalize homepage layout and visual system.',
        columnId: getColId('To Do'),
        order: 3,
        priority: 'HIGH' as const,
        labels: ['Design'],
        assigneeIds: [user.id],
        dueDate: sep12,
      },
      {
        title: 'Develop Login Feature',
        description: 'Implement authentication and session handling.',
        columnId: getColId('To Do'),
        order: 4,
        priority: 'LOW' as const,
        labels: ['Development'],
        assigneeIds: [memberCN.id],
        dueDate: sep15,
      },
      {
        title: 'Test Payment Gateway',
        description: 'QA payment flows and edge cases.',
        columnId: getColId('To Do'),
        order: 5,
        priority: 'MEDIUM' as const,
        labels: ['Testing'],
        assigneeIds: [],
        dueDate: sep18,
      },
      {
        title: 'Code Review Completed',
        description: 'Finish peer review for the latest PR batch.',
        columnId: getColId('Doing'),
        order: 0,
        priority: 'HIGH' as const,
        labels: ['Deployment'],
        assigneeIds: [user.id],
        dueDate: jul29,
      },
      {
        title: 'Design Mockups Finalized',
        description: 'Lock final mockups for development handoff.',
        columnId: getColId('Doing'),
        order: 1,
        priority: 'MEDIUM' as const,
        labels: ['Design'],
        assigneeIds: [user.id],
        dueDate: jul29,
      },
      {
        title: 'Feature Testing Passed',
        description: 'All critical feature tests passed QA.',
        columnId: getColId('Completed'),
        order: 0,
        priority: 'HIGH' as const,
        labels: ['Testing', 'Passed'],
        assigneeIds: [user.id],
        dueDate: jul30,
      },
      {
        title: 'UI Design Updated',
        description: 'Applied latest design system updates.',
        columnId: getColId('Completed'),
        order: 1,
        priority: 'LOW' as const,
        labels: ['Design', 'Updated'],
        assigneeIds: [user.id],
        dueDate: jul31,
      },
      {
        title: 'Security Audit Scheduled',
        description: 'Schedule and prepare security audit checklist.',
        columnId: getColId('Completed'),
        order: 2,
        priority: 'MEDIUM' as const,
        labels: ['Audit', 'Scheduled'],
        assigneeIds: [user.id],
        dueDate: aug01,
      },
      {
        title: 'UI Review Session',
        description: 'Review outstanding UI polish items.',
        columnId: getColId('On Hold'),
        order: 0,
        priority: 'LOW' as const,
        labels: ['Review'],
        assigneeIds: [user.id],
        dueDate: jul31,
      },
      {
        title: 'Backend Migration',
        description: 'Pause schema migration until API freeze.',
        columnId: getColId('On Hold'),
        order: 1,
        priority: 'MEDIUM' as const,
        labels: ['Development'],
        assigneeIds: [memberCN.id],
        dueDate: aug01,
      },
    ];

    for (const task of tasksData) {
      const uniqueLabels = [...new Set(task.labels)];
      await this.prisma.task.create({
        data: {
          title: task.title,
          description: task.description,
          projectId: project.id,
          columnId: task.columnId,
          order: task.order,
          priority: task.priority,
          reporterId: user.id,
          dueDate: task.dueDate,
          assignees: task.assigneeIds.length
            ? { connect: task.assigneeIds.map((id) => ({ id })) }
            : undefined,
          labels: {
            connect: uniqueLabels
              .filter((l) => labelMap[l])
              .map((l) => ({ id: labelMap[l] })),
          },
        },
      });
    }

    // Second project for Projects table
    await this.prisma.project.create({
      data: {
        name: 'Design Management',
        workspaceId: workspace.id,
      },
    });

    const payload = { userId: user.id };
    const token = this.jwtService.sign(payload);

    return {
      user,
      token,
      workspaceId: workspace.id,
      projectId: project.id,
    };
  }
}
