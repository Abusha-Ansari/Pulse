export type SchedulingAlgorithm =
  | 'FCFS'
  | 'SJF'
  | 'SRTF'
  | 'RR'
  | 'PRIORITY_NON_PREEMPTIVE'
  | 'PRIORITY_PREEMPTIVE';

export interface Process {
  id: string;
  pid: string;
  name: string;
  category: string;
  color: string;
  iconName: string;
  arrivalTime: number; // in time units (e.g., minutes or normalized units)
  burstTime: number; // in time units
  priority: number; // 1 = highest, 5 = lowest
}

export interface GanttBlock {
  pid: string;
  name: string;
  color: string;
  startTime: number;
  endTime: number;
  isContextSwitch?: boolean;
}

export interface ProcessResult {
  pid: string;
  name: string;
  color: string;
  arrivalTime: number;
  burstTime: number;
  priority: number;
  completionTime: number;
  turnaroundTime: number; // TAT = CT - AT
  waitingTime: number; // WT = TAT - BT
  responseTime: number; // RT = First Execution Time - AT
}

export interface SchedulerResult {
  algorithm: SchedulingAlgorithm;
  algorithmName: string;
  quantum?: number;
  gantt: GanttBlock[];
  processResults: ProcessResult[];
  avgWaitingTime: number;
  avgTurnaroundTime: number;
  avgResponseTime: number;
  totalExecutionTime: number;
  totalContextSwitches: number;
  cpuUtilization: number;
  throughput: number;
}
