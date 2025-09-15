import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { LogEntry } from '../entities/log-entry.entity';
import { Employee } from '../entities/employee.entity';
import { CreateLogEntryDto } from './dto/create-log-entry.dto';

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(LogEntry)
    private logsRepository: Repository<LogEntry>,
    @InjectRepository(Employee)
    private employeesRepository: Repository<Employee>,
  ) {}

  async create(createLogEntryDto: CreateLogEntryDto): Promise<LogEntry> {
    // Verify employee exists
    const employee = await this.employeesRepository.findOne({
      where: { id: createLogEntryDto.employeeId, deletedAt: undefined },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${createLogEntryDto.employeeId} not found`);
    }

    // Validate action is either 'entry' or 'exit'
    if (createLogEntryDto.action !== 'entry' && createLogEntryDto.action !== 'exit') {
      throw new NotFoundException(`Action must be either 'entry' or 'exit'`);
    }

    const logEntry = this.logsRepository.create({
      ...createLogEntryDto,
      action: createLogEntryDto.action as 'entry' | 'exit',
      timestamp: createLogEntryDto.timestamp || new Date(),
    });

    return await this.logsRepository.save(logEntry);
  }

  async findAll(): Promise<LogEntry[]> {
    return await this.logsRepository.find({
      relations: ['employee'],
      order: { timestamp: 'DESC' },
    });
  }

  async findOne(id: string): Promise<LogEntry> {
    const logEntry = await this.logsRepository.findOne({
      where: { id },
      relations: ['employee'],
    });

    if (!logEntry) {
      throw new NotFoundException(`Log entry with ID ${id} not found`);
    }

    return logEntry;
  }

  async findByEmployee(employeeId: string): Promise<LogEntry[]> {
    // Verify employee exists
    const employee = await this.employeesRepository.findOne({
      where: { id: employeeId, deletedAt: undefined },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    return await this.logsRepository.find({
      where: { employeeId },
      relations: ['employee'],
      order: { timestamp: 'DESC' },
    });
  }

  async findByDevice(deviceId: string): Promise<LogEntry[]> {
    return await this.logsRepository.find({
      where: { deviceId },
      relations: ['employee'],
      order: { timestamp: 'DESC' },
    });
  }

  async findByAction(action: 'entry' | 'exit'): Promise<LogEntry[]> {
    return await this.logsRepository.find({
      where: { action },
      relations: ['employee'],
      order: { timestamp: 'DESC' },
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<LogEntry[]> {
    return await this.logsRepository.find({
      where: {
        timestamp: Between(startDate, endDate),
      },
      relations: ['employee'],
      order: { timestamp: 'DESC' },
    });
  }

  async getRecentLogs(limit: number = 50): Promise<LogEntry[]> {
    return await this.logsRepository.find({
      relations: ['employee'],
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  async getStats(): Promise<{
    totalLogs: number;
    entriesToday: number;
    exitsToday: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalLogs, entriesToday, exitsToday] = await Promise.all([
      this.logsRepository.count(),
      this.logsRepository.count({
        where: {
          action: 'entry',
          timestamp: Between(today, tomorrow),
        },
      }),
      this.logsRepository.count({
        where: {
          action: 'exit',
          timestamp: Between(today, tomorrow),
        },
      }),
    ]);

    return {
      totalLogs,
      entriesToday,
      exitsToday,
    };
  }

  async remove(id: string): Promise<void> {
    const logEntry = await this.findOne(id);
    await this.logsRepository.remove(logEntry);
  }
}
