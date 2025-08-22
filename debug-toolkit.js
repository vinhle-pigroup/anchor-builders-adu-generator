/**
 * 🔧 CLAUDE DEBUG TOOLKIT - One-Click Debugging for Vinh
 * 
 * Usage: Copy-paste this entire script into browser console
 * Run: captureEverything() 
 * Result: Complete debug data copied to clipboard
 */

// 📊 MASTER DEBUG FUNCTION
window.captureEverything = function() {
  console.log('🚀 CAPTURING EVERYTHING...');
  
  const debugData = {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    
    // 🎯 REACT COMPONENT DATA
    react: captureReactData(),
    
    // 💻 CONSOLE LOGS
    console: captureConsoleLogs(),
    
    // 🌐 NETWORK REQUESTS  
    network: captureNetworkData(),
    
    // 💾 STORAGE DATA
    storage: captureStorageData(),
    
    // ⚡ PERFORMANCE METRICS
    performance: capturePerformanceData(),
    
    // ❌ ERRORS & WARNINGS
    errors: captureErrors(),
    
    // 🎨 FORM STATE (Custom for your app)
    formState: captureFormState(),
    
    // 📱 BROWSER INFO
    browser: captureBrowserInfo()
  };
  
  // Copy to clipboard
  const jsonData = JSON.stringify(debugData, null, 2);
  navigator.clipboard.writeText(jsonData).then(() => {
    console.log('✅ DEBUG DATA COPIED TO CLIPBOARD!');
    console.log('📄 Paste into Claude or save as debug-data.json');
    console.log('📊 Data size:', (jsonData.length / 1024).toFixed(1), 'KB');
  });
  
  // Also save to console for manual copy
  console.group('🔍 COMPLETE DEBUG DATA');
  console.log(debugData);
  console.groupEnd();
  
  return debugData;
};

// 🎯 REACT COMPONENT STATE CAPTURE
function captureReactData() {
  try {
    const reactFiber = document.querySelector('[data-reactroot]')?._reactInternalFiber 
      || document.querySelector('#root')?._reactInternalFiber;
    
    return {
      component: window.$r ? {
        name: $r.constructor?.name || $r.type?.name,
        props: $r.props,
        state: $r.state,
        hooks: $r._debugHooksTree,
        fiber: {
          key: $r.key,
          type: $r.type?.name,
          memoizedProps: $r.memoizedProps,
          memoizedState: $r.memoizedState
        }
      } : 'No component selected',
      
      // Enhanced React debugging
      profileData: window.reactProfileData || [],
      devTools: typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined',
      version: React?.version || 'Unknown',
      
      // Global React state (if available)
      globalState: {
        formData: window.formData || 'Not accessible',
        pricingData: window.pricingData || 'Not accessible'
      }
    };
  } catch (e) {
    return { error: e.message };
  }
}

// 💻 CONSOLE LOGS CAPTURE (Last 50)
function captureConsoleLogs() {
  // Store console logs in array
  if (!window.debugLogs) {
    window.debugLogs = [];
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.log = function(...args) {
      window.debugLogs.push({ type: 'log', timestamp: Date.now(), args });
      originalLog.apply(console, args);
    };
    
    console.error = function(...args) {
      window.debugLogs.push({ type: 'error', timestamp: Date.now(), args });
      originalError.apply(console, args);
    };
    
    console.warn = function(...args) {
      window.debugLogs.push({ type: 'warn', timestamp: Date.now(), args });
      originalWarn.apply(console, args);
    };
  }
  
  return window.debugLogs.slice(-50); // Last 50 logs
}

// 🌐 NETWORK REQUESTS CAPTURE
function captureNetworkData() {
  return {
    navigation: performance.getEntriesByType('navigation'),
    resources: performance.getEntriesByType('resource').slice(-20), // Last 20
    fetch: window.fetchRequests || [] // Custom if tracking fetch
  };
}

