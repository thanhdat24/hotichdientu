export interface ApiConfig {
  path: string;
  body: Record<string, any>;
}

export interface EndpointMap {
  [key: string]: ApiConfig;
}

export interface StatResult {
  label: string;
  count: number;
  loading: boolean;
  error: boolean;
  unauthorized?: boolean;
  networkError?: boolean;
}

export interface DashboardData {
  results: StatResult[];
  lastUpdated: Date | null;
  isGlobalLoading: boolean;
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED'
}