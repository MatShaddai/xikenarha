import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogsService } from './logs.service';
import { LogsController } from './logs.controller';
import { LogEntry } from '../entities/log-entry.entity';
import { Employee } from '../entities/employee.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LogEntry, Employee])],
  controllers: [LogsController],
  providers: [LogsService],
  exports: [LogsService],
})
export class LogsModule {}
