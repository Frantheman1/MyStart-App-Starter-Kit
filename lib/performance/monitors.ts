/**
 * Performance Monitoring
 * 
 * Utilities for monitoring app performance.
 * 
 * Usage:
 *   const perf = PerformanceMonitor.getInstance();
 *   perf.startTrace('api-call');
 *   // ... do work
 *   perf.endTrace('api-call');
 */

import { logger } from '@/lib/logging/logger';

interface PerformanceTrace {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private traces: Map<string, PerformanceTrace> = new Map();
  private completedTraces: PerformanceTrace[] = [];
  private maxCompletedTraces = 100;

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Start a performance trace
   */
  startTrace(name: string, metadata?: Record<string, any>): void {
    const trace: PerformanceTrace = {
      name,
      startTime: Date.now(),
      metadata,
    };

    this.traces.set(name, trace);
    logger.debug(`Performance trace started: ${name}`, metadata);
  }

  /**
   * End a performance trace
   */
  endTrace(name: string, metadata?: Record<string, any>): number | null {
    const trace = this.traces.get(name);
    if (!trace) {
      logger.warn(`No trace found with name: ${name}`);
      return null;
    }

    const endTime = Date.now();
    const duration = endTime - trace.startTime;

    const completedTrace: PerformanceTrace = {
      ...trace,
      endTime,
      duration,
      metadata: { ...trace.metadata, ...metadata },
    };

    this.completedTraces.push(completedTrace);
    if (this.completedTraces.length > this.maxCompletedTraces) {
      this.completedTraces.shift();
    }

    this.traces.delete(name);

    logger.debug(`Performance trace completed: ${name}`, {
      duration: `${duration}ms`,
      ...completedTrace.metadata,
    });

    return duration;
  }

  /**
   * Measure a function execution time
   */
  async measure<T>(
    name: string,
    fn: () => Promise<T> | T,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.startTrace(name, metadata);
    try {
      const result = await fn();
      this.endTrace(name, { success: true });
      return result;
    } catch (error) {
      this.endTrace(name, { success: false, error });
      throw error;
    }
  }

  /**
   * Get completed traces
   */
  getCompletedTraces(): PerformanceTrace[] {
    return [...this.completedTraces];
  }

  /**
   * Get active traces
   */
  getActiveTraces(): PerformanceTrace[] {
    return Array.from(this.traces.values());
  }

  /**
   * Clear all traces
   */
  clearTraces(): void {
    this.traces.clear();
    this.completedTraces = [];
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();
