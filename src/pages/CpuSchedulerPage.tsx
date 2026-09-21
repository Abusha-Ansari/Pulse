import React, { useState, useMemo } from 'react';
import { useTracker } from '../context/TrackerContext';
import { getDateString } from '../utils/timeFormatters';
import {
  Process,
  SchedulerResult,
  SchedulingAlgorithm,
} from '../types/scheduler';
import {
  TEXTBOOK_WORKLOAD,
  convertRecordsToProcesses,
  runFCFS,
  runSJF,
  runSRTF,
  runRoundRobin,
  runPriority,
  runAllAlgorithms,
} from '../utils/cpuSchedulerEngine';
import { Card, CardHeader } from '../components/ui/Card';
import {
  Cpu,
  Layers,
  Clock,
  Zap,
  BarChart3,
  Sliders,
  CheckCircle2,
  BookOpen,
  Info,
  RotateCcw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Plus,
  Trash2,
} from 'lucide-react';

export const CpuSchedulerPage: React.FC = () => {
  const { records } = useTracker();
  const todayStr = getDateString(new Date());

  // Workload Source State: 'real' | 'textbook' | 'custom'
  const [workloadSource, setWorkloadSource] = useState<'real' | 'textbook' | 'custom'>('real');

  // Custom Processes State
  const [customProcesses, setCustomProcesses] = useState<Process[]>([
    { id: 'c1', pid: 'P1', name: 'Code Editor', category: 'Dev', color: '#3B82F6', iconName: 'Code', arrivalTime: 0, burstTime: 6, priority: 2 },
    { id: 'c2', pid: 'P2', name: 'Database Query', category: 'Dev', color: '#10B981', iconName: 'Terminal', arrivalTime: 1, burstTime: 3, priority: 1 },
    { id: 'c3', pid: 'P3', name: 'Video Call', category: 'Comm', color: '#EC4899', iconName: 'Video', arrivalTime: 2, burstTime: 7, priority: 4 },
    { id: 'c4', pid: 'P4', name: 'Browser Tab', category: 'Browsing', color: '#F59E0B', iconName: 'Globe', arrivalTime: 4, burstTime: 2, priority: 3 },
  ]);

  // Active Algorithm Tab
  const [activeAlgorithm, setActiveAlgorithm] = useState<SchedulingAlgorithm | 'COMPARE'>('RR');
  const [timeQuantum, setTimeQuantum] = useState<number>(3);
  const [showTheory, setShowTheory] = useState<boolean>(true);

  // Active Process Workload
  const activeWorkload: Process[] = useMemo(() => {
    if (workloadSource === 'textbook') return TEXTBOOK_WORKLOAD;
    if (workloadSource === 'custom') return customProcesses;
    return convertRecordsToProcesses(records, todayStr, 7);
  }, [workloadSource, records, todayStr, customProcesses]);

  // Compute Results
  const currentResult: SchedulerResult = useMemo(() => {
    switch (activeAlgorithm) {
      case 'FCFS':
        return runFCFS(activeWorkload);
      case 'SJF':
        return runSJF(activeWorkload);
      case 'SRTF':
        return runSRTF(activeWorkload);
      case 'RR':
        return runRoundRobin(activeWorkload, timeQuantum);
      case 'PRIORITY_NON_PREEMPTIVE':
      case 'PRIORITY_PREEMPTIVE':
        return runPriority(activeWorkload);
      default:
        return runRoundRobin(activeWorkload, timeQuantum);
    }
  }, [activeAlgorithm, activeWorkload, timeQuantum]);

  // Compare All Results
  const comparisonResults = useMemo(() => {
    return runAllAlgorithms(activeWorkload, timeQuantum);
  }, [activeWorkload, timeQuantum]);

  const bestAlgorithm = useMemo(() => {
    return [...comparisonResults].sort((a, b) => a.avgWaitingTime - b.avgWaitingTime)[0];
  }, [comparisonResults]);

  // Add custom process helper
  const handleAddCustomProcess = () => {
    const nextIndex = customProcesses.length + 1;
    const newProc: Process = {
      id: `c_${Date.now()}`,
      pid: `P${nextIndex}`,
      name: `Process ${nextIndex}`,
      category: 'General',
      color: '#6366F1',
      iconName: 'Activity',
      arrivalTime: customProcesses.length > 0 ? customProcesses[customProcesses.length - 1].arrivalTime + 1 : 0,
      burstTime: 4,
      priority: 3,
    };
    setCustomProcesses([...customProcesses, newProc]);
  };

  const handleRemoveCustomProcess = (id: string) => {
    if (customProcesses.length <= 1) return;
    setCustomProcesses(customProcesses.filter((p) => p.id !== id));
  };

  const handleUpdateCustomProcess = (id: string, field: keyof Process, value: any) => {
    setCustomProcesses(
      customProcesses.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  return (
    <div id="cpu-scheduler-page" className="space-y-6 animate-fade-in">
      {/* Top Academic Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1E293B]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
              OS & System Software Laboratory
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Discrete Event Simulator
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Cpu className="w-6 h-6 text-indigo-400" />
            CPU Scheduling Simulator
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Directly translates application session telemetry into classical Operating System Process Control Blocks (PCBs) to evaluate CPU scheduling algorithms, Turnaround Time ($TAT$), Waiting Time ($WT$), and context switch overhead.
          </p>
        </div>

        {/* Workload Source Switcher */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-[#0F1420] border border-[#1E293B] p-1 rounded-xl">
          <button
            id="workload-source-real"
            onClick={() => setWorkloadSource('real')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              workloadSource === 'real'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Today's Live Sessions
          </button>
          <button
            id="workload-source-textbook"
            onClick={() => setWorkloadSource('textbook')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              workloadSource === 'textbook'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Textbook Benchmark
          </button>
          <button
            id="workload-source-custom"
            onClick={() => setWorkloadSource('custom')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              workloadSource === 'custom'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Custom Workload
          </button>
        </div>
      </div>

      {/* Custom Workload Editor (if selected) */}
      {workloadSource === 'custom' && (
        <Card id="custom-workload-editor-card">
          <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
            <div>
              <h2 className="text-sm font-bold text-slate-200">Process Control Table (Custom Workload)</h2>
              <p className="text-xs text-slate-400">Configure Arrival Times, CPU Burst Times, and Priority Levels for each process.</p>
            </div>
            <button
              onClick={handleAddCustomProcess}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Process
            </button>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-slate-400 border-b border-[#1E293B]">
                  <th className="py-2 px-3">PID</th>
                  <th className="py-2 px-3">Process Name</th>
                  <th className="py-2 px-3">Arrival Time (AT)</th>
                  <th className="py-2 px-3">Burst Time (BT)</th>
                  <th className="py-2 px-3">Priority (1 = High)</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]">
                {customProcesses.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2 px-3 font-mono font-bold text-indigo-400">{p.pid}</td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={p.name}
                        onChange={(e) => handleUpdateCustomProcess(p.id, 'name', e.target.value)}
                        className="bg-[#0B0F17] border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs w-36"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min="0"
                        max="30"
                        value={p.arrivalTime}
                        onChange={(e) => handleUpdateCustomProcess(p.id, 'arrivalTime', Math.max(0, parseInt(e.target.value, 10) || 0))}
                        className="bg-[#0B0F17] border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs w-20 font-mono"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={p.burstTime}
                        onChange={(e) => handleUpdateCustomProcess(p.id, 'burstTime', Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="bg-[#0B0F17] border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs w-20 font-mono"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={p.priority}
                        onChange={(e) => handleUpdateCustomProcess(p.id, 'priority', Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="bg-[#0B0F17] border border-slate-800 rounded px-2 py-1 text-slate-200 text-xs w-20 font-mono"
                      />
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={() => handleRemoveCustomProcess(p.id)}
                        disabled={customProcesses.length <= 1}
                        className="text-rose-400 hover:text-rose-300 disabled:opacity-30 p-1"
                        title="Delete Process"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Algorithm Navigation Tabs & Quantum Controller */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#161D2B] border border-[#1E293B] p-2 rounded-2xl shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            id="algo-tab-rr"
            onClick={() => setActiveAlgorithm('RR')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeAlgorithm === 'RR'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Round Robin (RR)
          </button>
          <button
            id="algo-tab-fcfs"
            onClick={() => setActiveAlgorithm('FCFS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeAlgorithm === 'FCFS'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            FCFS
          </button>
          <button
            id="algo-tab-sjf"
            onClick={() => setActiveAlgorithm('SJF')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeAlgorithm === 'SJF'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            SJF (Non-Preemptive)
          </button>
          <button
            id="algo-tab-srtf"
            onClick={() => setActiveAlgorithm('SRTF')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeAlgorithm === 'SRTF'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            SRTF (Preemptive SJF)
          </button>
          <button
            id="algo-tab-priority"
            onClick={() => setActiveAlgorithm('PRIORITY_NON_PREEMPTIVE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeAlgorithm === 'PRIORITY_NON_PREEMPTIVE'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Priority Scheduling
          </button>
          <button
            id="algo-tab-compare"
            onClick={() => setActiveAlgorithm('COMPARE')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeAlgorithm === 'COMPARE'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-emerald-400 hover:bg-emerald-500/10'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Comparison Matrix
          </button>
        </div>

        {/* Quantum Slider (only when RR or Compare is active) */}
        {(activeAlgorithm === 'RR' || activeAlgorithm === 'COMPARE') && (
          <div className="flex items-center gap-2 bg-[#0F1420] px-3 py-1.5 rounded-xl border border-[#1E293B] shrink-0">
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[11px] font-semibold text-slate-300">Time Quantum (q):</span>
            <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/15 px-2 py-0.5 rounded border border-indigo-500/30">
              {timeQuantum}
            </span>
            <input
              type="range"
              min="1"
              max="8"
              step="1"
              value={timeQuantum}
              onChange={(e) => setTimeQuantum(parseInt(e.target.value, 10))}
              className="w-20 accent-indigo-500 cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {activeAlgorithm !== 'COMPARE' ? (
        <div className="space-y-6">
          {/* Key OS Performance Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Average Waiting Time */}
            <div
              id="metric-card-awt"
              className="p-4 rounded-2xl bg-[#161D2B] border border-[#1E293B] relative overflow-hidden"
            >
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                Avg Waiting Time (AWT)
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-emerald-400 tracking-tight">
                  {currentResult.avgWaitingTime}
                </span>
                <span className="text-xs text-slate-400">time units</span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono mt-1">
                AWT = (1/N) * Σ(TAT - BT)
              </p>
            </div>

            {/* Average Turnaround Time */}
            <div
              id="metric-card-atat"
              className="p-4 rounded-2xl bg-[#161D2B] border border-[#1E293B] relative overflow-hidden"
            >
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                Avg Turnaround Time (TAT)
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-indigo-400 tracking-tight">
                  {currentResult.avgTurnaroundTime}
                </span>
                <span className="text-xs text-slate-400">time units</span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono mt-1">
                TAT = (1/N) * Σ(CT - AT)
              </p>
            </div>

            {/* Context Switches */}
            <div
              id="metric-card-context-switches"
              className="p-4 rounded-2xl bg-[#161D2B] border border-[#1E293B] relative overflow-hidden"
            >
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                Context Switches
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-amber-400 tracking-tight">
                  {currentResult.totalContextSwitches}
                </span>
                <span className="text-xs text-slate-400">switches</span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono mt-1">
                CPU Scheduler Preemption Overhead
              </p>
            </div>

            {/* CPU Utilization & Total Time */}
            <div
              id="metric-card-cpu-util"
              className="p-4 rounded-2xl bg-[#161D2B] border border-[#1E293B] relative overflow-hidden"
            >
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                CPU Utilization & Span
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-purple-400 tracking-tight">
                  {currentResult.cpuUtilization}%
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  (T={currentResult.totalExecutionTime})
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono mt-1">
                Throughput: {currentResult.throughput} proc/unit
              </p>
            </div>
          </div>

          {/* CPU Execution Gantt Chart */}
          <Card id="gantt-chart-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#1E293B]">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  CPU Execution Gantt Chart: {currentResult.algorithmName}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visual timeline representing scheduled process quanta on the CPU timeline.
                </p>
              </div>
              <span className="font-mono text-xs text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
                Total Makespan: {currentResult.totalExecutionTime} units
              </span>
            </div>

            {/* Horizontal Timeline Visualization */}
            <div className="mt-6 overflow-x-auto pb-4">
              <div className="min-w-[650px]">
                {/* Gantt Bar Slices */}
                <div className="flex h-14 w-full rounded-xl overflow-hidden border border-[#1E293B] shadow-inner bg-[#0B0F17] p-1 gap-1">
                  {currentResult.gantt.map((block, idx) => {
                    const duration = block.endTime - block.startTime;
                    const flexGrow = Math.max(1, duration);

                    return (
                      <div
                        key={idx}
                        className="group relative h-full rounded-lg flex flex-col items-center justify-center transition-transform hover:scale-[1.02] cursor-pointer shadow-sm text-center px-1"
                        style={{
                          flex: `${flexGrow} 0 0%`,
                          backgroundColor: `${block.color}25`,
                          borderColor: `${block.color}60`,
                          borderWidth: '1px',
                        }}
                      >
                        <span
                          className="font-mono font-bold text-xs tracking-tight truncate w-full"
                          style={{ color: block.color }}
                        >
                          {block.pid}
                        </span>
                        <span className="text-[10px] text-slate-300 truncate w-full opacity-80">
                          {block.name.split(' ')[0]}
                        </span>

                        {/* Hover Tooltip */}
                        <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 bg-[#0F1420] text-slate-200 border border-slate-700 px-2.5 py-1 rounded-lg text-[10px] font-mono shadow-xl whitespace-nowrap">
                          {block.pid}: {block.name} [{block.startTime} → {block.endTime}] ({duration} units)
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Time Axis Markers */}
                <div className="relative flex justify-between mt-2 px-1 text-[11px] font-mono text-slate-500">
                  <span>0</span>
                  {currentResult.gantt.map((block, idx) => (
                    <span key={idx} className="font-semibold text-slate-400">
                      {block.endTime}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Process Accounting & Results Table */}
          <Card id="process-accounting-table-card">
            <CardHeader
              title="Process Execution Accounting Table"
              subtitle="Detailed completion, turnaround, and waiting times calculated per process"
            />

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1E293B] text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Process</th>
                    <th className="py-3 px-3">Application</th>
                    <th className="py-3 px-3 font-mono">Arrival (AT)</th>
                    <th className="py-3 px-3 font-mono">Burst (BT)</th>
                    <th className="py-3 px-3 font-mono">Priority</th>
                    <th className="py-3 px-3 font-mono text-indigo-400">Completion (CT)</th>
                    <th className="py-3 px-3 font-mono text-indigo-400">Turnaround (TAT)</th>
                    <th className="py-3 px-3 font-mono text-emerald-400">Waiting (WT)</th>
                    <th className="py-3 px-3 font-mono text-slate-300">Response (RT)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]">
                  {currentResult.processResults.map((pr) => (
                    <tr key={pr.pid} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3">
                        <span
                          className="font-mono font-bold px-2 py-0.5 rounded border text-[11px]"
                          style={{
                            color: pr.color,
                            backgroundColor: `${pr.color}15`,
                            borderColor: `${pr.color}35`,
                          }}
                        >
                          {pr.pid}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-200">{pr.name}</td>
                      <td className="py-3 px-3 font-mono text-slate-400">{pr.arrivalTime}</td>
                      <td className="py-3 px-3 font-mono text-slate-300 font-bold">{pr.burstTime}</td>
                      <td className="py-3 px-3 font-mono text-slate-400">{pr.priority}</td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-100">{pr.completionTime}</td>
                      <td className="py-3 px-3 font-mono font-bold text-indigo-400">{pr.turnaroundTime}</td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-400">{pr.waitingTime}</td>
                      <td className="py-3 px-3 font-mono text-slate-400">{pr.responseTime}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-[#1E293B] bg-[#0B0F17]/50 font-bold">
                    <td colSpan={6} className="py-3 px-3 text-right uppercase tracking-wider text-[11px] text-slate-400">
                      Arithmetic Mean (Averages):
                    </td>
                    <td className="py-3 px-3 font-mono text-indigo-400 text-sm">
                      {currentResult.avgTurnaroundTime}
                    </td>
                    <td className="py-3 px-3 font-mono text-emerald-400 text-sm">
                      {currentResult.avgWaitingTime}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400 text-sm">
                      {currentResult.avgResponseTime}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </div>
      ) : (
        /* Algorithm Comparison View */
        <div className="space-y-6">
          {/* Recommendation Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-transparent border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                  Optimal Algorithm Recommendation
                </span>
                <p className="text-sm font-bold text-slate-100 mt-0.5">
                  {bestAlgorithm.algorithmName} achieved the lowest Average Waiting Time ({bestAlgorithm.avgWaitingTime} time units).
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block font-mono text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl font-bold">
              Min AWT: {bestAlgorithm.avgWaitingTime}
            </span>
          </div>

          {/* Comparative Table */}
          <Card id="comparative-matrix-card">
            <CardHeader
              title="Side-by-Side Algorithm Benchmark Matrix"
              subtitle="Comparing scheduling performance across identical input process streams"
            />

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#1E293B] text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Scheduling Algorithm</th>
                    <th className="py-3 px-3 font-mono text-emerald-400">Avg Waiting Time (AWT)</th>
                    <th className="py-3 px-3 font-mono text-indigo-400">Avg Turnaround Time (TAT)</th>
                    <th className="py-3 px-3 font-mono text-slate-300">Avg Response Time (RT)</th>
                    <th className="py-3 px-3 font-mono text-amber-400">Context Switches</th>
                    <th className="py-3 px-3 font-mono text-purple-400">CPU Utilization</th>
                    <th className="py-3 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]">
                  {comparisonResults.map((res) => {
                    const isBest = res.algorithm === bestAlgorithm.algorithm;

                    return (
                      <tr
                        key={res.algorithm}
                        className={`transition-colors ${
                          isBest ? 'bg-emerald-500/5 font-semibold' : 'hover:bg-slate-800/20'
                        }`}
                      >
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-200">{res.algorithmName}</span>
                            {isBest && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                Best AWT
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 font-mono font-bold text-emerald-400 text-sm">
                          {res.avgWaitingTime}
                        </td>
                        <td className="py-3.5 px-3 font-mono font-bold text-indigo-400 text-sm">
                          {res.avgTurnaroundTime}
                        </td>
                        <td className="py-3.5 px-3 font-mono text-slate-300">
                          {res.avgResponseTime}
                        </td>
                        <td className="py-3.5 px-3 font-mono text-amber-400">
                          {res.totalContextSwitches}
                        </td>
                        <td className="py-3.5 px-3 font-mono text-purple-400">
                          {res.cpuUtilization}%
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <button
                            onClick={() => setActiveAlgorithm(res.algorithm)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                          >
                            Inspect Gantt
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Educational OS Theory Reference Panel */}
      <Card id="os-theory-guide-card">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setShowTheory(!showTheory)}
        >
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-bold text-slate-200">
              Operating System Scheduling Principles & Formulas
            </h2>
          </div>
          <span className="text-xs text-indigo-400 font-semibold hover:underline">
            {showTheory ? 'Hide Reference' : 'Show Reference'}
          </span>
        </div>

        {showTheory && (
          <div className="mt-4 pt-4 border-t border-[#1E293B] grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400">
            <div className="p-3.5 rounded-xl bg-[#0F1420] border border-[#1E293B] space-y-2">
              <span className="font-bold text-slate-200 block text-xs">Standard Evaluation Formulas</span>
              <ul className="space-y-1 font-mono text-[11px] text-slate-300">
                <li>• Turnaround Time: <span className="text-indigo-400">TAT = CT - AT</span></li>
                <li>• Waiting Time: <span className="text-emerald-400">WT = TAT - BT</span></li>
                <li>• Response Time: <span className="text-slate-300">RT = t_first - AT</span></li>
              </ul>
              <p className="text-[11px] text-slate-400 mt-2">
                Turnaround Time measures total time elapsed from process arrival to termination. Waiting time reflects inactive time spent in the Ready Queue.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0F1420] border border-[#1E293B] space-y-2">
              <span className="font-bold text-slate-200 block text-xs">The Convoy Effect & Starvation</span>
              <p className="text-[11px] leading-relaxed">
                In <strong>FCFS</strong>, a long CPU-bound process can delay short I/O-bound jobs, known as the <em>Convoy Effect</em>. In <strong>SJF/Priority</strong>, shorter or higher-priority processes can cause prolonged starvation for long processes, typically resolved via <em>Aging</em>.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0F1420] border border-[#1E293B] space-y-2">
              <span className="font-bold text-slate-200 block text-xs">Round Robin & Quantum Tuning ($q$)</span>
              <p className="text-[11px] leading-relaxed">
                If quantum $q \to \infty$, Round Robin degenerates into FCFS. If $q$ is extremely small, CPU context switch overhead dominates throughput. The optimal quantum generally captures 80% of CPU bursts without preemption.
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
