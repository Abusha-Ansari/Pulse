# Pulse — Workspace Telemetry, Productivity Analytics & CPU Scheduling Laboratory

> **Minor Project**: A dual-purpose computer science system bridging high-level workspace activity telemetry with low-level Operating Systems & System Software concepts.

---

## 📌 Executive Summary

**Pulse** is a full-stack workspace telemetry and productivity tracking platform paired with an interactive **Operating System CPU Scheduling Laboratory**.

The system addresses two key dimensions:
1. **Real-World Consumer & Enterprise Utility**: Solves the modern developer problem of cognitive fragmentation, digital burnout, and application context-switching by tracking foreground task execution, idle timeouts, and weekly pacing.
2. **Academic & Systems Engineering Rigor**: Recognizes that **human task switching mathematically mirrors how an Operating System kernel schedules processes on a CPU**. Pulse translates live session intervals into **Process Control Blocks (PCBs)** to simulate, benchmark, and evaluate classic CPU scheduling algorithms (**Round Robin, FCFS, SJF, SRTF, and Priority Scheduling**).

---

## 🎓 Academic Curriculum Alignment

This project satisfies requirements across three foundational domains of Computer Science & Engineering:

### 1. Operating Systems & System Software (Primary Focus)
* **Process Control Block (PCB)**: Normalizes raw application telemetry into structured PCBs containing Process IDs ($P_1, P_2, \dots$), Arrival Times ($AT$), CPU Burst Times ($BT$), and Priority Classes.
* **Context Switching**: Models task transitions as process context switches, saving previous execution states, flushing elapsed durations to persistent storage, and loading new process contexts.
* **Process State Transitions**: Applications dynamically transition across standard OS process states: `RUNNING` (active foreground execution), `WAITING / BLOCKED` (simulated idle interrupt timeout), and `TERMINATED` (committed session record).
* **Timer Interrupts (Clock Quanta)**: Operates a deterministic background ticker loop acting as an OS timer interrupt that drives telemetry accounting.
* **CPU Scheduling Algorithms**:
  * **First-Come, First-Served (FCFS)**: Demonstrates the classic *Convoy Effect*.
  * **Shortest Job First (SJF - Non-Preemptive)**: Achieves optimal turnaround times for batch workloads.
  * **Shortest Remaining Time First (SRTF - Preemptive SJF)**: Continuously evaluates remaining burst times with dynamic preemption.
  * **Round Robin (RR)**: Features an interactive **Time Quantum ($q$)** controller ($q = 1 \dots 8$) to illustrate the trade-off between responsiveness and context switch overhead.
  * **Priority Scheduling**: Prioritizes jobs based on operational criticality.
* **Standard OS Performance Metrics**:
  * **Turnaround Time**: $TAT = CT - AT$
  * **Waiting Time**: $WT = TAT - BT$
  * **Response Time**: $RT = t_{\text{first}} - AT$
  * **Average Waiting Time**: $AWT = \frac{1}{N} \sum_{i=1}^N WT_i$
  * **Average Turnaround Time**: $ATAT = \frac{1}{N} \sum_{i=1}^N TAT_i$
  * **CPU Utilization & Throughput**: Measures busy CPU time vs. total makespan.

### 2. Data Structures & Algorithms (DSA)
* **$O(1)$ Hash Map Aggregations**: Uses hash maps (`Map<string, AppUsageSummary>`) to aggregate thousands of chronological session events across applications and categories in linear time $O(N)$ instead of $O(N \cdot M)$ brute force.
* **Interval Discretization**: Slices continuous, variable-length time intervals $[t_{\text{start}}, t_{\text{end}}]$ across fixed 24-hour buckets to resolve boundary crossings for heatmaps and timeline audit logs.
* **Queue Data Structures**: Ready queues and arrival queues are managed as FIFO structures and priority-sorted collections within the discrete-event scheduler.
* **Sliding Window & Running Accumulators**: Tracks 7-day rolling averages and calculates required daily focus burn rates.

