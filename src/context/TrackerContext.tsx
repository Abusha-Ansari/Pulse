import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import {
  Application,
  UsageRecord,
  ActiveSession,
  SimulationSettings,
  UserPreferences,
  SimulationSpeed,
  ProductivityType,
  Category,
} from '../types/tracker';
import { DEFAULT_APPLICATIONS } from '../data/defaultApps';
import { generateMockHistory } from '../data/mockHistoryGenerator';
import { getDateString } from '../utils/timeFormatters';

interface TrackerContextType {
  applications: Application[];
  records: UsageRecord[];
  activeSession: ActiveSession;
  simulationSettings: SimulationSettings;
  userPreferences: UserPreferences;
  // Simulator Controls
  switchActiveApp: (appId: string) => void;
  togglePauseSimulation: () => void;
  setSimulationSpeed: (speed: SimulationSpeed) => void;
  updateSimulationSettings: (settings: Partial<SimulationSettings>) => void;
  updateUserPreferences: (prefs: Partial<UserPreferences>) => void;
  triggerManualBreak: () => void;
  // App Management
  updateAppClassification: (appId: string, productivityType: ProductivityType) => void;
  updateAppCategory: (appId: string, category: Category) => void;
  // Data Management
  resetDataToDefault: () => void;
  generateFreshData: (daysCount?: number) => void;
  exportDataJson: () => string;
  importDataJson: (jsonString: string) => boolean;
  clearAllData: () => void;
}

const STORAGE_KEYS = {
  APPS: 'pulse_applications_v1',
  RECORDS: 'pulse_records_v1',
  SETTINGS: 'pulse_sim_settings_v1',
  PREFS: 'pulse_user_prefs_v1',
  ACTIVE: 'pulse_active_session_v1',
};

const DEFAULT_SETTINGS: SimulationSettings = {
  autoSwitchIntervalSec: 45,
  speed: 1,
  isPaused: false,
  idleSimulationEnabled: true,
};

const DEFAULT_PREFERENCES: UserPreferences = {
  timeFormat: '12h',
  dailyGoalSeconds: 8 * 3600, // 8 hours
  weeklyProductiveGoalHours: 30, // 30 productive hours / week
  notificationAlerts: true,
};

const TrackerContext = createContext<TrackerContextType | undefined>(undefined);

