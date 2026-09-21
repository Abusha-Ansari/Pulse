import { Process, GanttBlock, ProcessResult, SchedulerResult, SchedulingAlgorithm } from '../types/scheduler';
import { UsageRecord } from '../types/tracker';

export const TEXTBOOK_WORKLOAD: Process[] = [
  {
    id: 'p1',
    pid: 'P1',
    name: 'VS Code (IDE)',
    category: 'Development',
    color: '#3B82F6',
    iconName: 'Code',
    arrivalTime: 0,
    burstTime: 8,
    priority: 3,
  },
  {
    id: 'p2',
    pid: 'P2',
    name: 'Terminal (Build)',
    category: 'Development',
    color: '#10B981',
    iconName: 'Terminal',
    arrivalTime: 1,
    burstTime: 4,
    priority: 1,
  },
  {
    id: 'p3',
    pid: 'P3',
    name: 'Figma (Design)',
    category: 'Design',
    color: '#8B5CF6',
    iconName: 'Figma',
    arrivalTime: 2,
    burstTime: 6,
    priority: 4,
  },
  {
    id: 'p4',
    pid: 'P4',
    name: 'Chrome (Docs)',
    category: 'Browsing',
    color: '#F59E0B',
    iconName: 'Globe',
    arrivalTime: 3,
    burstTime: 3,
    priority: 2,
  },
  {
    id: 'p5',
    pid: 'P5',
    name: 'Zoom (Meeting)',
    category: 'Communication',
    color: '#EC4899',
    iconName: 'Video',
    arrivalTime: 5,
    burstTime: 5,
    priority: 5,
  },
];

/**
 * Converts recorded timeline usage sessions into normalized processes
 */
export function convertRecordsToProcesses(
  records: UsageRecord[],
  targetDate: string,
  limit: number = 7
): Process[] {
  const dayRecords = records
    .filter((r) => r.date === targetDate && !r.isIdle && r.durationSeconds >= 60)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  if (dayRecords.length === 0) {
    return TEXTBOOK_WORKLOAD;
  }

  const selectedRecords = dayRecords.slice(0, limit);
  const baseTime = new Date(selectedRecords[0].startTime).getTime();

  return selectedRecords.map((r, index) => {
    const startOffsetMinutes = Math.max(
      0,
      Math.round((new Date(r.startTime).getTime() - baseTime) / (60 * 1000))
    );
    // Scale arrival to a compact integer timeline (0 to 12)
    const arrivalTime = Math.min(12, Math.round(startOffsetMinutes / 15));
    // Scale burst duration to 2 - 10 integer units (e.g. 5 mins = 1 unit)
    const burstTime = Math.max(2, Math.min(12, Math.round(r.durationSeconds / 300)));

    let priority = 3;
    if (r.productivityType === 'Productive') priority = 1;
    else if (r.productivityType === 'Neutral') priority = 2;
    else priority = 4;

    const colors: Record<string, string> = {
      Productive: '#10B981',
      Neutral: '#6366F1',
      Distracting: '#F43F5E',
    };

    return {
      id: r.id || `proc_${index}`,
      pid: `P${index + 1}`,
      name: r.applicationName,
      category: r.category,
      color: colors[r.productivityType] || '#3B82F6',
      iconName: r.productivityType === 'Productive' ? 'CheckCircle2' : 'Activity',
      arrivalTime,
      burstTime,
      priority,
    };
  });
}

/**
 * FCFS (First-Come, First-Served) Scheduling
 */
export function runFCFS(processes: Process[]): SchedulerResult {
  const procs = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
  const gantt: GanttBlock[] = [];
  const results: ProcessResult[] = [];

  let currentTime = 0;
  let contextSwitches = 0;

  procs.forEach((p, idx) => {
    if (currentTime < p.arrivalTime) {
      // Idle period
      currentTime = p.arrivalTime;
    }

    const startTime = currentTime;
    const completionTime = startTime + p.burstTime;
    currentTime = completionTime;

    if (idx > 0) contextSwitches++;

    gantt.push({
      pid: p.pid,
      name: p.name,
      color: p.color,
      startTime,
      endTime: completionTime,
    });

    const turnaroundTime = completionTime - p.arrivalTime;
    const waitingTime = turnaroundTime - p.burstTime;
    const responseTime = startTime - p.arrivalTime;

    results.push({
      pid: p.pid,
      name: p.name,
      color: p.color,
      arrivalTime: p.arrivalTime,
      burstTime: p.burstTime,
      priority: p.priority,
      completionTime,
      turnaroundTime,
      waitingTime,
      responseTime,
    });
  });

  return computeAggregateMetrics('FCFS', 'First-Come, First-Served (FCFS)', gantt, results, contextSwitches);
}

