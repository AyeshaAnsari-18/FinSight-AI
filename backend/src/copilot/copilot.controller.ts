import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { CopilotService } from './copilot.service';

@Controller('copilot')
export class CopilotController {
  constructor(private readonly copilotService: CopilotService) {}

  @Post('chat')
  async chat(@Req() req: any, @Body() body: { message: string }) {
    const userId = req.user.sub;
    const role = req.user.role;
    return this.copilotService.handleChat(userId, role, body.message);
  }

  @Get('history')
  async getHistory(@Req() req: any) {
    const userId = req.user.sub;
    return this.copilotService.getChatHistory(userId);
  }
}
