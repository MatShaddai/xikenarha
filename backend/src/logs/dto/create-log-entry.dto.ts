export class CreateLogEntryDto {
  employeeId: string;
  action: string;
  deviceId: string;
  timestamp?: Date;
}
