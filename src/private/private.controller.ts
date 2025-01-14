import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('private')
export class PrivateController {
  @Get()
  index() {
    return { message: 'This is a private route' };
  }
}
