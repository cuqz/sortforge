import type { DataType } from '../types';
import { isStable } from '../utils/algorithms';

interface RunnerResult {
  algorithmId: string;
  arraySize: number;
  dataType: string;
  speedMs: number;
  memoryBytes: number;
  operations: number;
  isStable: boolean;
  steps: number[][];
}

export function runSortsInParallel(
  algorithms: string[],
  array: number[],
  arraySize: number,
  dataType: DataType,
  customCode: string,
  onProgress: (result: RunnerResult) => void,
  onComplete: () => void
): () => void {
  const workers: Worker[] = [];
  let completed = 0;
  let finished = false; // prevents double-firing onComplete
  const total = algorithms.length;
  let cancelled = false;

  function markDone() {
    if (finished || cancelled) return;
    completed++;
    if (completed === total) {
      finished = true;
      onComplete();
    }
  }

  algorithms.forEach((algoId) => {
    if (algoId === 'custom') {
      const start = performance.now();
      try {
        const fn = new Function('arr', `${customCode}\nreturn customSort(arr);`);
        const out = fn(array) as { sorted: number[]; steps: number[][]; comparisons: number; swaps: number };
        const elapsed = performance.now() - start;
        const memEstimate = (out.sorted.length * 8 * 2) + (out.steps.length * out.sorted.length * 8);
        if (!cancelled) {
          onProgress({
            algorithmId: algoId,
            arraySize,
            dataType,
            speedMs: elapsed,
            memoryBytes: memEstimate,
            operations: out.comparisons + out.swaps,
            isStable: isStable(algoId),
            steps: out.steps,
          });
        }
      } catch (err) {
        console.error('Custom sort failed:', err);
      }
      markDone();
      return;
    }

    try {
      const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
      workers.push(worker);

      let workerDone = false;
      const timeout = setTimeout(() => {
        if (!workerDone) {
          worker.terminate();
          workerDone = true;
          markDone();
        }
      }, 15000); // 15s timeout — bogo sort safety

      worker.postMessage({ array, algorithmId: algoId, customCode: '' });

      worker.onmessage = (e) => {
        if (workerDone) return;
        workerDone = true;
        clearTimeout(timeout);
        const data = e.data;
        if (!cancelled) {
          onProgress({
            algorithmId: data.algorithmId,
            arraySize,
            dataType,
            speedMs: data.speedMs,
            memoryBytes: data.memoryBytes,
            operations: data.operations,
            isStable: data.isStable,
            steps: data.steps,
          });
        }
        worker.terminate();
        markDone();
      };

      worker.onerror = () => {
        if (workerDone) return;
        workerDone = true;
        clearTimeout(timeout);
        worker.terminate();
        markDone();
      };
    } catch (err) {
      console.error('Worker creation failed for:', algoId, err);
      markDone();
    }
  });

  return () => {
    cancelled = true;
    workers.forEach(w => w.terminate());
  };
}