### 3. Software Testing & Quality Assurance (STQA)
* **Boundary Value Analysis (BVA)**: Handles edge cases such as midnight date rollovers (23:59 to 00:01), zero-duration sessions, single-quantum preemption boundaries, and 24-hour timeline caps.
* **Invariant Enforcements**: Validates that cumulative daily usage cannot exceed 24 hours, percentages remain strictly bounded between 0% and 100%, and timestamps maintain strict monotonicity ($t_{\text{end}} \ge t_{\text{start}}$).
* **Deterministic Simulation**: A configurable mock generation engine produces realistic historical datasets to stress-test UI visualizers without requiring external physical sensor feeds.

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                              │
│  Dashboard (Gantt, Metrics, Goal) │ Applications │ Timeline │ Analytics│
│  └── Interactive CPU Scheduling Laboratory (RR, FCFS, SJF, SRTF)       │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │ React State & Hooks
┌───────────────────────────────────┴────────────────────────────────────┐
│                    ANALYTICS & AGGREGATION ENGINE                      │
│  - Interval Discretization (24h Bucketing)   - Pacing & Velocity Logic │
│  - Hash-Map App Aggregators (O(1))           - Time Series Calculators │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │
┌───────────────────────────────────┴────────────────────────────────────┐
│                 SIMULATION & TELEMETRY ENGINE                          │
│  - Periodic Tick Interrupt (Clock Quanta)    - Context Switch Manager  │
│  - 3-State Machine (Running, Idle, Finished) - Probabilistic Sampler   │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │
┌───────────────────────────────────┴────────────────────────────────────┐
│                  OS SCHEDULING DISCRETE SIMULATOR                      │
│  - Process Normalizer (Telemetry → PCB)      - RR, FCFS, SJF, SRTF     │
│  - Quantum Preemption Engine                 - TAT, AWT, Context Switch│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Feature Highlights

### 1. Real-Time Telemetry & Context-Switch Engine
* Tracks the currently running foreground application.
* Real-time timer increments active session burst times.
* Manual and automatic **activity simulation** triggers context switches between applications (e.g., VS Code $\to$ Slack $\to$ Figma).
* Configurable idle detection marks inactive intervals.

### 2. 24-Hour Visual Session Gantt Timeline
* Provides a continuous, chronological timeline of daily activity.
* Categorizes sessions by productivity weighting (Productive, Neutral, Distracting).
* Features hover tooltips with exact start/end timestamps and durations.

### 3. Weekly Focus Goal & Velocity Pacing
* Sets and monitors weekly productive hour targets (e.g., 30 hours).
* Computes remaining hours, progress percentage, and dynamic daily burn-rate pacing across remaining days.
* 7-day micro-meter visualizer highlights daily contributions.

### 4. Interactive CPU Scheduling Laboratory
* **Three Workload Modes**:
  1. *Today's Live Sessions*: Translates recorded user activity into scheduling jobs.
  2. *Textbook Benchmark*: Canonical 5-process benchmark used in standard operating system literature.
  3. *Custom Workload*: Interactive table allowing creation, modification, and deletion of custom processes $(PID, AT, BT, PR)$.
* **Algorithm Selection**: Instant simulation of Round Robin, FCFS, Non-Preemptive SJF, Preemptive SRTF, and Priority Scheduling.
* **Gantt Chart**: Visualizes time slices and preemption blocks with hover inspection.
* **Accounting Table**: Displays complete metrics per process $(AT, BT, PR, CT, TAT, WT, RT)$ with arithmetic averages.
* **Side-by-Side Comparison Matrix**: Runs all algorithms concurrently on identical workloads and flags the optimal algorithm with minimal $AWT$.

---

## 🎤 Presentation & Viva Walkthrough Guide

Use this script during your minor project evaluation:

