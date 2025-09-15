import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  Query, 
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ParseIntPipe
} from '@nestjs/common';
import { LogsService } from './logs.service';
import { CreateLogEntryDto } from './dto/create-log-entry.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('logs')
@UseGuards(JwtAuthGuard)
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createLogEntryDto: CreateLogEntryDto) {
    return this.logsService.create(createLogEntryDto);
  }

  @Get()
  findAll() {
    return this.logsService.findAll();
  }

  @Get('recent')
  getRecentLogs(@Query('limit', new ParseIntPipe({ optional: true })) limit?: number) {
    return this.logsService.getRecentLogs(limit);
  }

  @Get('employee/:employeeId')
  findByEmployee(@Param('employeeId', ParseUUIDPipe) employeeId: string) {
    return this.logsService.findByEmployee(employeeId);
  }

  @Get('device/:deviceId')
  findByDevice(@Param('deviceId') deviceId: string) {
    return this.logsService.findByDevice(deviceId);
  }

  @Get('action/:action')
  findByAction(@Param('action') action: 'entry' | 'exit') {
    return this.logsService.findByAction(action);
  }

  @Get('date-range')
  findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.logsService.findByDateRange(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('stats')
  getStats() {
    return this.logsService.getStats();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.logsService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.logsService.remove(id);
  }
}