// 💾 STORAGE DATA CAPTURE
function captureStorageData() {
  return {
    localStorage: Object.fromEntries(Object.entries(localStorage)),
    sessionStorage: Object.fromEntries(Object.entries(sessionStorage)),
    cookies: document.cookie
  };
}

// ⚡ PERFORMANCE METRICS CAPTURE
function capturePerformanceData() {
  return {
    timing: performance.timing,
    memory: performance.memory,
    navigation: performance.getEntriesByType('navigation')[0],
    marks: performance.getEntriesByType('mark'),
    measures: performance.getEntriesByType('measure')
  };
}

// ❌ ERRORS CAPTURE
function captureErrors() {
  if (!window.capturedErrors) {
    window.capturedErrors = [];
    window.addEventListener('error', (e) => {
      window.capturedErrors.push({
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        stack: e.error?.stack,
        timestamp: Date.now()
      });
    });
  }
  
  return window.capturedErrors;
}

// 🎨 FORM STATE CAPTURE (Custom for Anchor Builders)
function captureFormState() {
  try {
    return {
      // Try to get React state from common selectors
      formData: window.formData || 'Not accessible',
      pricingData: window.pricingData || 'Not accessible',
      
      // DOM form values
      inputs: Array.from(document.querySelectorAll('input')).map(input => ({
        name: input.name,
        type: input.type,
        value: input.value,
        checked: input.checked
      })),
      
      buttons: Array.from(document.querySelectorAll('button')).map(btn => ({
        text: btn.textContent?.trim().substring(0, 50),
        className: btn.className,
        disabled: btn.disabled
      }))
    };
  } catch (e) {
    return { error: e.message };
  }
}

// 📱 BROWSER INFO CAPTURE
function captureBrowserInfo() {
  return {
    userAgent: navigator.userAgent,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    screen: {
      width: screen.width,
      height: screen.height
    },
    url: window.location.href,
    referrer: document.referrer
  };
}

// 🎯 QUICK ACTIONS
window.quickDebug = {
  // Quick React state capture
  react: () => {
    const data = captureReactData();
    console.log('🎯 React Data:', data);
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    return data;
  },
  
  // Quick form state capture
  form: () => {
    const data = captureFormState();
    console.log('🎨 Form Data:', data);
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    return data;
  },
  
  // Quick console logs
  logs: () => {
    const data = captureConsoleLogs();
    console.log('💻 Console Logs:', data);
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    return data;
  }
};

