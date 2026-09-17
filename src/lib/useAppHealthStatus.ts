import { useState, useEffect, useRef } from 'react';

export type AppHealthStatus = 'online' | 'degraded' | 'offline';

export interface AppHealthInfo {
  status: AppHealthStatus;
  latencyMs: number;
  lastChecked: Date;
  uptimePercent: number;
}

// Generate deterministic initial base latency from appId
function getInitialAppHealth(appId: string): AppHealthInfo {
  let hash = 0;
  for (let i = 0; i < appId.length; i++) {
    hash = (hash << 5) - hash + appId.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);
  
  // 95% chance of online, 5% degraded
  const isDegraded = absHash % 20 === 0;
  const isOffline = absHash % 50 === 0;

  const baseLatency = isOffline
    ? 0
    : isDegraded
    ? 120 + (absHash % 80)
    : 8 + (absHash % 42); // 8ms to 50ms realistic local homelab latency

  return {
    status: isOffline ? 'offline' : isDegraded ? 'degraded' : 'online',
    latencyMs: baseLatency,
    lastChecked: new Date(),
    uptimePercent: isOffline ? 88.5 : isDegraded ? 97.8 : 99.9
  };
}

/**
 * Global cache of health statuses so multiple views (grid, list, detail modal) stay in sync
 */
const healthCache: Record<string, AppHealthInfo> = {};

export function useAppHealth(appId: string) {
  const [health, setHealth] = useState<AppHealthInfo>(() => {
    if (!healthCache[appId]) {
      healthCache[appId] = getInitialAppHealth(appId);
    }
    return healthCache[appId];
  });

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!healthCache[appId]) {
      healthCache[appId] = getInitialAppHealth(appId);
      setHealth(healthCache[appId]);
    }

    // Mock polling cycle: Polling every 7-12 seconds with random jitter
    const pollHealth = () => {
      const current = healthCache[appId] || getInitialAppHealth(appId);
      
      if (current.status !== 'offline') {
        // Subtle latency jitter (-4ms to +6ms)
        const jitter = Math.floor(Math.random() * 11) - 4;
        const newLatency = Math.max(4, Math.min(250, current.latencyMs + jitter));
        
        // Rare chance of status fluctuation for realism
        const rand = Math.random();
        let newStatus: AppHealthStatus = 'online';
        if (newLatency > 110 || rand < 0.03) {
          newStatus = 'degraded';
        }

        const updated: AppHealthInfo = {
          ...current,
          status: newStatus,
          latencyMs: newLatency,
          lastChecked: new Date()
        };

        healthCache[appId] = updated;
        setHealth(updated);
      } else {
        // Occasionally recheck offline apps
        if (Math.random() < 0.15) {
          const recovered: AppHealthInfo = {
            status: 'online',
            latencyMs: 14 + Math.floor(Math.random() * 20),
            lastChecked: new Date(),
            uptimePercent: 98.2
          };
          healthCache[appId] = recovered;
          setHealth(recovered);
        }
      }

      // Schedule next poll with jitter (7000ms - 11000ms)
      const nextDelay = 7000 + Math.floor(Math.random() * 4000);
      timerRef.current = window.setTimeout(pollHealth, nextDelay);
    };

    // Stagger initial polling so all cards don't fetch simultaneously
    const initialDelay = 1000 + (Math.abs(appId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % 4000);
    timerRef.current = window.setTimeout(pollHealth, initialDelay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [appId]);

  return health;
}
