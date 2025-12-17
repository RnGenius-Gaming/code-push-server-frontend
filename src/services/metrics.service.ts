import { api } from './api';
import type { PackageMetrics, DeploymentMetrics, MetricsSummary } from '../types/metrics';

export const metricsService = {
  /**
   * Get metrics for a specific package
   */
  async getPackageMetrics(packageId: string): Promise<PackageMetrics> {
    const response = await api.get(`/metrics/package/${packageId}`);
    return response.data;
  },

  /**
   * Get metrics for a specific deployment
   */
  async getDeploymentMetrics(deploymentId: string): Promise<DeploymentMetrics> {
    const response = await api.get(`/metrics/deployment/${deploymentId}`);
    return response.data;
  },

  /**
   * Get summary metrics with optional filters
   */
  async getMetricsSummary(params?: {
    deploymentId?: string;
    packageId?: string;
  }): Promise<MetricsSummary> {
    const response = await api.get('/metrics/summary', { params });
    return response.data;
  },
};
