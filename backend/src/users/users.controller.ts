/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Controller, Get, Body, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetCurrentUser } from '../common/decorators/get-current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  
  @Get('me')
  getMe(@GetCurrentUser('sub') userId: string) {
    return this.usersService.findOne(userId);
  }

  
  @Patch('me')
  updateMe(
    @GetCurrentUser('sub') userId: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(userId, dto);
  }

  @Get('departments')
  async getDepartmentsOverview() {
    
    const roles = await this.usersService.groupByRole(); 
    return roles;
  }
}