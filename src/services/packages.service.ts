import { api as apiClient } from './api';

export interface Package {
  id: string;
  deployment: string;
  label: string;
  appVersion: string;
  description?: string;
  packageHash: string;
  blobUrl: string;
  size: number;
  manifestUrl?: string;
  releaseMethod: string;
  isDisabled: boolean;
  isMandatory: boolean;
  rollout: number;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReleasePackageRequest {
  appVersion: string;
  description?: string;
  isDisabled?: boolean;
  isMandatory?: boolean;
  rollout?: number;
}

export const packagesService = {
  async release(
    deploymentId: string,
    file: File,
    data: ReleasePackageRequest
  ): Promise<Package> {
    const formData = new FormData();
    formData.append('package', file);
    formData.append('appVersion', data.appVersion);

    if (data.description) {
      formData.append('description', data.description);
    }
    if (data.isDisabled !== undefined) {
      formData.append('isDisabled', String(data.isDisabled));
    }
    if (data.isMandatory !== undefined) {
      formData.append('isMandatory', String(data.isMandatory));
    }
    if (data.rollout !== undefined) {
      formData.append('rollout', String(data.rollout));
    }

    const response = await apiClient.post(
      `/packages/${deploymentId}/release`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  async findByDeployment(deploymentId: string): Promise<Package[]> {
    const response = await apiClient.get(`/packages/deployment/${deploymentId}`);
    return response.data;
  },

  async findAll(): Promise<Package[]> {
    const response = await apiClient.get('/packages');
    return response.data;
  },

  async toggleStatus(packageId: string): Promise<Package> {
    const response = await apiClient.patch(`/packages/${packageId}/toggle-status`);
    return response.data;
  },

  async delete(packageId: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/packages/${packageId}`);
    return response.data;
  },
};