/**
 * SJF (Shortest Job First - Non-Preemptive)
 */
export function runSJF(processes: Process[]): SchedulerResult {
  const n = processes.length;
  const isCompleted: boolean[] = new Array(n).fill(false);
  const gantt: GanttBlock[] = [];
  const results: ProcessResult[] = [];

  let currentTime = 0;
  let completedCount = 0;
  let contextSwitches = 0;

  while (completedCount < n) {
    let minBurst = Infinity;
    let selectedIndex = -1;

    for (let i = 0; i < n; i++) {
      if (processes[i].arrivalTime <= currentTime && !isCompleted[i]) {
        if (processes[i].burstTime < minBurst) {
          minBurst = processes[i].burstTime;
          selectedIndex = i;
        } else if (processes[i].burstTime === minBurst) {
          // Tie-break by arrival time
          if (selectedIndex === -1 || processes[i].arrivalTime < processes[selectedIndex].arrivalTime) {
            selectedIndex = i;
          }
        }
      }
    }

    if (selectedIndex === -1) {
      // CPU Idle, find next arrival
      let nextArrival = Infinity;
      for (let i = 0; i < n; i++) {
        if (!isCompleted[i] && processes[i].arrivalTime > currentTime) {
          nextArrival = Math.min(nextArrival, processes[i].arrivalTime);
        }
      }
      currentTime = nextArrival === Infinity ? currentTime + 1 : nextArrival;
      continue;
    }

    const p = processes[selectedIndex];
    const startTime = currentTime;
    const completionTime = startTime + p.burstTime;
    currentTime = completionTime;
    isCompleted[selectedIndex] = true;
    completedCount++;

    if (gantt.length > 0) contextSwitches++;

    gantt.push({
      pid: p.pid,
      name: p.name,
      color: p.color,
      startTime,
      endTime: completionTime,
    });

    const turnaroundTime = completionTime - p.arrivalTime;
    const waitingTime = turnaroundTime - p.burstTime;
    const responseTime = startTime - p.arrivalTime;

    results.push({
      pid: p.pid,
      name: p.name,
      color: p.color,
      arrivalTime: p.arrivalTime,
      burstTime: p.burstTime,
      priority: p.priority,
      completionTime,
      turnaroundTime,
      waitingTime,
      responseTime,
    });
  }

  return computeAggregateMetrics('SJF', 'Shortest Job First (SJF - Non-Preemptive)', gantt, results, contextSwitches);
}

/**
 * SRTF (Shortest Remaining Time First - Preemptive SJF)
 */
export function runSRTF(processes: Process[]): SchedulerResult {
  const n = processes.length;
  const remainingTime = processes.map((p) => p.burstTime);
  const firstExecutionTime: number[] = new Array(n).fill(-1);
  const completionTimes: number[] = new Array(n).fill(0);
  const gantt: GanttBlock[] = [];

  let currentTime = 0;
  let completedCount = 0;
  let lastPid = '';
  let contextSwitches = 0;

  const maxTicks = 1000;
  let ticks = 0;

  while (completedCount < n && ticks < maxTicks) {
    ticks++;
    let minRemaining = Infinity;
    let selectedIndex = -1;

    for (let i = 0; i < n; i++) {
      if (processes[i].arrivalTime <= currentTime && remainingTime[i] > 0) {
        if (remainingTime[i] < minRemaining) {
          minRemaining = remainingTime[i];
          selectedIndex = i;
        } else if (remainingTime[i] === minRemaining) {
          if (selectedIndex === -1 || processes[i].arrivalTime < processes[selectedIndex].arrivalTime) {
            selectedIndex = i;
          }
        }
      }
    }

    if (selectedIndex === -1) {
      currentTime++;
      continue;
    }

    if (firstExecutionTime[selectedIndex] === -1) {
      firstExecutionTime[selectedIndex] = currentTime;
    }

    const p = processes[selectedIndex];
    if (lastPid && lastPid !== p.pid) {
      contextSwitches++;
    }
    lastPid = p.pid;

    // Coalesce continuous execution into single Gantt block
    const lastBlock = gantt[gantt.length - 1];
    if (lastBlock && lastBlock.pid === p.pid && lastBlock.endTime === currentTime) {
      lastBlock.endTime += 1;
    } else {
      gantt.push({
        pid: p.pid,
        name: p.name,
        color: p.color,
        startTime: currentTime,
        endTime: currentTime + 1,
      });
    }

    remainingTime[selectedIndex]--;
    currentTime++;

    if (remainingTime[selectedIndex] === 0) {
      completedCount++;
      completionTimes[selectedIndex] = currentTime;
    }
  }

  const results: ProcessResult[] = processes.map((p, idx) => {
    const completionTime = completionTimes[idx];
    const turnaroundTime = completionTime - p.arrivalTime;
    const waitingTime = turnaroundTime - p.burstTime;
    const responseTime = firstExecutionTime[idx] >= 0 ? firstExecutionTime[idx] - p.arrivalTime : 0;
    return {
      pid: p.pid,
      name: p.name,
      color: p.color,
      arrivalTime: p.arrivalTime,
      burstTime: p.burstTime,
      priority: p.priority,
      completionTime,
      turnaroundTime,
      waitingTime,
      responseTime,
    };
  });

  return computeAggregateMetrics('SRTF', 'Shortest Remaining Time First (SRTF - Preemptive)', gantt, results, contextSwitches);
}

