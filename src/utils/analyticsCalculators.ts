import { 
  UsageRecord, 
  ActiveSession, 
  DayMetricOverview, 
  HourlyActivity 
} from '../types/tracker';
import { getDateString, getRelativeDateLabel, formatHourDisplay } from './timeFormatters';

export interface AppUsageSummary {
  appId: string;
  name: string;
  category: string;
  productivityType: 'Productive' | 'Neutral' | 'Distracting';
  color: string;
  iconName: string;
  totalSeconds: number;
  sessionCount: number;
  percentage: number;
}

export interface CategorySummary {
  category: string;
  totalSeconds: number;
  percentage: number;
  color: string;
}

export function calculateDayMetrics(
  records: UsageRecord[],
  activeSession: ActiveSession | null,
  targetDate: string,
  yesterdayDate: string
): DayMetricOverview {
  const dayRecords = records.filter((r) => r.date === targetDate);
  const yesterdayRecords = records.filter((r) => r.date === yesterdayDate);

  let focusTime = 0;
  let neutralTime = 0;
  let distractingTime = 0;
  let idleTime = 0;
  let sessionsCount = dayRecords.length;

  dayRecords.forEach((r) => {
    if (r.isIdle) {
      idleTime += r.durationSeconds;
    } else if (r.productivityType === 'Productive') {
      focusTime += r.durationSeconds;
    } else if (r.productivityType === 'Neutral') {
      neutralTime += r.durationSeconds;
    } else if (r.productivityType === 'Distracting') {
      distractingTime += r.durationSeconds;
    }
  });

  const todayStr = getDateString(new Date());
  if (targetDate === todayStr && activeSession) {
    sessionsCount += 1;
    if (activeSession.isIdle) {
      idleTime += activeSession.durationSeconds;
    } else if (activeSession.productivityType === 'Productive') {
      focusTime += activeSession.durationSeconds;
    } else if (activeSession.productivityType === 'Neutral') {
      neutralTime += activeSession.durationSeconds;
    } else if (activeSession.productivityType === 'Distracting') {
      distractingTime += activeSession.durationSeconds;
    }
  }

  const totalActiveScreenTime = focusTime + neutralTime + distractingTime;
  const totalScreenTime = totalActiveScreenTime + idleTime;

  // Productivity Score Calculation: 
  // Focus counts 100%, Neutral counts 40%, Distracting counts 0%
  const weightedProductive = focusTime + (neutralTime * 0.35);
  const productivityScore = totalActiveScreenTime > 0
    ? Math.min(100, Math.max(0, Math.round((weightedProductive / totalActiveScreenTime) * 100)))
    : 85;

  // Calculate yesterday total
  let yesterdayTotal = 0;
  yesterdayRecords.forEach((r) => {
    yesterdayTotal += r.durationSeconds;
  });

  const yesterdayDiffPercent = yesterdayTotal > 0
    ? Math.round(((totalActiveScreenTime - yesterdayTotal) / yesterdayTotal) * 100)
    : 0;

  return {
    date: targetDate,
    totalScreenTimeSeconds: totalActiveScreenTime,
    focusTimeSeconds: focusTime,
    idleTimeSeconds: idleTime,
    neutralTimeSeconds: neutralTime,
    distractingTimeSeconds: distractingTime,
    productivityScore,
    yesterdayDiffPercent,
    totalSessionsCount: sessionsCount,
  };
}

