import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AtGuard } from '../auth/guards/at.guard';
import { GetCurrentUser } from '../common/decorators/get-current-user.decorator';

@Controller('tasks')
@UseGuards(AtGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Get('me')
  findMyTasks(@GetCurrentUser('sub') userId: string) {
    return this.tasksService.findMyTasks(userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @GetCurrentUser('sub') userId: string,
  ) {
    return this.tasksService.update(id, updateTaskDto, userId);
  }
}
