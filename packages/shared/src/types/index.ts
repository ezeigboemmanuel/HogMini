export interface Organization {
  id: string;
  name: string;
  createdAt: Date;
}

export interface Project {
  id: string;
  organizationId: string;
  name: string;
}

export interface Environment {
  id: string;
  projectId: string;
  name: string; // e.g., 'production', 'staging'
  apiKey: string;
}

export interface Variation {
  id: string;
  value: any; // Can be boolean, string, JSON
  weight?: number; // For A/B testing percentage rollouts
}

export interface Rule {
  id: string;
  attribute: string; // e.g., 'email', 'country', 'plan'
  operator: 'EQUALS' | 'IN' | 'CONTAINS' | 'MATCHES';
  value: any;
  variationId: string;
}

export interface Flag {
  id: string;
  environmentId: string;
  key: string; // e.g., 'new-checkout-flow'
  type: 'BOOLEAN' | 'MULTIVARIATE';
  enabled: boolean;
  defaultVariationId: string;
  rules: Rule[];
  variations: Variation[];
}

export interface UserContext {
  userId: string;
  attributes?: Record<string, string | number | boolean>;
}

export interface EvaluationResult {
  flagKey: string;
  value: any;
  reason: 'TARGET_MATCH' | 'RULE_MATCH' | 'DEFAULT' | 'FLAG_DISABLED';
}

export interface AuditLog {
  id: string;
  organizationId: string;
  actor: string; // Who made the change
  action: string; // e.g., 'FLAG_CREATED', 'FLAG_TOGGLED'
  resourceId: string;
  timestamp: Date;
}