/**
 * Round Robin (RR) with Configurable Time Quantum
 */
export function runRoundRobin(processes: Process[], quantum: number = 2): SchedulerResult {
  const q = Math.max(1, quantum);
  const n = processes.length;
  const remainingTime = processes.map((p) => p.burstTime);
  const firstExecutionTime: number[] = new Array(n).fill(-1);
  const completionTimes: number[] = new Array(n).fill(0);
  const gantt: GanttBlock[] = [];

  const readyQueue: number[] = [];
  const inQueue: boolean[] = new Array(n).fill(false);

  // Sort processes index by arrival time for orderly arrival insertion
  const procIndices = processes.map((_, i) => i).sort((a, b) => processes[a].arrivalTime - processes[b].arrivalTime);

  let currentTime = 0;
  let completedCount = 0;
  let contextSwitches = 0;
  let lastPid = '';

  // Add initial arrivals at t=0
  procIndices.forEach((idx) => {
    if (processes[idx].arrivalTime <= currentTime && !inQueue[idx]) {
      readyQueue.push(idx);
      inQueue[idx] = true;
    }
  });

  const maxLoops = 2000;
  let loopCount = 0;

  while (completedCount < n && loopCount < maxLoops) {
    loopCount++;

    if (readyQueue.length === 0) {
      // Find next arrival
      let nextArrival = Infinity;
      procIndices.forEach((idx) => {
        if (remainingTime[idx] > 0 && processes[idx].arrivalTime > currentTime) {
          nextArrival = Math.min(nextArrival, processes[idx].arrivalTime);
        }
      });

      if (nextArrival !== Infinity) {
        currentTime = nextArrival;
        procIndices.forEach((idx) => {
          if (processes[idx].arrivalTime <= currentTime && remainingTime[idx] > 0 && !inQueue[idx]) {
            readyQueue.push(idx);
            inQueue[idx] = true;
          }
        });
        continue;
      } else {
        break;
      }
    }

    const currentIndex = readyQueue.shift()!;
    inQueue[currentIndex] = false;
    const p = processes[currentIndex];

    if (firstExecutionTime[currentIndex] === -1) {
      firstExecutionTime[currentIndex] = currentTime;
    }

    if (lastPid && lastPid !== p.pid) {
      contextSwitches++;
    }
    lastPid = p.pid;

    const timeSlice = Math.min(remainingTime[currentIndex], q);
    const startTime = currentTime;
    const endTime = startTime + timeSlice;
    currentTime = endTime;
    remainingTime[currentIndex] -= timeSlice;

    gantt.push({
      pid: p.pid,
      name: p.name,
      color: p.color,
      startTime,
      endTime,
    });

    // Check newly arrived processes during this time slice
    procIndices.forEach((idx) => {
      if (
        idx !== currentIndex &&
        processes[idx].arrivalTime <= currentTime &&
        remainingTime[idx] > 0 &&
        !inQueue[idx]
      ) {
        readyQueue.push(idx);
        inQueue[idx] = true;
      }
    });

    // If current process still has remaining time, push to end of queue
    if (remainingTime[currentIndex] > 0) {
      readyQueue.push(currentIndex);
      inQueue[currentIndex] = true;
    } else {
      completedCount++;
      completionTimes[currentIndex] = currentTime;
    }
  }

  const results: ProcessResult[] = processes.map((p, idx) => {
    const completionTime = completionTimes[idx];
    const turnaroundTime = completionTime - p.arrivalTime;
    const waitingTime = turnaroundTime - p.burstTime;
    const responseTime = firstExecutionTime[idx] >= 0 ? firstExecutionTime[idx] - p.arrivalTime : 0;
    return {
      pid: p.pid,
      name: p.name,
      color: p.color,
      arrivalTime: p.arrivalTime,
      burstTime: p.burstTime,
      priority: p.priority,
      completionTime,
      turnaroundTime,
      waitingTime,
      responseTime,
    };
  });

  const aggregate = computeAggregateMetrics(
    'RR',
    `Round Robin (RR, Quantum = ${q})`,
    gantt,
    results,
    contextSwitches
  );
  aggregate.quantum = q;
  return aggregate;
}