// 🚀 ADVANCED DEBUGGING HELPERS
window.debugHelpers = {
  // Track state changes
  trackStateChanges: () => {
    if (!window.stateTracker) {
      window.stateTracker = [];
      console.log('🔍 State change tracking enabled. Changes will be logged.');
    }
  },
  
  // Monitor specific component
  monitorComponent: (componentName) => {
    console.log(`👀 Monitoring ${componentName} renders...`);
    // This gets enhanced when React DevTools is available
  },
  
  // Capture Clear Data operation specifically
  captureClearData: () => {
    console.log('🗑️ Starting Clear Data capture...');
    
    // Capture before state
    const beforeState = {
      timestamp: Date.now(),
      formState: captureFormState(),
      react: captureReactData()
    };
    
    console.log('📊 Before Clear Data:', beforeState);
    
    // Return function to capture after state
    return () => {
      const afterState = {
        timestamp: Date.now(),
        formState: captureFormState(),
        react: captureReactData()
      };
      
      const comparison = {
        before: beforeState,
        after: afterState,
        duration: afterState.timestamp - beforeState.timestamp
      };
      
      console.log('📊 After Clear Data:', afterState);
      console.log('🔄 Clear Data Comparison:', comparison);
      
      navigator.clipboard.writeText(JSON.stringify(comparison, null, 2));
      console.log('✅ Clear Data comparison copied to clipboard!');
      
      return comparison;
    };
  },

  // 🔍 COMPREHENSIVE SYSTEM INSPECTION
  fullSystemScan: () => {
    console.log('🔬 FULL SYSTEM SCAN STARTING...');
    
    const scan = {
      timestamp: Date.now(),
      
      // DOM Analysis
      dom: {
        totalElements: document.querySelectorAll('*').length,
        inputs: document.querySelectorAll('input').length,
        buttons: document.querySelectorAll('button').length,
        forms: document.querySelectorAll('form').length,
        images: document.querySelectorAll('img').length,
        scripts: document.querySelectorAll('script').length,
        stylesheets: document.querySelectorAll('link[rel="stylesheet"]').length,
        reactComponents: document.querySelectorAll('[data-reactroot], .react-component').length
      },
      
      // Window Global Analysis
      globals: {
        reactPresent: typeof React !== 'undefined',
        reactDOMPresent: typeof ReactDOM !== 'undefined',
        vitePresent: typeof __vite__ !== 'undefined',
        customGlobals: Object.keys(window).filter(key => 
          !key.startsWith('webkit') && 
          !key.startsWith('chrome') && 
          !['location', 'document', 'console', 'navigator'].includes(key)
        ).slice(0, 20)
      },
      
      // Event Listeners
      events: {
        clickHandlers: document.querySelectorAll('[onclick]').length,
        eventListeners: getEventListeners ? 'Available' : 'Not accessible'
      },
      
      // API/Network State
      network: {
        onlineStatus: navigator.onLine,
        connectionType: navigator.connection?.effectiveType || 'unknown',
        serviceWorker: 'serviceWorker' in navigator,
        webSockets: window.WebSocket ? 'Available' : 'Not available'
      },
      
      // Memory & Performance
      system: {
        memory: performance.memory ? {
          used: `${Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)}MB`,
          total: `${Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)}MB`,
          limit: `${Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)}MB`
        } : 'Not available',
        timing: performance.timing.loadEventEnd - performance.timing.navigationStart,
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        devicePixelRatio: window.devicePixelRatio
      }
    };
    
    console.log('🔬 SYSTEM SCAN COMPLETE:', scan);
    navigator.clipboard.writeText(JSON.stringify(scan, null, 2)).catch(() => {});
    return scan;
  },

  // 🎯 ADVANCED EVENT MONITORING
  monitorAllEvents: (duration = 30000) => {
    console.log(`🎧 Monitoring ALL events for ${duration/1000} seconds...`);
    
    const events = [];
    const eventTypes = ['click', 'keydown', 'keyup', 'change', 'input', 'focus', 'blur', 'submit', 'load', 'resize', 'scroll'];
    
    const handlers = eventTypes.map(type => {
      const handler = (e) => {
        events.push({
          type,
          timestamp: Date.now(),
          target: e.target.tagName,
          className: e.target.className,
          id: e.target.id,
          value: e.target.value || e.target.textContent?.substring(0, 50)
        });
      };
      
      document.addEventListener(type, handler, { capture: true, passive: true });
      return { type, handler };
    });
    
    setTimeout(() => {
      handlers.forEach(({type, handler}) => {
        document.removeEventListener(type, handler, { capture: true });
      });
      
      console.log(`🎧 Event monitoring complete. Captured ${events.length} events:`, events);
      navigator.clipboard.writeText(JSON.stringify(events, null, 2)).catch(() => {});
    }, duration);
    
    return events;
  },

  // 🔥 ERROR INJECTION (for testing error handling)
  injectTestError: () => {
    console.log('💥 Injecting test error...');
    setTimeout(() => {
      throw new Error('🧪 TEST ERROR: This is a controlled test error for debugging purposes');
    }, 100);
  },

  // 📊 PERFORMANCE BENCHMARK
  performanceBenchmark: () => {
    console.log('⚡ Running performance benchmark...');
    
    const start = performance.now();
    
    // CPU test
    let cpuResult = 0;
    for (let i = 0; i < 100000; i++) {
      cpuResult += Math.sqrt(i);
    }
    
    const cpuTime = performance.now() - start;
    
    // DOM test
    const domStart = performance.now();
    for (let i = 0; i < 100; i++) {
      const div = document.createElement('div');
      document.body.appendChild(div);
      document.body.removeChild(div);
    }
    const domTime = performance.now() - domStart;
    
    // Memory test
    const memoryBefore = performance.memory?.usedJSHeapSize || 0;
    const largeArray = new Array(10000).fill('test data for memory benchmark');
    const memoryAfter = performance.memory?.usedJSHeapSize || 0;
    
    const benchmark = {
      cpu: `${cpuTime.toFixed(2)}ms`,
      dom: `${domTime.toFixed(2)}ms`,
      memory: `${Math.round((memoryAfter - memoryBefore) / 1024)}KB`,
      overall: cpuTime < 50 && domTime < 10 ? '✅ Good' : '⚠️ Slow'
    };
    
    console.log('⚡ Performance benchmark results:', benchmark);
    return benchmark;
  },

  // 🎮 STRESS TEST
  stressTest: () => {
    console.log('🎮 Running stress test...');
    
    // Rapid DOM updates
    let counter = 0;
    const stressInterval = setInterval(() => {
      counter++;
      
      // Trigger re-renders
      if (window.React) {
        document.dispatchEvent(new CustomEvent('stress-test-event', { detail: counter }));
      }
      
      // Random DOM access
      document.querySelectorAll('*')[Math.floor(Math.random() * 10)];
      
      if (counter >= 100) {
        clearInterval(stressInterval);
        console.log('🎮 Stress test completed: 100 iterations');
      }
    }, 50);
    
    return `Stress test running for ${counter} iterations...`;
  }
};

