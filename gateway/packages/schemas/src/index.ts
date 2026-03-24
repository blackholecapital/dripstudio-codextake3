export interface DeployRequestSchema {
  initiatedBy: string;
  notes?: string;
}

export const deployRequestExample: DeployRequestSchema = {
  initiatedBy: 'segment-1-foundation',
  notes: 'Stub request payload for later workflow wiring.'
};
