import { api as apiClient } from './api';

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export const auditService = {
  async findAll(): Promise<AuditLog[]> {
    const response = await apiClient.get('/audit-logs');
    return response.data;
  },

  async findByUser(userId: string): Promise<AuditLog[]> {
    const response = await apiClient.get(`/audit-logs/user/${userId}`);
    return response.data;
  },

  async findByEntity(entity: string, entityId: string): Promise<AuditLog[]> {
    const response = await apiClient.get(`/audit-logs/entity/${entity}/${entityId}`);
    return response.data;
  },
};