### Step 1: The Hook & Real-World Motivation (60 seconds)
> *"Good morning, Professor. Today, I am presenting **Pulse**.*
>
> *In modern software development, cognitive fragmentation and digital burnout are major challenges. Developers switch tasks every few minutes, introducing high switching costs.*
>
> *Pulse is a workspace telemetry and productivity tracking platform. But more importantly for our computer science curriculum: **we recognized that how a human switches between tasks is mathematically identical to how an Operating System kernel schedules processes on a CPU.**"*

### Step 2: Live Demo — Productivity & Telemetry Layer (2 minutes)
1. **Dashboard & Active Process**:
   > *"In the Dashboard, you can see our live foreground process. The background engine acts as a hardware clock interrupt, accumulating burst duration in real time."*
2. **Context Switching**:
   > *"When the user switches from VS Code to Slack, our system performs an application-level context switch: saving the previous session's state and timestamps, and initializing a new process state."*
3. **Session Gantt & Weekly Goal**:
   > *"The 24-hour visual Gantt discretizes time intervals across the day, while the Weekly Goal engine calculates the daily burn rate required to meet target focus hours."*

### Step 3: The Technical Core — CPU Scheduling Laboratory (3 minutes)
1. **Process Normalization**:
   > *"In the CPU Scheduler tab, we convert today's recorded sessions into formal Process Control Blocks (PCBs) with Arrival Times, Burst Times, and Priorities."*
2. **Round Robin & Quantum Tuning**:
   > *"Here is Round Robin. As we adjust the Time Quantum slider ($q = 1 \dots 8$), you can observe how a smaller quantum increases context switch overhead, while a larger quantum approaches FCFS. This visually demonstrates the fundamental OS trade-off between responsiveness and preemption overhead."*
3. **Accounting Table & Comparative Matrix**:
   > *"Below the Gantt chart, our accounting table calculates exact Turnaround Time ($TAT$), Waiting Time ($WT$), and Response Time ($RT$) for every process. The Comparison Matrix runs all five algorithms simultaneously and identifies the optimal algorithm for minimal Average Waiting Time."*

---

## ❓ Frequently Asked Viva Questions & Model Answers

**Q1: How does this project reflect Data Structures & Algorithms?**
> *"We use Hash Maps for $O(1)$ multi-dimensional aggregation across thousands of historical records, avoiding $O(N^2)$ lookups. We implement interval discretization to split continuous session spans across hourly buckets, and manage ready queues as FIFO structures and priority-sorted collections within the discrete-event scheduler."*

**Q2: Why did you implement preemption in SRTF and Round Robin?**
> *"In real-time operating systems, preemption prevents long, CPU-bound processes from starving short, interactive jobs (the Convoy Effect). In our engine, SRTF checks remaining burst times at each time unit, preempting whenever a shorter job arrives. Round Robin enforces time-slicing via configurable quantum limits."*

**Q3: Can this connect to real operating system processes instead of a simulator?**
> *"Yes. The architecture is intentionally decoupled. The `TrackerContext` consumes standard session objects with process names, start times, and durations. Connecting a lightweight desktop daemon (such as an Electron native hook or Node.js `ps-list`) would feed live OS process data directly into the exact same analytics and scheduling pipelines."*

**Q4: What is the practical value of applying CPU scheduling to human workflow?**
> *"It provides algorithmic insight into task management. Just as an OS uses Shortest Job First to minimize Average Waiting Time across background jobs, developers can apply SJF or Round Robin principles to schedule backlog tasks and minimize cognitive context-switch penalties."*

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 18 (TypeScript), Vite |
| **Styling & Design System** | Tailwind CSS (Dark-canvas aesthetic, mathematical border radii) |
| **Icons & Visuals** | Lucide React |
| **State Management** | React Context API with persistent `localStorage` serialization |
| **Algorithms & Engine** | Custom discrete-event simulation & CPU scheduling engine |

---

## 💻 Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd pulse
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

4. **Verify and build for production**:
   ```bash
   npm run lint
   npm run build
   ```

---

## 📄 License
This project is developed as part of an academic Minor Project curriculum. Released under the MIT License.
