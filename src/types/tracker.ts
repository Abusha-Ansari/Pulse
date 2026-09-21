export type Category = 
  | 'Development'
  | 'Design'
  | 'Communication'
  | 'Entertainment'
  | 'Productivity'
  | 'System';

export type ProductivityType = 'Productive' | 'Neutral' | 'Distracting';

export interface Application {
  id: string;
  name: string;
  category: Category;
  productivityType: ProductivityType;
  iconName: string;
  color: string;
  description: string;
}

export interface UsageRecord {
  id: string;
  appId: string;
  applicationName: string;
  category: Category;
  productivityType: ProductivityType;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  durationSeconds: number;
  date: string;       // YYYY-MM-DD
  isIdle?: boolean;
}

export type SimulationSpeed = 1 | 5 | 10;

export interface SimulationSettings {
  autoSwitchIntervalSec: number;
  speed: SimulationSpeed;
  isPaused: boolean;
  idleSimulationEnabled: boolean;
}

export interface UserPreferences {
  timeFormat: '12h' | '24h';
  dailyGoalSeconds: number; // e.g. 8 * 3600
  weeklyProductiveGoalHours: number; // e.g. 30 hours
  notificationAlerts: boolean;
}

export interface ActiveSession {
  appId: string;
  applicationName: string;
  category: Category;
  productivityType: ProductivityType;
  color: string;
  iconName: string;
  durationSeconds: number;
  startedAt: string; // ISO string
  isIdle: boolean;
}

export interface HourlyActivity {
  hour: number; // 0 to 23
  label: string; // '9 AM'
  productiveSeconds: number;
  neutralSeconds: number;
  distractingSeconds: number;
  idleSeconds: number;
  totalSeconds: number;
  topApp?: string;
}

export interface DayMetricOverview {
  date: string;
  totalScreenTimeSeconds: number;
  focusTimeSeconds: number;
  idleTimeSeconds: number;
  neutralTimeSeconds: number;
  distractingTimeSeconds: number;
  productivityScore: number; // 0 to 100
  yesterdayDiffPercent: number; // e.g. +12 or -5
  totalSessionsCount: number;
}
