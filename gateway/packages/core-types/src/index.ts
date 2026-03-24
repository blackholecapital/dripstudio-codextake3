export type EnvironmentMode = 'local' | 'staging' | 'production';

export interface StatusMetric {
  label: string;
  value: string;
  tone?: 'neutral' | 'positive' | 'warning';
}

export interface DeployTarget {
  id: 'demo' | 'gateway';
  label: string;
  previewUrl: string;
  bucket: string;
}
