// Web Worker Service for managing statistical computations
import { wrap, Remote } from 'comlink';
import { SimulationResult, AggregatedStats } from '../types/simulation.types';

// Worker interface (matches the worker implementation)
interface SimulationWorker {
  runSimulation(params: {
    group1_mean: number;
    group1_std: number;
    group2_mean: number;
    group2_std: number;
    sample_size_per_group: number;
    num_simulations: number;
    alpha_level: number;
  }): Promise<AggregatedStats>;
}

export class WorkerService {
  private worker: Worker | null = null;
  private remoteWorker: Remote<SimulationWorker> | null = null;
  private messageQueue: Map<string, {
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = new Map();

  async initialize(): Promise<void> {
    if (this.worker) return; // Already initialized

    try {
      // Create the worker - use the correct path for Vite
      this.worker = new Worker(new URL('../workers/simulation.worker.ts', import.meta.url), { type: 'module' });

      // Set up message handling
      this.worker.onmessage = this.handleWorkerMessage.bind(this);
      this.worker.onerror = this.handleWorkerError.bind(this);

      // Wrap with Comlink for easier communication (if available)
      if (typeof wrap !== 'undefined') {
        this.remoteWorker = wrap<SimulationWorker>(this.worker);
      }

      console.log('Web Worker initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Web Worker:', error);
      throw new Error('Web Worker initialization failed');
    }
  }

  async runSimulation(params: {
    group1_mean: number;
    group1_std: number;
    group2_mean: number;
    group2_std: number;
    sample_size_per_group: number;
    num_simulations: number;
    alpha_level: number;
  }, onProgress?: (completed: number, total: number) => void): Promise<AggregatedStats> {
    if (!this.worker) {
      throw new Error('Worker not initialized. Call initialize() first.');
    }

    const messageId = crypto.randomUUID();

    return new Promise((resolve, reject) => {
      // Store the promise handlers
      this.messageQueue.set(messageId, { resolve, reject });

      // Set up progress handler if provided
      if (onProgress) {
        const progressHandler = (e: MessageEvent) => {
          if (e.data.messageId === messageId && e.data.type === 'PROGRESS') {
            const { completed, total } = e.data.progress;
            onProgress(completed, total);
          }
        };

        this.worker!.addEventListener('message', progressHandler);

        // Clean up progress handler when done
        const cleanup = () => {
          this.worker!.removeEventListener('message', progressHandler);
        };

        // Override resolve/reject to clean up
        const originalResolve = resolve;
        const originalReject = reject;
        resolve = (value) => {
          cleanup();
          originalResolve(value);
        };
        reject = (error) => {
          cleanup();
          originalReject(error);
        };
      }

      // Send message to worker
      if (this.worker) {
        this.worker.postMessage({
          type: 'RUN_SIMULATION',
          payload: params,
          messageId
        });
      } else {
        reject(new Error('Worker not available'));
      }
    });
  }

  private handleWorkerMessage(e: MessageEvent): void {
    const { type, result, error, messageId } = e.data;

    // Find the promise handlers for this message
    const handlers = this.messageQueue.get(messageId);
    if (!handlers) return;

    // Remove from queue
    this.messageQueue.delete(messageId);

    if (type === 'SUCCESS') {
      handlers.resolve(result);
    } else if (type === 'ERROR') {
      handlers.reject(new Error(error));
    }
  }

  private handleWorkerError(e: ErrorEvent): void {
    console.error('Web Worker error:', e);

    // Reject all pending promises
    for (const [messageId, handlers] of this.messageQueue) {
      handlers.reject(new Error('Web Worker encountered an error'));
    }
    this.messageQueue.clear();
  }

  terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.remoteWorker = null;
      this.messageQueue.clear();
      console.log('Web Worker terminated');
    }
  }

  isInitialized(): boolean {
    return this.worker !== null;
  }

  getPendingTasksCount(): number {
    return this.messageQueue.size;
  }
}

// Singleton instance
export const workerService = new WorkerService();

// React hook for using the worker service
export const useWorkerService = () => {
  const initialize = () => workerService.initialize();
  const runSimulation = (params: any, onProgress?: any) =>
    workerService.runSimulation(params, onProgress);
  const terminate = () => workerService.terminate();
  const isInitialized = () => workerService.isInitialized();
  const getPendingTasksCount = () => workerService.getPendingTasksCount();

  return {
    initialize,
    runSimulation,
    terminate,
    isInitialized,
    getPendingTasksCount,
  };
};