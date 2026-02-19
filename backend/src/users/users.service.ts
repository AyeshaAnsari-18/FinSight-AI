/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) throw new NotFoundException('User not found');

    
    const { password, hashedRefreshToken, ...result } = user;
    return result;
  }

  
  async update(id: string, dto: UpdateUserDto) {
    const data: any = { ...dto };

    
    if (dto.password) {
      data.password = await argon2.hash(dto.password);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data,
    });

    const { password, hashedRefreshToken, ...result } = user;
    return result;
  }

  async groupByRole() {
    const grouped = await this.prisma.user.groupBy({
      by: ['role'],
      _count: { id: true },
    });

    return grouped.map((group, index) => ({
      id: index + 1,
      name: group.role.charAt(0) + group.role.slice(1).toLowerCase() + ' Department',
      head: group.role === 'MANAGER' || group.role === 'ADMIN' ? 'System Admin' : 'Manager',
      employees: group._count.id,
    }));
  }
}
