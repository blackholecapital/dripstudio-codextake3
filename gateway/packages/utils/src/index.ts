export function formatMetricValue(value: number, suffix = ''): string {
  return `${value}${suffix}`;
}

export function titleCase(value: string): string {
  return value.replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}