// 🌟 ULTIMATE DEBUGGING SHORTCUTS
window.debug = {
  // One-click everything
  all: () => captureEverything(),
  
  // Quick targeted debugging
  react: () => quickDebug.react(),
  form: () => quickDebug.form(),
  logs: () => quickDebug.logs(),
  network: () => captureNetworkData(),
  performance: () => exportReactProfileData(),
  
  // System analysis
  scan: () => debugHelpers.fullSystemScan(),
  benchmark: () => debugHelpers.performanceBenchmark(),
  events: (duration) => debugHelpers.monitorAllEvents(duration),
  stress: () => debugHelpers.stressTest(),
  
  // Testing utilities
  error: () => debugHelpers.injectTestError(),
  clear: () => debugHelpers.captureClearData(),
  
  // 🎯 CUSTOM APP DEBUGGING
  appState: () => {
    return {
      timestamp: Date.now(),
      formInputs: Array.from(document.querySelectorAll('input, select, textarea')).map(el => ({
        name: el.name || el.id,
        type: el.type,
        value: el.value,
        checked: el.checked,
        className: el.className
      })),
      buttons: Array.from(document.querySelectorAll('button')).map(btn => ({
        text: btn.textContent?.trim().substring(0, 30),
        className: btn.className,
        disabled: btn.disabled,
        type: btn.type
      })),
      localStorage: Object.fromEntries(Object.entries(localStorage)),
      sessionStorage: Object.fromEntries(Object.entries(sessionStorage)),
      url: window.location.href,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      userAgent: navigator.userAgent.substring(0, 100)
    };
  },
  
  // 📊 VISUAL DEBUGGING
  highlight: (selector) => {
    document.querySelectorAll(selector).forEach(el => {
      el.style.outline = '3px solid red';
      el.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
    });
    console.log(`🎨 Highlighted ${document.querySelectorAll(selector).length} elements matching: ${selector}`);
  },
  
  unhighlight: () => {
    document.querySelectorAll('*').forEach(el => {
      el.style.outline = '';
      el.style.backgroundColor = '';
    });
    console.log('🎨 Removed all highlights');
  },
  
  // 🔍 DOM INSPECTOR
  inspect: (selector) => {
    const elements = document.querySelectorAll(selector);
    const analysis = Array.from(elements).map(el => ({
      tag: el.tagName,
      id: el.id,
      className: el.className,
      textContent: el.textContent?.substring(0, 50),
      attributes: Array.from(el.attributes).map(attr => `${attr.name}="${attr.value}"`),
      styles: {
        display: getComputedStyle(el).display,
        visibility: getComputedStyle(el).visibility,
        position: getComputedStyle(el).position,
        zIndex: getComputedStyle(el).zIndex
      }
    }));
    
    console.log(`🔍 DOM Analysis for "${selector}":`, analysis);
    navigator.clipboard.writeText(JSON.stringify(analysis, null, 2)).catch(() => {});
    return analysis;
  },
  
  // 🎮 INTERACTION TESTING
  clickAll: (selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el, index) => {
      setTimeout(() => {
        console.log(`🖱️ Clicking element ${index + 1}/${elements.length}:`, el);
        el.click();
      }, index * 500);
    });
    return `Clicking ${elements.length} elements with 500ms delay between each`;
  },
  
  // 📱 RESPONSIVE TESTING
  mobile: () => {
    Object.assign(document.documentElement.style, {
      width: '375px',
      height: '667px',
      overflow: 'hidden'
    });
    window.dispatchEvent(new Event('resize'));
    console.log('📱 Switched to mobile view (375x667)');
  },
  
  desktop: () => {
    Object.assign(document.documentElement.style, {
      width: '100%',
      height: '100%',
      overflow: 'auto'
    });
    window.dispatchEvent(new Event('resize'));
    console.log('🖥️ Switched to desktop view');
  },
  
  // 🚨 EMERGENCY DEBUGGING
  emergency: () => {
    console.log('🚨 EMERGENCY DEBUG PROTOCOL ACTIVATED');
    
    const emergency = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      errors: window.capturedErrors || [],
      lastLogs: window.debugLogs?.slice(-10) || [],
      reactState: captureReactData(),
      formState: debug.appState(),
      systemScan: debugHelpers.fullSystemScan(),
      performance: debugHelpers.performanceBenchmark()
    };
    
    // Force copy to clipboard
    const data = JSON.stringify(emergency, null, 2);
    navigator.clipboard.writeText(data).then(() => {
      console.log('🚨 EMERGENCY DATA COPIED TO CLIPBOARD!');
    }).catch(() => {
      console.log('🚨 CLIPBOARD FAILED - EMERGENCY DATA IN CONSOLE:', emergency);
    });
    
    return emergency;
  }
};

