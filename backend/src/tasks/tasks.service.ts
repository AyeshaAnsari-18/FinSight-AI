import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { decryptText, encryptText } from '../common/security/data-protection';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTaskDto, currentUserId: string) {
    let finalAssignedToId = currentUserId; // Default to self

    if (dto.assignedToId) {
      // Check if it's an email
      let user = await this.prisma.user.findUnique({ where: { email: dto.assignedToId } });
      
      // Check if it's a UUID
      if (!user) {
        user = await this.prisma.user.findUnique({ where: { id: dto.assignedToId } }).catch(() => null);
      }

      // Check if it's a role
      if (!user) {
        user = await this.prisma.user.findFirst({ where: { role: dto.assignedToId.toUpperCase() as any } });
      }

      if (user) {
        finalAssignedToId = user.id;
      }
    }

    const task = await this.prisma.task.create({
      data: {
        title: encryptText(dto.title),
        description: dto.description ? encryptText(dto.description) : undefined,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        priority: dto.priority || 'MEDIUM',
        status: 'TODO',
        assignedToId: finalAssignedToId,
      },
    });

    return this.serializeTask(task);
  }

  async findAll() {
    const tasks = await this.prisma.task.findMany({
      orderBy: { dueDate: 'asc' },
      include: { assignedTo: { select: { name: true, role: true } } },
    });

    return tasks.map((task) => this.serializeTask(task));
  }

  async findMyTasks(userId: string) {
    const tasks = await this.prisma.task.findMany({
      where: { assignedToId: userId },
      orderBy: { dueDate: 'asc' },
    });

    return tasks.map((task) => this.serializeTask(task));
  }

  async update(id: string, dto: UpdateTaskDto, userId: string) {
    const existingTask = await this.prisma.task.findUnique({ where: { id } });
    if (!existingTask) {
      throw new NotFoundException('Task not found');
    }

    const task = await this.prisma.task.update({
      where: { id },
      data: {
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        title: dto.title === undefined ? undefined : encryptText(dto.title),
        description:
          dto.description === undefined
            ? undefined
            : encryptText(dto.description),
        status: dto.status,
        priority: dto.priority,
      },
    });

    return this.serializeTask(task);
  }

  private serializeTask<
    T extends { title: string; description: string | null },
  >(task: T) {
    return {
      ...task,
      title: decryptText(task.title) || '',
      description: decryptText(task.description) || null,
    };
  }
}
