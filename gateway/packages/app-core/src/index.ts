import type { StatusMetric } from '@gateway/core-types';
import { formatMetricValue } from '@gateway/utils';

export function getShellMetrics(): StatusMetric[] {
  return [
    { label: 'Worker readiness', value: formatMetricValue(100, '%'), tone: 'positive' },
    { label: 'Stub endpoints', value: '2', tone: 'neutral' },
    { label: 'Workspace latency', value: '18 ms', tone: 'warning' }
  ];
}
