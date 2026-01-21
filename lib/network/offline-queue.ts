/**
 * Offline Queue
 * 
 * Queue API requests when offline and retry when back online.
 * 
 * Usage:
 *   const queue = OfflineQueue.getInstance();
 *   await queue.add(() => apiClient.post('/data', payload));
 */

import { logger } from '@/lib/logging/logger';

interface QueuedRequest {
  id: string;
  request: () => Promise<any>;
  timestamp: number;
  retries: number;
  maxRetries: number;
}

export class OfflineQueue {
  private static instance: OfflineQueue;
  private queue: QueuedRequest[] = [];
  private isProcessing = false;
  private maxQueueSize = 50;

  private constructor() {}

  static getInstance(): OfflineQueue {
    if (!OfflineQueue.instance) {
      OfflineQueue.instance = new OfflineQueue();
    }
    return OfflineQueue.instance;
  }

  /**
   * Add request to queue
   */
  async add(
    request: () => Promise<any>,
    options: { maxRetries?: number } = {}
  ): Promise<void> {
    if (this.queue.length >= this.maxQueueSize) {
      logger.warn('Offline queue full, removing oldest request');
      this.queue.shift();
    }

    const queuedRequest: QueuedRequest = {
      id: `${Date.now()}_${Math.random()}`,
      request,
      timestamp: Date.now(),
      retries: 0,
      maxRetries: options.maxRetries ?? 3,
    };

    this.queue.push(queuedRequest);
    logger.info('Request added to offline queue', {
      queueSize: this.queue.length,
    });
  }

  /**
   * Process queue when back online
   */
  async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    logger.info('Processing offline queue', { queueSize: this.queue.length });

    const requests = [...this.queue];
    this.queue = [];

    for (const queuedRequest of requests) {
      try {
        await queuedRequest.request();
        logger.info('Offline request processed successfully', {
          id: queuedRequest.id,
        });
      } catch (error) {
        queuedRequest.retries++;

        if (queuedRequest.retries < queuedRequest.maxRetries) {
          // Re-add to queue for retry
          this.queue.push(queuedRequest);
          logger.warn('Offline request failed, will retry', {
            id: queuedRequest.id,
            retries: queuedRequest.retries,
          });
        } else {
          logger.error('Offline request failed after max retries', {
            id: queuedRequest.id,
            error,
          });
        }
      }
    }

    this.isProcessing = false;

    // Process remaining items if any
    if (this.queue.length > 0) {
      setTimeout(() => this.processQueue(), 1000);
    }
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * Clear queue
   */
  clearQueue(): void {
    this.queue = [];
    logger.info('Offline queue cleared');
  }
}
