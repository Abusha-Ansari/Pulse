import { Application, UsageRecord } from '../types/tracker';
import { getDateString } from '../utils/timeFormatters';

/**
 * Generates realistic historical session records for the specified number of days
 */
export function generateMockHistory(
  applications: Application[],
  daysCount: number = 14
): UsageRecord[] {
  const records: UsageRecord[] = [];
  const now = new Date();

  // Map apps for quick lookup
  const appMap = new Map(applications.map((a) => [a.id, a]));

  for (let dayOffset = daysCount - 1; dayOffset >= 0; dayOffset--) {
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() - dayOffset);
    const dateStr = getDateString(targetDate);
    const isWeekend = targetDate.getDay() === 0 || targetDate.getDay() === 6;
    const isToday = dayOffset === 0;

    // Weekdays typically have 7-9 hours of active computer work, weekends 1.5 - 3 hours
    const startHour = isWeekend ? 10 + Math.floor(Math.random() * 2) : 8 + (Math.random() > 0.5 ? 1 : 0);
    const endHourLimit = isToday 
      ? Math.max(startHour + 1, now.getHours()) 
      : (isWeekend ? 17 + Math.floor(Math.random() * 3) : 18 + Math.floor(Math.random() * 3));

    let currentCursor = new Date(targetDate);
    currentCursor.setHours(startHour, Math.floor(Math.random() * 20), 0, 0);

    const endOfDay = new Date(targetDate);
    if (isToday) {
      // Don't generate past right now minus 15 minutes (to leave room for the live active session)
      endOfDay.setTime(now.getTime() - 12 * 60 * 1000);
    } else {
      endOfDay.setHours(endHourLimit, Math.floor(Math.random() * 50), 0, 0);
    }

    let sessionIndex = 0;

    while (currentCursor < endOfDay) {
      sessionIndex++;
      const currentHour = currentCursor.getHours();

      // Lunch break simulation around 12:30 - 13:30
      if (!isWeekend && currentHour === 12 && currentCursor.getMinutes() >= 30 && Math.random() > 0.3) {
        const breakMinutes = 35 + Math.floor(Math.random() * 25);
        currentCursor = new Date(currentCursor.getTime() + breakMinutes * 60 * 1000);
        continue;
      }

      // Pick an app based on realistic weights
      const chosenApp = pickWeightedApp(applications, isWeekend, currentHour);
      if (!chosenApp) break;

      // Realistic duration based on app type:
      // VS Code & Figma have deep work sessions (20 to 65 mins)
      // Slack / Discord / Chrome have shorter bursts (3 to 18 mins)
      // Zoom meetings are 25 to 50 mins
      let sessionMinutes = 15;
      if (chosenApp.id === 'vscode' || chosenApp.id === 'terminal') {
        sessionMinutes = 20 + Math.floor(Math.random() * 45);
      } else if (chosenApp.id === 'figma' || chosenApp.id === 'notion') {
        sessionMinutes = 15 + Math.floor(Math.random() * 35);
      } else if (chosenApp.id === 'zoom') {
        sessionMinutes = 25 + Math.floor(Math.random() * 25);
      } else if (chosenApp.id === 'slack' || chosenApp.id === 'discord') {
        sessionMinutes = 4 + Math.floor(Math.random() * 14);
      } else if (chosenApp.id === 'spotify') {
        sessionMinutes = 10 + Math.floor(Math.random() * 20);
      } else {
        sessionMinutes = 8 + Math.floor(Math.random() * 25);
      }

      // Calculate start and end
      const startTime = new Date(currentCursor);
      const endTime = new Date(currentCursor.getTime() + sessionMinutes * 60 * 1000);

      // If exceeds endOfDay, clip it
      if (endTime > endOfDay) {
        const diffSeconds = Math.floor((endOfDay.getTime() - startTime.getTime()) / 1000);
        if (diffSeconds > 120) {
          records.push({
            id: `hist_${dateStr}_${sessionIndex}`,
            appId: chosenApp.id,
            applicationName: chosenApp.name,
            category: chosenApp.category,
            productivityType: chosenApp.productivityType,
            startTime: startTime.toISOString(),
            endTime: endOfDay.toISOString(),
            durationSeconds: diffSeconds,
            date: dateStr,
          });
        }
        break;
      }

      const durationSeconds = sessionMinutes * 60;
      records.push({
        id: `hist_${dateStr}_${sessionIndex}`,
        appId: chosenApp.id,
        applicationName: chosenApp.name,
        category: chosenApp.category,
        productivityType: chosenApp.productivityType,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        durationSeconds: durationSeconds,
        date: dateStr,
      });

      // Advance cursor + small gap (1 to 5 mins of pause or immediate switch)
      const gapSeconds = Math.random() > 0.4 ? Math.floor(Math.random() * 180) : 10;
      currentCursor = new Date(endTime.getTime() + gapSeconds * 1000);
    }
  }

  return records;
}

function pickWeightedApp(apps: Application[], isWeekend: boolean, hour: number): Application {
  const weights: Record<string, number> = {};

  apps.forEach((a) => {
    let weight = 10;
    if (a.id === 'vscode') weight = isWeekend ? 8 : 35;
    else if (a.id === 'figma') weight = isWeekend ? 5 : 20;
    else if (a.id === 'chrome') weight = 22;
    else if (a.id === 'slack') weight = isWeekend ? 2 : (hour >= 9 && hour <= 17 ? 18 : 6);
    else if (a.id === 'terminal') weight = isWeekend ? 6 : 16;
    else if (a.id === 'notion') weight = isWeekend ? 10 : 15;
    else if (a.id === 'zoom') weight = isWeekend ? 0 : (hour >= 10 && hour <= 16 ? 12 : 2);
    else if (a.id === 'github') weight = isWeekend ? 4 : 10;
    else if (a.id === 'spotify') weight = isWeekend ? 18 : 8;
    else if (a.id === 'discord') weight = isWeekend ? 25 : 8;

    weights[a.id] = weight;
  });

  const totalWeight = apps.reduce((sum, app) => sum + (weights[app.id] || 10), 0);
  let randomVal = Math.random() * totalWeight;

  for (const app of apps) {
    const w = weights[app.id] || 10;
    if (randomVal <= w) return app;
    randomVal -= w;
  }

  return apps[0];
}