export function getTopApplications(
  records: UsageRecord[],
  activeSession: ActiveSession | null,
  targetDate?: string,
  limit: number = 5
): AppUsageSummary[] {
  const filtered = targetDate ? records.filter((r) => r.date === targetDate) : records;
  const map = new Map<string, {
    appId: string;
    name: string;
    category: string;
    productivityType: 'Productive' | 'Neutral' | 'Distracting';
    totalSeconds: number;
    sessionCount: number;
    color: string;
    iconName: string;
  }>();

  filtered.forEach((r) => {
    if (r.isIdle) return;
    const existing = map.get(r.appId) || {
      appId: r.appId,
      name: r.applicationName,
      category: r.category,
      productivityType: r.productivityType,
      totalSeconds: 0,
      sessionCount: 0,
      color: '#6366F1',
      iconName: 'AppWindow',
    };
    existing.totalSeconds += r.durationSeconds;
    existing.sessionCount += 1;
    map.set(r.appId, existing);
  });

  const todayStr = getDateString(new Date());
  if ((!targetDate || targetDate === todayStr) && activeSession && !activeSession.isIdle) {
    const existing = map.get(activeSession.appId) || {
      appId: activeSession.appId,
      name: activeSession.applicationName,
      category: activeSession.category,
      productivityType: activeSession.productivityType,
      totalSeconds: 0,
      sessionCount: 0,
      color: activeSession.color,
      iconName: activeSession.iconName,
    };
    existing.totalSeconds += activeSession.durationSeconds;
    map.set(activeSession.appId, existing);
  }

  const items = Array.from(map.values());
  const grandTotal = items.reduce((sum, item) => sum + item.totalSeconds, 0);

  items.sort((a, b) => b.totalSeconds - a.totalSeconds);

  return items.slice(0, limit).map((item) => ({
    ...item,
    percentage: grandTotal > 0 ? Math.round((item.totalSeconds / grandTotal) * 100) : 0,
  }));
}

export function getCategoryBreakdown(
  records: UsageRecord[],
  activeSession: ActiveSession | null,
  targetDate?: string,
  categoryColorMap: Record<string, string> = {}
): CategorySummary[] {
  const filtered = targetDate ? records.filter((r) => r.date === targetDate) : records;
  const map = new Map<string, number>();

  filtered.forEach((r) => {
    if (r.isIdle) return;
    map.set(r.category, (map.get(r.category) || 0) + r.durationSeconds);
  });

  const todayStr = getDateString(new Date());
  if ((!targetDate || targetDate === todayStr) && activeSession && !activeSession.isIdle) {
    map.set(activeSession.category, (map.get(activeSession.category) || 0) + activeSession.durationSeconds);
  }

  const total = Array.from(map.values()).reduce((sum, s) => sum + s, 0);

  return Array.from(map.entries())
    .map(([cat, secs]) => ({
      category: cat,
      totalSeconds: secs,
      percentage: total > 0 ? Math.round((secs / total) * 100) : 0,
      color: categoryColorMap[cat] || '#6366F1',
    }))
    .sort((a, b) => b.totalSeconds - a.totalSeconds);
}

export function getDailyScreenTimeTrend(
  records: UsageRecord[],
  activeSession: ActiveSession | null,
  daysCount: number = 7
) {
  const result: Array<{
    date: string;
    label: string;
    totalHours: number;
    productiveHours: number;
    neutralHours: number;
    distractingHours: number;
    score: number;
  }> = [];

  const now = new Date();
  const todayStr = getDateString(now);

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dateStr = getDateString(d);
    const label = getRelativeDateLabel(dateStr);

    const dayRecords = records.filter((r) => r.date === dateStr);
    let prodSec = 0;
    let neutSec = 0;
    let distSec = 0;

    dayRecords.forEach((r) => {
      if (r.productivityType === 'Productive') prodSec += r.durationSeconds;
      else if (r.productivityType === 'Neutral') neutSec += r.durationSeconds;
      else if (r.productivityType === 'Distracting') distSec += r.durationSeconds;
    });

    if (dateStr === todayStr && activeSession && !activeSession.isIdle) {
      if (activeSession.productivityType === 'Productive') prodSec += activeSession.durationSeconds;
      else if (activeSession.productivityType === 'Neutral') neutSec += activeSession.durationSeconds;
      else if (activeSession.productivityType === 'Distracting') distSec += activeSession.durationSeconds;
    }

    const totalSec = prodSec + neutSec + distSec;
    const score = totalSec > 0 ? Math.round(((prodSec + 0.35 * neutSec) / totalSec) * 100) : 80;

    result.push({
      date: dateStr,
      label,
      totalHours: Number((totalSec / 3600).toFixed(1)),
      productiveHours: Number((prodSec / 3600).toFixed(1)),
      neutralHours: Number((neutSec / 3600).toFixed(1)),
      distractingHours: Number((distSec / 3600).toFixed(1)),
      score,
    });
  }

  return result;
}