console.log(`
🎯 ULTIMATE CLAUDE DEBUG TOOLKIT LOADED!

🚀 QUICK ACCESS (just type "debug."):
• debug.all()        → Everything (same as captureEverything)
• debug.react()      → React components only
• debug.form()       → Form state only
• debug.logs()       → Console logs only
• debug.scan()       → Full system scan
• debug.appState()   → Current app state snapshot

🔧 ADVANCED DEBUGGING:
• debug.benchmark()  → Performance benchmark
• debug.events(30)   → Monitor events for 30 seconds
• debug.stress()     → Stress test the app
• debug.error()      → Inject test error
• debug.clear()      → Before/after clear data capture

🎨 VISUAL DEBUGGING:
• debug.highlight('button')   → Highlight all buttons
• debug.unhighlight()         → Remove highlights
• debug.inspect('.my-class')  → Analyze DOM elements

🎮 INTERACTION TESTING:
• debug.clickAll('button')    → Auto-click all buttons
• debug.mobile()              → Switch to mobile view
• debug.desktop()             → Switch to desktop view

🚨 EMERGENCY:
• debug.emergency()   → Capture EVERYTHING for critical issues

📝 CLEAR DATA DEBUGGING (if needed):
1. const after = debug.clear()
2. Click Clear Data button  
3. after() → Compare before/after

✅ EVERYTHING IS READY! Just type debug.[function] for anything!
`);