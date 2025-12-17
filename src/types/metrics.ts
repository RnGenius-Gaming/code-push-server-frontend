export interface PackageMetrics {
  packageId: string;
  label: string;
  packageHash: string;
  appVersion: string;
  totalDownloads: number;
  totalInstalls: number;
  totalConfirmed: number;
  totalFailed: number;
  totalRollbacks: number;
  activeDevices: number;
  adoptionRate?: number;
}

export interface VersionDistribution {
  appVersion: string;
  packageLabel: string;
  deviceCount: number;
  percentage: number;
}

export interface DeploymentMetrics {
  deploymentId: string;
  deploymentName: string;
  deploymentKey: string;
  totalActiveDevices: number;
  packages: PackageMetrics[];
  versionDistribution: VersionDistribution[];
}

export interface MetricsSummary {
  totalDownloads: number;
  totalInstalls: number;
  totalConfirmed: number;
  totalFailed: number;
  totalRollbacks: number;
  uniqueDevices: number;
  activeDevices: number;
  lastReportedAt?: string;
}

export interface DashboardMetrics {
  totalApps: number;
  totalDeployments: number;
  totalPackages: number;
  totalActiveDevices: number;
  recentActivity: {
    type: string;
    message: string;
    timestamp: string;
  }[];
}