export function getHourlyHeatmap(
  records: UsageRecord[],
  activeSession: ActiveSession | null,
  targetDate: string,
  is24h: boolean = false
): HourlyActivity[] {
  const hoursMap: HourlyActivity[] = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    label: formatHourDisplay(hour, is24h),
    productiveSeconds: 0,
    neutralSeconds: 0,
    distractingSeconds: 0,
    idleSeconds: 0,
    totalSeconds: 0,
  }));

  const dayRecords = records.filter((r) => r.date === targetDate);

  dayRecords.forEach((r) => {
    const start = new Date(r.startTime);
    const end = new Date(r.endTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return;

    const startHour = start.getHours();
    const endHour = end.getHours();

    if (startHour === endHour) {
      const h = hoursMap[startHour];
      if (h) {
        if (r.isIdle) h.idleSeconds += r.durationSeconds;
        else if (r.productivityType === 'Productive') h.productiveSeconds += r.durationSeconds;
        else if (r.productivityType === 'Neutral') h.neutralSeconds += r.durationSeconds;
        else if (r.productivityType === 'Distracting') h.distractingSeconds += r.durationSeconds;
        h.totalSeconds += r.durationSeconds;
      }
    } else {
      // Span across hours simply distribute
      for (let hIndex = startHour; hIndex <= Math.min(23, endHour); hIndex++) {
        const h = hoursMap[hIndex];
        const approxSeconds = Math.round(r.durationSeconds / (endHour - startHour + 1));
        if (h) {
          if (r.productivityType === 'Productive') h.productiveSeconds += approxSeconds;
          else if (r.productivityType === 'Neutral') h.neutralSeconds += approxSeconds;
          else if (r.productivityType === 'Distracting') h.distractingSeconds += approxSeconds;
          h.totalSeconds += approxSeconds;
        }
      }
    }
  });

  const todayStr = getDateString(new Date());
  if (targetDate === todayStr && activeSession) {
    const currentHour = new Date().getHours();
    const h = hoursMap[currentHour];
    if (h) {
      if (activeSession.isIdle) h.idleSeconds += activeSession.durationSeconds;
      else if (activeSession.productivityType === 'Productive') h.productiveSeconds += activeSession.durationSeconds;
      else if (activeSession.productivityType === 'Neutral') h.neutralSeconds += activeSession.durationSeconds;
      else if (activeSession.productivityType === 'Distracting') h.distractingSeconds += activeSession.durationSeconds;
      h.totalSeconds += activeSession.durationSeconds;
    }
  }

  return hoursMap;
}

export interface WeeklyDayProgress {
  dayLabel: string;
  dateStr: string;
  productiveSeconds: number;
  productiveHours: number;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
}

export interface WeeklyGoalProgress {
  mode: 'calendar' | 'rolling';
  currentProductiveSeconds: number;
  currentProductiveHours: number;
  targetHours: number;
  remainingHours: number;
  remainingSeconds: number;
  percentage: number;
  isGoalMet: boolean;
  surplusHours: number;
  daysRemainingInWeek: number;
  dailyPaceNeededHours: number;
  dailyAverageAchievedHours: number;
  weekRangeLabel: string;
  dayProgress: WeeklyDayProgress[];
}

