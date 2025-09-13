import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LogEntry {
  id: string;
  timestamp: string;
  employeeName: string;
  deviceId: string;
  action: 'entry' | 'exit';
}

export interface Employee {
  id: string;
  name: string;
  department?: string;
  email?: string;
}

const STORAGE_KEYS = {
  LOG_ENTRIES: 'laptop_log_entries',
  EMPLOYEES: 'employees_database',
  SETTINGS: 'app_settings',
};

// Log Entry Management
export const saveLogEntry = async (entry: Omit<LogEntry, 'id'>): Promise<LogEntry> => {
  try {
    const newEntry: LogEntry = {
      ...entry,
      id: Date.now().toString(),
    };

    const existingEntries = await getLogEntries();
    const updatedEntries = [newEntry, ...existingEntries];
    
    await AsyncStorage.setItem(STORAGE_KEYS.LOG_ENTRIES, JSON.stringify(updatedEntries));
    return newEntry;
  } catch (error) {
    console.error('Error saving log entry:', error);
    throw error;
  }
};

export const getLogEntries = async (): Promise<LogEntry[]> => {
  try {
    const entries = await AsyncStorage.getItem(STORAGE_KEYS.LOG_ENTRIES);
    return entries ? JSON.parse(entries) : [];
  } catch (error) {
    console.error('Error getting log entries:', error);
    return [];
  }
};

export const deleteLogEntry = async (id: string): Promise<void> => {
  try {
    const entries = await getLogEntries();
    const updatedEntries = entries.filter(entry => entry.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.LOG_ENTRIES, JSON.stringify(updatedEntries));
  } catch (error) {
    console.error('Error deleting log entry:', error);
    throw error;
  }
};

export const clearAllLogEntries = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.LOG_ENTRIES);
  } catch (error) {
    console.error('Error clearing log entries:', error);
    throw error;
  }
};

// Employee Management
export const getEmployees = async (): Promise<Employee[]> => {
  try {
    const employees = await AsyncStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    return employees ? JSON.parse(employees) : getDefaultEmployees();
  } catch (error) {
    console.error('Error getting employees:', error);
    return getDefaultEmployees();
  }
};

export const findEmployeeByDeviceId = async (deviceId: string): Promise<Employee | null> => {
  try {
    const employees = await getEmployees();
    return employees.find(emp => emp.id === deviceId) || null;
  } catch (error) {
    console.error('Error finding employee:', error);
    return null;
  }
};

// Default employees for demo purposes
const getDefaultEmployees = (): Employee[] => [
  { id: '12345', name: 'John Smith', department: 'IT', email: 'john.smith@company.com' },
  { id: '67890', name: 'Jane Doe', department: 'HR', email: 'jane.doe@company.com' },
  { id: '11111', name: 'Bob Johnson', department: 'Finance', email: 'bob.johnson@company.com' },
  { id: '22222', name: 'Alice Brown', department: 'Marketing', email: 'alice.brown@company.com' },
];

// Export functions for log data
export const exportLogData = async (): Promise<string> => {
  try {
    const entries = await getLogEntries();
    const csvHeader = 'Timestamp,Employee Name,Device ID,Action\n';
    const csvData = entries.map(entry => 
      `${entry.timestamp},${entry.employeeName},${entry.deviceId},${entry.action}`
    ).join('\n');
    
    return csvHeader + csvData;
  } catch (error) {
    console.error('Error exporting log data:', error);
    throw error;
  }
};