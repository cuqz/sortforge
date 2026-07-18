import { algorithmMap } from './sorts';
import type { WorkerMessage, WorkerResponse } from '../types';

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { array, algorithmId, customCode } = e.data;

  let sortFn: ((arr: number[]) => { sorted: number[]; steps: number[][]; comparisons: number; swaps: number }) | null = null;

  if (algorithmId === 'custom' && customCode) {
    const blocked = ['import(', 'eval(', 'fetch(', 'XMLHttpRequest', 'importScripts(', 'require(', 'process.'];
    for (const pattern of blocked) {
      if (customCode.includes(pattern)) {
        const response: WorkerResponse = {
          algorithmId,
          sorted: [],
          steps: [],
          speedMs: 0,
          memoryBytes: 0,
          operations: 0,
          isStable: false,
          error: 'Code contains blocked patterns (import, eval, fetch, etc.)',
        };
        self.postMessage(response);
        return;
      }
    }
    try {
      const fn = new Function('arr', `${customCode}\nreturn customSort(arr);`);
      sortFn = fn as unknown as typeof sortFn;
    } catch {
      const response: WorkerResponse = {
        algorithmId,
        sorted: [],
        steps: [],
        speedMs: 0,
        memoryBytes: 0,
        operations: 0,
        isStable: false,
        error: 'Failed to parse custom sort function',
      };
      self.postMessage(response);
      return;
    }
  } else {
    sortFn = algorithmMap[algorithmId] || null;
  }

  if (!sortFn) {
    const response: WorkerResponse = {
      algorithmId,
      sorted: [],
      steps: [],
      speedMs: 0,
      memoryBytes: 0,
      operations: 0,
      isStable: false,
      error: `Unknown algorithm: ${algorithmId}`,
    };
    self.postMessage(response);
    return;
  }

  const startMemory = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize || 0;
  const startTime = performance.now();

  let result: { sorted: number[]; steps: number[][]; comparisons: number; swaps: number };
  try {
    result = sortFn(array);
  } catch (err) {
    const response: WorkerResponse = {
      algorithmId,
      sorted: [],
      steps: [],
      speedMs: 0,
      memoryBytes: 0,
      operations: 0,
      isStable: false,
      error: `Sort error: ${err instanceof Error ? err.message : String(err)}`,
    };
    self.postMessage(response);
    return;
  }

  const endTime = performance.now();
  const endMemory = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize || 0;

  const algorithmMeta = algorithmId === 'custom' ? null : getAlgorithmMeta(algorithmId);
  const isStable = algorithmMeta?.stable ?? false;
  const memEstimate = (result.sorted.length * 8 * 2) + (result.steps.length * result.sorted.length * 8);
  const memoryBytes = Math.max(endMemory - startMemory, 0) || memEstimate;

  const response: WorkerResponse = {
    algorithmId,
    sorted: result.sorted,
    steps: result.steps,
    speedMs: endTime - startTime,
    memoryBytes: Math.max(memoryBytes, 0),
    operations: result.comparisons + result.swaps,
    isStable,
  };
  self.postMessage(response);
};

function getAlgorithmMeta(id: string): { stable: boolean } | null {
  const stableSet = new Set([
    'bubble', 'insertion', 'merge', 'tim', 'cocktail', 'gnome', 'counting', 'radix', 'bucket',
  ]);
  return stableSet.has(id) ? { stable: true } : { stable: false };
}


