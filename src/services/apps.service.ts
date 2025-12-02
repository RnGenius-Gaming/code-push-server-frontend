import { api as apiClient } from './api';

export interface App {
  id: string;
  appName: string;
  platform: string;
  description?: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppRequest {
  appName: string;
  platform: 'ios' | 'android' | 'react-native';
  description?: string;
}

export const appsService = {
  async create(data: CreateAppRequest): Promise<App> {
    const response = await apiClient.post('/apps', data);
    return response.data;
  },

  async findAll(): Promise<App[]> {
    const response = await apiClient.get('/apps');
    return response.data;
  },

  async findOne(id: string): Promise<App> {
    const response = await apiClient.get(`/apps/${id}`);
    return response.data;
  },

  async update(id: string, data: Partial<CreateAppRequest>): Promise<App> {
    const response = await apiClient.put(`/apps/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/apps/${id}`);
  },
};
