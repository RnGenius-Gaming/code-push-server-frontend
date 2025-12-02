import { api as apiClient } from './api';

export interface Deployment {
  id: string;
  appName: string;
  deploymentName: string;
  key: string;  // Deployment key for mobile apps
  version: string;
  description?: string;
  mandatory: boolean;
  status: string;
  owner: string;
  releaseDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeploymentRequest {
  appName: string;
  deploymentName: string;
  version: string;
  description?: string;
  mandatory?: boolean;
}

export const deploymentsService = {
  async create(data: CreateDeploymentRequest): Promise<Deployment> {
    const response = await apiClient.post('/deployments', data);
    return response.data;
  },

  async findAll(): Promise<Deployment[]> {
    const response = await apiClient.get('/deployments');
    return response.data;
  },

  async findOne(id: string): Promise<Deployment> {
    const response = await apiClient.get(`/deployments/${id}`);
    return response.data;
  },

  async update(id: string, data: Partial<CreateDeploymentRequest>): Promise<Deployment> {
    const response = await apiClient.put(`/deployments/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/deployments/${id}`);
  },
};
