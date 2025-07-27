import React, { Suspense } from 'react';
import { LoadingSpinner } from '../components/LoadingSpinner';

// Higher-order component for lazy loading with loading fallback
export function withLazyLoading<T extends object>(
  lazyComponent: React.LazyExoticComponent<React.ComponentType<T>>,
  fallback?: React.ComponentType
) {
  const LazyComponent = React.forwardRef<any, T>((props, ref) => {
    const FallbackComponent = fallback || (() => (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    ));

    return (
      <Suspense fallback={<FallbackComponent />}>
        <lazyComponent.type {...props} ref={ref} />
      </Suspense>
    );
  });

  LazyComponent.displayName = `LazyLoaded(${lazyComponent.type.displayName || lazyComponent.type.name})`;
  
  return LazyComponent;
}

// Preload function for critical components
export function preloadComponent<T>(
  lazyComponent: React.LazyExoticComponent<React.ComponentType<T>>
): Promise<{ default: React.ComponentType<T> }> {
  // This triggers the dynamic import but doesn't render anything
  const componentImport = (lazyComponent as any)._payload._result;
  if (componentImport) {
    return Promise.resolve(componentImport);
  }
  
  // If not already loaded, load it
  return (lazyComponent as any)._payload._result || lazyComponent;
}

// Bundle splitting helper for feature modules
export function createLazyFeature<T extends object>(
  importFunction: () => Promise<{ default: React.ComponentType<T> }>
) {
  return React.lazy(importFunction);
}

// Performance monitoring for lazy loading
export function trackLazyLoadTime(componentName: string) {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    
    // Log performance metrics
    console.log(`[Lazy Load] ${componentName} loaded in ${loadTime.toFixed(2)}ms`);
    
    // Send to analytics if available
    if ('gtag' in window) {
      (window as any).gtag('event', 'lazy_load_timing', {
        component_name: componentName,
        load_time: Math.round(loadTime),
        custom_parameter: 'performance_optimization'
      });
    }
  };
}