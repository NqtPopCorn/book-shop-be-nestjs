import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { AccountsService } from './accounts.service';
import { UpdateAccountDto } from './dto/update-account.dto';
@ApiTags('account')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('account')
export class AccountsController { constructor(private readonly service: AccountsService) {} @Get('me') me(@Req() req: any) { return this.service.me(req.user.id); } @Patch('me') update(@Req() req: any, @Body() dto: UpdateAccountDto) { return this.service.update(req.user.id, dto); } }