export const TrackerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Applications State
  const [applications, setApplications] = useState<Application[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.APPS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load saved applications', e);
    }
    return DEFAULT_APPLICATIONS;
  });

  // 2. Records History State
  const [records, setRecords] = useState<UsageRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECORDS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load saved records', e);
    }
    // Generate 14-day history on first launch
    return generateMockHistory(DEFAULT_APPLICATIONS, 14);
  });

  // 3. Settings State
  const [simulationSettings, setSimulationSettings] = useState<SimulationSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {
      console.error('Failed to load simulation settings', e);
    }
    return DEFAULT_SETTINGS;
  });

  // 4. Preferences State
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PREFS);
      if (saved) return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
    } catch (e) {
      console.error('Failed to load user preferences', e);
    }
    return DEFAULT_PREFERENCES;
  });

  // 5. Active Session State
  const [activeSession, setActiveSession] = useState<ActiveSession>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load active session', e);
    }
    // Default to VS Code with realistic session start
    const defaultApp = DEFAULT_APPLICATIONS[0]; // VS Code
    const now = new Date();
    const startedAt = new Date(now.getTime() - 862 * 1000).toISOString(); // 14m 22s ago
    return {
      appId: defaultApp.id,
      applicationName: defaultApp.name,
      category: defaultApp.category,
      productivityType: defaultApp.productivityType,
      color: defaultApp.color,
      iconName: defaultApp.iconName,
      durationSeconds: 862, // 14m 22s
      startedAt,
      isIdle: false,
    };
  });

  // Refs for access inside ticker callback without stale closures
  const activeSessionRef = useRef(activeSession);
  activeSessionRef.current = activeSession;

  const simSettingsRef = useRef(simulationSettings);
  simSettingsRef.current = simulationSettings;

  const applicationsRef = useRef(applications);
  applicationsRef.current = applications;

  const elapsedInSessionRef = useRef(activeSession.durationSeconds);

  // Synchronize state changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.APPS, JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(simulationSettings));
  }, [simulationSettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PREFS, JSON.stringify(userPreferences));
  }, [userPreferences]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE, JSON.stringify(activeSession));
  }, [activeSession]);

  // Archive helper
  const archiveSession = useCallback((session: ActiveSession) => {
    if (session.durationSeconds < 2) return; // Ignore accidental micro-ticks
    const now = new Date();
    const startTime = session.startedAt || new Date(now.getTime() - session.durationSeconds * 1000).toISOString();
    const endTime = now.toISOString();
    const date = getDateString(now);

    const newRecord: UsageRecord = {
      id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      appId: session.appId,
      applicationName: session.applicationName,
      category: session.category,
      productivityType: session.productivityType,
      startTime,
      endTime,
      durationSeconds: Math.floor(session.durationSeconds),
      date,
      isIdle: session.isIdle,
    };

    setRecords((prev) => [newRecord, ...prev]);
  }, []);

  // Switch Active App
  const switchActiveApp = useCallback((appId: string) => {
    const current = activeSessionRef.current;
    if (current.appId === appId && !current.isIdle) return;

    // Archive current session
    archiveSession(current);

    const targetApp = applicationsRef.current.find((a) => a.id === appId) || applicationsRef.current[0];
    const newSession: ActiveSession = {
      appId: targetApp.id,
      applicationName: targetApp.name,
      category: targetApp.category,
      productivityType: targetApp.productivityType,
      color: targetApp.color,
      iconName: targetApp.iconName,
      durationSeconds: 0,
      startedAt: new Date().toISOString(),
      isIdle: false,
    };

    elapsedInSessionRef.current = 0;
    setActiveSession(newSession);
  }, [archiveSession]);

  // Trigger Manual Break / Idle
  const triggerManualBreak = useCallback(() => {
    const current = activeSessionRef.current;
    if (current.isIdle) return;

    archiveSession(current);

    const idleSession: ActiveSession = {
      appId: 'idle',
      applicationName: 'Break / Away from Keyboard',
      category: 'System',
      productivityType: 'Neutral',
      color: '#94A3B8',
      iconName: 'Coffee',
      durationSeconds: 0,
      startedAt: new Date().toISOString(),
      isIdle: true,
    };

    elapsedInSessionRef.current = 0;
    setActiveSession(idleSession);
  }, [archiveSession]);

  // Auto-switch picking logic
  const handleAutoSwitch = useCallback(() => {
    const apps = applicationsRef.current;
    const current = activeSessionRef.current;
    const simSettings = simSettingsRef.current;

    // Archive current
    archiveSession(current);

    // Should we simulate a coffee break? (5% chance if idleSimulationEnabled and not already idle)
    if (simSettings.idleSimulationEnabled && !current.isIdle && Math.random() < 0.12) {
      const idleSession: ActiveSession = {
        appId: 'idle',
        applicationName: 'Break / Away from Keyboard',
        category: 'System',
        productivityType: 'Neutral',
        color: '#94A3B8',
        iconName: 'Coffee',
        durationSeconds: 0,
        startedAt: new Date().toISOString(),
        isIdle: true,
      };
      elapsedInSessionRef.current = 0;
      setActiveSession(idleSession);
      return;
    }

    // Pick next app different from current
    const candidates = apps.filter((a) => a.id !== current.appId);
    const nextApp = candidates[Math.floor(Math.random() * candidates.length)] || apps[0];

    const nextSession: ActiveSession = {
      appId: nextApp.id,
      applicationName: nextApp.name,
      category: nextApp.category,
      productivityType: nextApp.productivityType,
      color: nextApp.color,
      iconName: nextApp.iconName,
      durationSeconds: 0,
      startedAt: new Date().toISOString(),
      isIdle: false,
    };

    elapsedInSessionRef.current = 0;
    setActiveSession(nextSession);
  }, [archiveSession]);

  // The Live Activity Simulator Ticker
  useEffect(() => {
    const interval = setInterval(() => {
      const settings = simSettingsRef.current;
      if (settings.isPaused) return;

      const increment = settings.speed;

      setActiveSession((prev) => {
        const nextDuration = prev.durationSeconds + increment;
        elapsedInSessionRef.current += increment;

        // Check if session exceeded auto-switch duration
        if (elapsedInSessionRef.current >= settings.autoSwitchIntervalSec) {
          // Trigger switch on next tick to avoid state collision
          setTimeout(() => handleAutoSwitch(), 0);
        }

        return {
          ...prev,
          durationSeconds: nextDuration,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [handleAutoSwitch]);

  // Control Handlers
  const togglePauseSimulation = () => {
    setSimulationSettings((prev) => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const setSimulationSpeed = (speed: SimulationSpeed) => {
    setSimulationSettings((prev) => ({ ...prev, speed }));
  };

  const updateSimulationSettings = (settings: Partial<SimulationSettings>) => {
    setSimulationSettings((prev) => ({ ...prev, ...settings }));
  };

  const updateUserPreferences = (prefs: Partial<UserPreferences>) => {
    setUserPreferences((prev) => ({ ...prev, ...prefs }));
  };

  const updateAppClassification = (appId: string, productivityType: ProductivityType) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, productivityType } : app))
    );

    // If active session is this app, update it live
    setActiveSession((prev) =>
      prev.appId === appId ? { ...prev, productivityType } : prev
    );

    // Also update recent records so charts react instantly
    setRecords((prev) =>
      prev.map((rec) => (rec.appId === appId ? { ...rec, productivityType } : rec))
    );
  };

  const updateAppCategory = (appId: string, category: Category) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, category } : app))
    );

    setActiveSession((prev) =>
      prev.appId === appId ? { ...prev, category } : prev
    );

    setRecords((prev) =>
      prev.map((rec) => (rec.appId === appId ? { ...rec, category } : rec))
    );
  };

  const resetDataToDefault = () => {
    const defaultApps = DEFAULT_APPLICATIONS;
    const freshRecords = generateMockHistory(defaultApps, 14);
    const defaultApp = defaultApps[0];

    setApplications(defaultApps);
    setRecords(freshRecords);
    setSimulationSettings(DEFAULT_SETTINGS);
    setUserPreferences(DEFAULT_PREFERENCES);

    const now = new Date();
    const newActive: ActiveSession = {
      appId: defaultApp.id,
      applicationName: defaultApp.name,
      category: defaultApp.category,
      productivityType: defaultApp.productivityType,
      color: defaultApp.color,
      iconName: defaultApp.iconName,
      durationSeconds: 862,
      startedAt: new Date(now.getTime() - 862 * 1000).toISOString(),
      isIdle: false,
    };

    setActiveSession(newActive);
    elapsedInSessionRef.current = 862;
  };

  const generateFreshData = (daysCount: number = 30) => {
    const fresh = generateMockHistory(applications, daysCount);
    setRecords(fresh);
  };

  const exportDataJson = () => {
    const exportObject = {
      exportVersion: '1.0',
      exportedAt: new Date().toISOString(),
      applications,
      records,
      simulationSettings,
      userPreferences,
    };
    return JSON.stringify(exportObject, null, 2);
  };

  const importDataJson = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.applications)) {
        setApplications(data.applications);
      }
      if (Array.isArray(data.records)) {
        setRecords(data.records);
      }
      if (data.simulationSettings) {
        setSimulationSettings(data.simulationSettings);
      }
      if (data.userPreferences) {
        setUserPreferences(data.userPreferences);
      }
      return true;
    } catch (e) {
      console.error('Failed to import JSON data', e);
      return false;
    }
  };

  const clearAllData = () => {
    setRecords([]);
    setActiveSession({
      appId: applications[0].id,
      applicationName: applications[0].name,
      category: applications[0].category,
      productivityType: applications[0].productivityType,
      color: applications[0].color,
      iconName: applications[0].iconName,
      durationSeconds: 0,
      startedAt: new Date().toISOString(),
      isIdle: false,
    });
    elapsedInSessionRef.current = 0;
  };

  return (
    <TrackerContext.Provider
      value={{
        applications,
        records,
        activeSession,
        simulationSettings,
        userPreferences,
        switchActiveApp,
        togglePauseSimulation,
        setSimulationSpeed,
        updateSimulationSettings,
        updateUserPreferences,
        triggerManualBreak,
        updateAppClassification,
        updateAppCategory,
        resetDataToDefault,
        generateFreshData,
        exportDataJson,
        importDataJson,
        clearAllData,
      }}
    >
      {children}
    </TrackerContext.Provider>
  );
};

export const useTracker = (): TrackerContextType => {
  const context = useContext(TrackerContext);
  if (!context) {
    throw new Error('useTracker must be used within a TrackerProvider');
  }
  return context;
};