export function getWeeklyProductiveGoalProgress(
  records: UsageRecord[],
  activeSession: ActiveSession | null,
  targetHours: number = 30,
  mode: 'calendar' | 'rolling' = 'calendar'
): WeeklyGoalProgress {
  const now = new Date();
  const todayStr = getDateString(now);

  const dayProgress: WeeklyDayProgress[] = [];
  let totalProductiveSeconds = 0;
  let elapsedDaysCount = 0;
  let weekRangeLabel = '';
  let daysRemainingInWeek = 1;

  if (mode === 'calendar') {
    const currentDay = now.getDay(); // 0 is Sun, 1 is Mon...
    const diffToMonday = currentDay === 0 ? 6 : currentDay - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const startMonth = monday.toLocaleDateString(undefined, { month: 'short' });
    const endMonth = sunday.toLocaleDateString(undefined, { month: 'short' });
    weekRangeLabel =
      startMonth === endMonth
        ? `${startMonth} ${monday.getDate()} – ${sunday.getDate()}`
        : `${startMonth} ${monday.getDate()} – ${endMonth} ${sunday.getDate()}`;

    daysRemainingInWeek = Math.max(1, 7 - diffToMonday);
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = getDateString(d);
      const isToday = dateStr === todayStr;
      const isPast = d < now && !isToday;
      const isFuture = d > now && !isToday;

      const dayRecords = records.filter(
        (r) => r.date === dateStr && r.productivityType === 'Productive' && !r.isIdle
      );
      let daySec = dayRecords.reduce((sum, r) => sum + r.durationSeconds, 0);

      if (isToday && activeSession && !activeSession.isIdle && activeSession.productivityType === 'Productive') {
        daySec += activeSession.durationSeconds;
      }

      if (!isFuture) {
        totalProductiveSeconds += daySec;
        elapsedDaysCount++;
      }

      dayProgress.push({
        dayLabel: dayLabels[i],
        dateStr,
        productiveSeconds: daySec,
        productiveHours: Number((daySec / 3600).toFixed(1)),
        isToday,
        isPast,
        isFuture,
      });
    }
  } else {
    // Rolling 7 days
    daysRemainingInWeek = 1;
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);

    const startMonth = sevenDaysAgo.toLocaleDateString(undefined, { month: 'short' });
    const endMonth = now.toLocaleDateString(undefined, { month: 'short' });
    weekRangeLabel =
      startMonth === endMonth
        ? `Last 7 Days (${startMonth} ${sevenDaysAgo.getDate()} – ${now.getDate()})`
        : `Last 7 Days (${startMonth} ${sevenDaysAgo.getDate()} – ${endMonth} ${now.getDate()})`;

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateStr = getDateString(d);
      const isToday = dateStr === todayStr;
      const isPast = !isToday;
      const isFuture = false;

      const dayRecords = records.filter(
        (r) => r.date === dateStr && r.productivityType === 'Productive' && !r.isIdle
      );
      let daySec = dayRecords.reduce((sum, r) => sum + r.durationSeconds, 0);

      if (isToday && activeSession && !activeSession.isIdle && activeSession.productivityType === 'Productive') {
        daySec += activeSession.durationSeconds;
      }

      totalProductiveSeconds += daySec;
      elapsedDaysCount++;

      dayProgress.push({
        dayLabel: d.toLocaleDateString(undefined, { weekday: 'short' }),
        dateStr,
        productiveSeconds: daySec,
        productiveHours: Number((daySec / 3600).toFixed(1)),
        isToday,
        isPast,
        isFuture,
      });
    }
  }

  const currentProductiveHours = Number((totalProductiveSeconds / 3600).toFixed(1));
  const safeTarget = Math.max(1, targetHours);
  const targetSeconds = safeTarget * 3600;
  const remainingSeconds = Math.max(0, targetSeconds - totalProductiveSeconds);
  const remainingHours = Number((remainingSeconds / 3600).toFixed(1));
  const isGoalMet = totalProductiveSeconds >= targetSeconds;
  const surplusHours = isGoalMet
    ? Number(((totalProductiveSeconds - targetSeconds) / 3600).toFixed(1))
    : 0;
  const percentage = Math.min(100, Math.round((currentProductiveHours / safeTarget) * 100));

  const dailyPaceNeededHours = !isGoalMet && daysRemainingInWeek > 0
    ? Number((remainingHours / daysRemainingInWeek).toFixed(1))
    : 0;

  const dailyAverageAchievedHours = elapsedDaysCount > 0
    ? Number((currentProductiveHours / elapsedDaysCount).toFixed(1))
    : 0;

  return {
    mode,
    currentProductiveSeconds: totalProductiveSeconds,
    currentProductiveHours,
    targetHours: safeTarget,
    remainingHours,
    remainingSeconds,
    percentage,
    isGoalMet,
    surplusHours,
    daysRemainingInWeek,
    dailyPaceNeededHours,
    dailyAverageAchievedHours,
    weekRangeLabel,
    dayProgress,
  };
}

