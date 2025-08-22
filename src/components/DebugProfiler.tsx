import React, { Profiler, ProfilerOnRenderCallback } from 'react';

/**
 * 🔍 DEBUG PROFILER - Wraps components to capture React performance data
 * 
 * Usage: <DebugProfiler id="ComponentName"><YourComponent /></DebugProfiler>
 */

interface ProfileData {
  id: string;
  phase: 'mount' | 'update';
  actualDuration: number;
  baseDuration: number;
  startTime: number;
  commitTime: number;
  interactions: Set<any>;
}

// Store profile data globally for easy access
declare global {
  interface Window {
    reactProfileData: ProfileData[];
  }
}

if (!window.reactProfileData) {
  window.reactProfileData = [];
}

const onRenderCallback: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime,
  interactions
) => {
  const profileData: ProfileData = {
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime,
    interactions,
  };

  // Store in global array
  window.reactProfileData.push(profileData);

  // Keep only last 100 entries
  if (window.reactProfileData.length > 100) {
    window.reactProfileData = window.reactProfileData.slice(-100);
  }

  // Log slow renders (>16ms = 60fps threshold)
  if (actualDuration > 16) {
    console.warn(`🐌 Slow render detected:`, {
      component: id,
      duration: `${actualDuration.toFixed(2)}ms`,
      phase,
      reason: phase === 'update' ? 'State/Props changed' : 'Initial mount'
    });
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`⚛️ [${id}] ${phase} render: ${actualDuration.toFixed(2)}ms`, {
      phase,
      actualDuration,
      baseDuration,
      startTime,
      commitTime
    });
  }
};

interface DebugProfilerProps {
  id: string;
  children: React.ReactNode;
  enabled?: boolean;
}

export const DebugProfiler: React.FC<DebugProfilerProps> = ({ 
  id, 
  children, 
  enabled = process.env.NODE_ENV === 'development' 
}) => {
  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <Profiler id={id} onRender={onRenderCallback}>
      {children}
    </Profiler>
  );
};

// Helper function to export profile data
window.exportReactProfileData = () => {
  const data = {
    timestamp: new Date().toISOString(),
    profileData: window.reactProfileData,
    summary: {
      totalRenders: window.reactProfileData.length,
      slowRenders: window.reactProfileData.filter(p => p.actualDuration > 16).length,
      averageDuration: window.reactProfileData.reduce((sum, p) => sum + p.actualDuration, 0) / window.reactProfileData.length,
      components: [...new Set(window.reactProfileData.map(p => p.id))]
    }
  };

  navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  console.log('📊 React Profile Data copied to clipboard!', data.summary);
  return data;
};

// Helper to clear profile data
window.clearReactProfileData = () => {
  window.reactProfileData = [];
  console.log('🗑️ React profile data cleared');
};