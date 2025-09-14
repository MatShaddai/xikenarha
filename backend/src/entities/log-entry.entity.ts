import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Employee } from './employee.entity';

@Entity('log_entries')
export class LogEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  timestamp: Date;

  @Column()
  employeeId: string;

  @Column({ type: 'varchar' })
  action: 'entry' | 'exit';

  @Column()
  deviceId: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Employee, (employee) => employee.id)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;
}
