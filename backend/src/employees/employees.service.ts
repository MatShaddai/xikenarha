import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../entities/employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeesRepository: Repository<Employee>,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    const employee = this.employeesRepository.create({
      ...createEmployeeDto,
      isActive: createEmployeeDto.isActive ?? true,
    });
    
    return await this.employeesRepository.save(employee);
  }

  async findAll(): Promise<Employee[]> {
    return await this.employeesRepository.find({
      where: { deletedAt: undefined },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Employee> {
    const employee = await this.employeesRepository.findOne({
      where: { id, deletedAt: undefined },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return employee;
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
    const employee = await this.findOne(id);
    
    Object.assign(employee, updateEmployeeDto);
    employee.updatedAt = new Date();
    
    return await this.employeesRepository.save(employee);
  }

  async remove(id: string): Promise<void> {
    const employee = await this.findOne(id);
    
    // Soft delete
    employee.deletedAt = new Date();
    employee.isActive = false;
    
    await this.employeesRepository.save(employee);
  }

  async search(query: string): Promise<Employee[]> {
    return await this.employeesRepository
      .createQueryBuilder('employee')
      .where('employee.deletedAt IS NULL')
      .andWhere(
        '(employee.name LIKE :query OR employee.email LIKE :query OR employee.department LIKE :query)',
        { query: `%${query}%` },
      )
      .orderBy('employee.name', 'ASC')
      .getMany();
  }

  async findByDepartment(department: string): Promise<Employee[]> {
    return await this.employeesRepository.find({
      where: { department, deletedAt: undefined },
      order: { name: 'ASC' },
    });
  }

  async getActiveCount(): Promise<number> {
    return await this.employeesRepository.count({
      where: { isActive: true, deletedAt: undefined },
    });
  }
}
