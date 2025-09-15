import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

// Extend AxiosRequestConfig to include _retry property
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// API Response Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// Auth tokens interface
interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor() {
    this.client = axios.create({
      baseURL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000',
      timeout: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '10000'),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private async getAuthTokens(): Promise<AuthTokens | null> {
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      
      if (accessToken && refreshToken) {
        return { accessToken, refreshToken };
      }
      return null;
    } catch (error) {
      console.error('Error retrieving auth tokens:', error);
      return null;
    }
  }

  private async setAuthTokens(tokens: AuthTokens): Promise<void> {
    try {
      await SecureStore.setItemAsync('accessToken', tokens.accessToken);
      await SecureStore.setItemAsync('refreshToken', tokens.refreshToken);
    } catch (error) {
      console.error('Error storing auth tokens:', error);
    }
  }

  private async clearAuthTokens(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
    } catch (error) {
      console.error('Error clearing auth tokens:', error);
    }
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const tokens = await this.getAuthTokens();
        if (tokens?.accessToken) {
          config.headers.Authorization = `Bearer ${tokens.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for token refresh
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig;

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;

          if (this.isRefreshing) {
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(this.client(originalRequest));
              });
            });
          }

          this.isRefreshing = true;

          try {
            const tokens = await this.getAuthTokens();
            if (!tokens?.refreshToken) {
              throw new Error('No refresh token available');
            }

            // Call refresh token endpoint
            const response = await axios.post(
              `${this.client.defaults.baseURL}/auth/refresh`,
              { refreshToken: tokens.refreshToken }
            );

            const newTokens = response.data.data;
            await this.setAuthTokens(newTokens);

            // Update the authorization header
            this.client.defaults.headers.common.Authorization = `Bearer ${newTokens.accessToken}`;

            // Retry all queued requests
            this.refreshSubscribers.forEach((subscriber) => subscriber(newTokens.accessToken));
            this.refreshSubscribers = [];

            // Retry the original request
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            await this.clearAuthTokens();
            // You might want to navigate to login screen here
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  async login(email: string, password: string): Promise<ApiResponse<AuthTokens>> {
    const response = await this.client.post('/auth/login', { email, password });
    const tokens = response.data.data;
    await this.setAuthTokens(tokens);
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await this.clearAuthTokens();
    }
  }

  async register(userData: {
    email: string;
    password: string;
    name: string;
  }): Promise<ApiResponse<AuthTokens>> {
    const response = await this.client.post('/auth/register', userData);
    const tokens = response.data.data;
    await this.setAuthTokens(tokens);
    return response.data;
  }

  // Employee methods
  async getEmployees(): Promise<ApiResponse<any[]>> {
    return this.get('/employees');
  }

  async getEmployee(id: string): Promise<ApiResponse<any>> {
    return this.get(`/employees/${id}`);
  }

  async createEmployee(employeeData: any): Promise<ApiResponse<any>> {
    return this.post('/employees', employeeData);
  }

  async updateEmployee(id: string, employeeData: any): Promise<ApiResponse<any>> {
    return this.put(`/employees/${id}`, employeeData);
  }

  async deleteEmployee(id: string): Promise<ApiResponse<void>> {
    return this.delete(`/employees/${id}`);
  }

  async searchEmployees(query: string): Promise<ApiResponse<any[]>> {
    return this.get('/employees/search', { q: query });
  }

  async getEmployeesByDepartment(department: string): Promise<ApiResponse<any[]>> {
    return this.get(`/employees/department/${department}`);
  }

  // Log methods
  async getLogs(): Promise<ApiResponse<any[]>> {
    return this.get('/logs');
  }

  async getLog(id: string): Promise<ApiResponse<any>> {
    return this.get(`/logs/${id}`);
  }

  async createLog(logData: any): Promise<ApiResponse<any>> {
    return this.post('/logs', logData);
  }

  async getLogsByEmployee(employeeId: string): Promise<ApiResponse<any[]>> {
    return this.get(`/logs/employee/${employeeId}`);
  }

  async getLogsByDevice(deviceId: string): Promise<ApiResponse<any[]>> {
    return this.get(`/logs/device/${deviceId}`);
  }

  async getLogsByAction(action: 'entry' | 'exit'): Promise<ApiResponse<any[]>> {
    return this.get(`/logs/action/${action}`);
  }

  async getLogsByDateRange(startDate: string, endDate: string): Promise<ApiResponse<any[]>> {
    return this.get('/logs/date-range', { startDate, endDate });
  }

  async getRecentLogs(limit?: number): Promise<ApiResponse<any[]>> {
    return this.get('/logs/recent', { limit });
  }

  async getLogStats(): Promise<ApiResponse<any>> {
    return this.get('/logs/stats');
  }

  async deleteLog(id: string): Promise<ApiResponse<void>> {
    return this.delete(`/logs/${id}`);
  }

  // Generic API methods
  async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    const response = await this.client.get(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.post(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.put(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response = await this.client.delete(url);
    return response.data;
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const tokens = await this.getAuthTokens();
    return !!tokens?.accessToken;
  }

  // Get current access token
  async getAccessToken(): Promise<string | null> {
    const tokens = await this.getAuthTokens();
    return tokens?.accessToken || null;
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();

// Utility function to check if error is an API error
export const isApiError = (error: any): error is ApiError => {
  return error && typeof error.message === 'string' && typeof error.status === 'number';
};

// Utility function to handle API errors
export const handleApiError = (error: any): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const responseData = axiosError.response?.data as any;
    return {
      message: responseData?.message || axiosError.message || 'An error occurred',
      status: axiosError.response?.status || 500,
      errors: responseData?.errors,
    };
  }
  
  return {
    message: error.message || 'An unexpected error occurred',
    status: 500,
  };
};