/**
 * Priority Scheduling (Non-Preemptive, 1 = Highest Priority)
 */
export function runPriority(processes: Process[]): SchedulerResult {
  const n = processes.length;
  const isCompleted: boolean[] = new Array(n).fill(false);
  const gantt: GanttBlock[] = [];
  const results: ProcessResult[] = [];

  let currentTime = 0;
  let completedCount = 0;
  let contextSwitches = 0;

  while (completedCount < n) {
    let highestPriority = Infinity;
    let selectedIndex = -1;

    for (let i = 0; i < n; i++) {
      if (processes[i].arrivalTime <= currentTime && !isCompleted[i]) {
        if (processes[i].priority < highestPriority) {
          highestPriority = processes[i].priority;
          selectedIndex = i;
        } else if (processes[i].priority === highestPriority) {
          if (selectedIndex === -1 || processes[i].arrivalTime < processes[selectedIndex].arrivalTime) {
            selectedIndex = i;
          }
        }
      }
    }

    if (selectedIndex === -1) {
      let nextArrival = Infinity;
      for (let i = 0; i < n; i++) {
        if (!isCompleted[i] && processes[i].arrivalTime > currentTime) {
          nextArrival = Math.min(nextArrival, processes[i].arrivalTime);
        }
      }
      currentTime = nextArrival === Infinity ? currentTime + 1 : nextArrival;
      continue;
    }

    const p = processes[selectedIndex];
    const startTime = currentTime;
    const completionTime = startTime + p.burstTime;
    currentTime = completionTime;
    isCompleted[selectedIndex] = true;
    completedCount++;

    if (gantt.length > 0) contextSwitches++;

    gantt.push({
      pid: p.pid,
      name: p.name,
      color: p.color,
      startTime,
      endTime: completionTime,
    });

    const turnaroundTime = completionTime - p.arrivalTime;
    const waitingTime = turnaroundTime - p.burstTime;
    const responseTime = startTime - p.arrivalTime;

    results.push({
      pid: p.pid,
      name: p.name,
      color: p.color,
      arrivalTime: p.arrivalTime,
      burstTime: p.burstTime,
      priority: p.priority,
      completionTime,
      turnaroundTime,
      waitingTime,
      responseTime,
    });
  }

  return computeAggregateMetrics(
    'PRIORITY_NON_PREEMPTIVE',
    'Priority Scheduling (Non-Preemptive)',
    gantt,
    results,
    contextSwitches
  );
}

/**
 * Runs all algorithms to generate a side-by-side comparison matrix
 */
export function runAllAlgorithms(processes: Process[], quantum: number = 2): SchedulerResult[] {
  return [
    runFCFS(processes),
    runSJF(processes),
    runSRTF(processes),
    runRoundRobin(processes, quantum),
    runPriority(processes),
  ];
}

/**
 * Helper to compute statistical averages
 */
function computeAggregateMetrics(
  algorithm: SchedulingAlgorithm,
  algorithmName: string,
  gantt: GanttBlock[],
  results: ProcessResult[],
  contextSwitches: number
): SchedulerResult {
  const n = results.length || 1;
  const avgWaitingTime = Number((results.reduce((sum, r) => sum + r.waitingTime, 0) / n).toFixed(2));
  const avgTurnaroundTime = Number((results.reduce((sum, r) => sum + r.turnaroundTime, 0) / n).toFixed(2));
  const avgResponseTime = Number((results.reduce((sum, r) => sum + r.responseTime, 0) / n).toFixed(2));

  const totalExecutionTime = gantt.length > 0 ? gantt[gantt.length - 1].endTime : 0;
  const totalBusyTime = results.reduce((sum, r) => sum + r.burstTime, 0);
  const cpuUtilization = totalExecutionTime > 0 ? Math.min(100, Math.round((totalBusyTime / totalExecutionTime) * 100)) : 100;
  const throughput = totalExecutionTime > 0 ? Number((results.length / totalExecutionTime).toFixed(2)) : 0;

  return {
    algorithm,
    algorithmName,
    gantt,
    processResults: results,
    avgWaitingTime,
    avgTurnaroundTime,
    avgResponseTime,
    totalExecutionTime,
    totalContextSwitches: contextSwitches,
    cpuUtilization,
    throughput,
  };
}
