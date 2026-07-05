import type { SortFnReturn, SortFunction } from '../types';

function recordStep(steps: number[][], arr: number[]): void {
  steps.push([...arr]);
}

export function bubbleSort(arr: number[]): SortFnReturn {
  const result = [...arr];
  const steps: number[][] = [[...result]];
  let comparisons = 0;
  let swaps = 0;
  const n = result.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      comparisons++;
      if (result[j] > result[j + 1]) {
        [result[j], result[j + 1]] = [result[j + 1], result[j]];
        swaps++;
        recordStep(steps, result);
      }
    }
  }
  return { sorted: result, steps, comparisons, swaps };
}

export function selectionSort(arr: number[]): SortFnReturn {
  const result = [...arr];
  const steps: number[][] = [[...result]];
  let comparisons = 0;
  let swaps = 0;
  const n = result.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      comparisons++;
      if (result[j] < result[minIdx]) {
        minIdx = j;
      }
    }
    if (minIdx !== i) {
      [result[i], result[minIdx]] = [result[minIdx], result[i]];
      swaps++;
      recordStep(steps, result);
    }
  }
  return { sorted: result, steps, comparisons, swaps };
}

export function insertionSort(arr: number[]): SortFnReturn {
  const result = [...arr];
  const steps: number[][] = [[...result]];
  let comparisons = 0;
  let swaps = 0;
  const n = result.length;
  for (let i = 1; i < n; i++) {
    const key = result[i];
    let j = i - 1;
    while (j >= 0) {
      comparisons++;
      if (result[j] > key) {
        result[j + 1] = result[j];
        swaps++;
        j--;
      } else {
        break;
      }
    }
    if (result[j + 1] !== key) {
      result[j + 1] = key;
      swaps++;
      recordStep(steps, result);
    }
  }
  return { sorted: result, steps, comparisons, swaps };
}

export function shellSort(arr: number[]): SortFnReturn {
  const result = [...arr];
  const steps: number[][] = [[...result]];
  let comparisons = 0;
  let swaps = 0;
  const n = result.length;
  let gap = Math.floor(n / 2);
  while (gap > 0) {
    for (let i = gap; i < n; i++) {
      const temp = result[i];
      let j = i;
      while (j >= gap) {
        comparisons++;
        if (result[j - gap] > temp) {
          result[j] = result[j - gap];
          swaps++;
          j -= gap;
        } else {
          break;
        }
      }
      if (result[j] !== temp) {
        result[j] = temp;
        swaps++;
        recordStep(steps, result);
      }
    }
    gap = Math.floor(gap / 2);
  }
  return { sorted: result, steps, comparisons, swaps };
}

export function quickSort(arr: number[]): SortFnReturn {
  const result = [...arr];
  const steps: number[][] = [[...result]];
  let comparisons = 0;
  let swaps = 0;

  function partition(low: number, high: number): number {
    const pivot = result[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
      comparisons++;
      if (result[j] <= pivot) {
        i++;
        [result[i], result[j]] = [result[j], result[i]];
        swaps++;
        recordStep(steps, result);
      }
    }
    [result[i + 1], result[high]] = [result[high], result[i + 1]];
    swaps++;
    recordStep(steps, result);
    return i + 1;
  }

  function qs(low: number, high: number): void {
    if (low < high) {
      const pi = partition(low, high);
      qs(low, pi - 1);
      qs(pi + 1, high);
    }
  }

  qs(0, result.length - 1);
  return { sorted: result, steps, comparisons, swaps };
}

export function mergeSort(arr: number[]): SortFnReturn {
  const result = [...arr];
  const steps: number[][] = [[...result]];
  let comparisons = 0;
  let swaps = 0;

  function merge(left: number, mid: number, right: number): void {
    const leftArr = result.slice(left, mid + 1);
    const rightArr = result.slice(mid + 1, right + 1);
    let i = 0, j = 0, k = left;
    while (i < leftArr.length && j < rightArr.length) {
      comparisons++;
      if (leftArr[i] <= rightArr[j]) {
        result[k] = leftArr[i];
        i++;
      } else {
        result[k] = rightArr[j];
        j++;
      }
      swaps++;
      k++;
    }
    while (i < leftArr.length) {
      result[k] = leftArr[i];
      i++; k++; swaps++;
    }
    while (j < rightArr.length) {
      result[k] = rightArr[j];
      j++; k++; swaps++;
    }
    recordStep(steps, result);
  }

  function ms(left: number, right: number): void {
    if (left >= right) return;
    const mid = Math.floor((left + right) / 2);
    ms(left, mid);
    ms(mid + 1, right);
    merge(left, mid, right);
  }

  ms(0, result.length - 1);
  return { sorted: result, steps, comparisons, swaps };
}

export function heapSort(arr: number[]): SortFnReturn {
  const result = [...arr];
  const steps: number[][] = [[...result]];
  let comparisons = 0;
  let swaps = 0;
  const n = result.length;

  function heapify(size: number, root: number): void {
    let largest = root;
    const left = 2 * root + 1;
    const right = 2 * root + 2;
    if (left < size) {
      comparisons++;
      if (result[left] > result[largest]) largest = left;
    }
    if (right < size) {
      comparisons++;
      if (result[right] > result[largest]) largest = right;
    }
    if (largest !== root) {
      [result[root], result[largest]] = [result[largest], result[root]];
      swaps++;
      recordStep(steps, result);
      heapify(size, largest);
    }
  }

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(n, i);
  }

  for (let i = n - 1; i > 0; i--) {
    [result[0], result[i]] = [result[i], result[0]];
    swaps++;
    recordStep(steps, result);
    heapify(i, 0);
  }

  return { sorted: result, steps, comparisons, swaps };
}

export function timSort(arr: number[]): SortFnReturn {
  const result = [...arr];
  const steps: number[][] = [[...result]];
  let comparisons = 0;
  let swaps = 0;
  const n = result.length;
  const RUN = 32;

  for (let i = 0; i < n; i += RUN) {
    const end = Math.min(i + RUN - 1, n - 1);
    for (let j = i + 1; j <= end; j++) {
      const key = result[j];
      let k = j - 1;
      while (k >= i) {
        comparisons++;
        if (result[k] > key) {
          result[k + 1] = result[k];
          swaps++;
          k--;
        } else {
          break;
        }
      }
      result[k + 1] = key;
      swaps++;
      recordStep(steps, result);
    }
  }

  function merge(left: number, mid: number, right: number): void {
    const leftArr = result.slice(left, mid + 1);
    const rightArr = result.slice(mid + 1, right + 1);
    let i = 0, j = 0, k = left;
    while (i < leftArr.length && j < rightArr.length) {
      comparisons++;
      if (leftArr[i] <= rightArr[j]) {
        result[k] = leftArr[i];
        i++;
      } else {
        result[k] = rightArr[j];
        j++;
      }
      swaps++;
      k++;
    }
    while (i < leftArr.length) {
      result[k] = leftArr[i];
      i++; k++; swaps++;
    }
    while (j < rightArr.length) {
      result[k] = rightArr[j];
      j++; k++; swaps++;
    }
    recordStep(steps, result);
  }

  for (let size = RUN; size < n; size *= 2) {
    for (let left = 0; left < n; left += 2 * size) {
      const mid = Math.min(left + size - 1, n - 1);
      const right = Math.min(left + 2 * size - 1, n - 1);
      if (mid < right) {
        merge(left, mid, right);
      }
    }
  }

  return { sorted: result, steps, comparisons, swaps };
}

export function cocktailShakerSort(arr: number[]): SortFnReturn {
  const result = [...arr];
  const steps: number[][] = [[...result]];
  let comparisons = 0;
  let swaps = 0;
  let start = 0;
  let end = result.length - 1;
  let swapped = true;

  while (swapped) {
    swapped = false;
    for (let i = start; i < end; i++) {
      comparisons++;
      if (result[i] > result[i + 1]) {
        [result[i], result[i + 1]] = [result[i + 1], result[i]];
        swaps++;
        swapped = true;
        recordStep(steps, result);
      }
    }
    if (!swapped) break;
    swapped = false;
    end--;
    for (let i = end - 1; i >= start; i--) {
      comparisons++;
      if (result[i] > result[i + 1]) {
        [result[i], result[i + 1]] = [result[i + 1], result[i]];
        swaps++;
        swapped = true;
        recordStep(steps, result);
      }
    }
    start++;
  }

  return { sorted: result, steps, comparisons, swaps };
}

export function combSort(arr: number[]): SortFnReturn {
  const result = [...arr];
  const steps: number[][] = [[...result]];
  let comparisons = 0;
  let swaps = 0;
  const n = result.length;
  let gap = n;
  let swapped = true;

  while (gap > 1 || swapped) {
    gap = Math.floor(gap / 1.3);
    if (gap < 1) gap = 1;
    swapped = false;
    for (let i = 0; i + gap < n; i++) {
      comparisons++;
      if (result[i] > result[i + gap]) {
        [result[i], result[i + gap]] = [result[i + gap], result[i]];
        swaps++;
        swapped = true;
        recordStep(steps, result);
      }
    }
  }

  return { sorted: result, steps, comparisons, swaps };
}

export function gnomeSort(arr: number[]): SortFnReturn {
  const result = [...arr];
  const steps: number[][] = [[...result]];
  let comparisons = 0;
  let swaps = 0;
  let pos = 0;

  while (pos < result.length) {
    if (pos === 0) {
      pos++;
    } else {
      comparisons++;
      if (result[pos] >= result[pos - 1]) {
        pos++;
      } else {
        [result[pos], result[pos - 1]] = [result[pos - 1], result[pos]];
        swaps++;
        recordStep(steps, result);
        pos--;
      }
    }
  }

  return { sorted: result, steps, comparisons, swaps };
}

export function countingSort(arr: number[]): SortFnReturn {
  const result = [...arr];
  const steps: number[][] = [[...result]];
  let comparisons = 0;
  let swaps = 0;
  const n = result.length;
  if (n === 0) return { sorted: result, steps, comparisons, swaps };

  const min = Math.min(...result);
  const max = Math.max(...result);
  const range = max - min + 1;

  if (range > 100000) {
    const sortedArr = result.sort((a, b) => a - b);
    return { sorted: sortedArr, steps: [sortedArr], comparisons, swaps };
  }

  const count = new Array(range).fill(0);
  for (let i = 0; i < n; i++) {
    count[result[i] - min]++;
  }

  for (let i = 1; i < range; i++) {
    count[i] += count[i - 1];
  }

  const output = new Array(n);
  for (let i = n - 1; i >= 0; i--) {
    output[count[result[i] - min] - 1] = result[i];
    count[result[i] - min]--;
  }

  for (let i = 0; i < n; i++) {
    result[i] = output[i];
    swaps++;
    recordStep(steps, result);
  }

  return { sorted: result, steps, comparisons, swaps };
}

export function radixSort(arr: number[]): SortFnReturn {
  const result = [...arr];
  const steps: number[][] = [[...result]];
  let comparisons = 0;
  let swaps = 0;
  const n = result.length;
  if (n <= 1) return { sorted: result, steps, comparisons, swaps };

  const min = Math.min(...result);
  const offset = min < 0 ? -min : 0;
  const absArr = result.map(v => v + offset);
  const max = Math.max(...absArr);

  function countingSortByDigit(exp: number): void {
    const output = new Array(n);
    const count = new Array(10).fill(0);

    for (let i = 0; i < n; i++) {
      const digit = Math.floor(absArr[i] / exp) % 10;
      count[digit]++;
    }

    for (let i = 1; i < 10; i++) {
      count[i] += count[i - 1];
    }

    for (let i = n - 1; i >= 0; i--) {
      const digit = Math.floor(absArr[i] / exp) % 10;
      output[count[digit] - 1] = absArr[i];
      count[digit]--;
    }

    for (let i = 0; i < n; i++) {
      absArr[i] = output[i];
      result[i] = absArr[i] - offset;
      swaps++;
    }
    recordStep(steps, result);
  }

  let exp = 1;
  while (Math.floor(max / exp) > 0) {
    countingSortByDigit(exp);
    exp *= 10;
  }

  return { sorted: result, steps, comparisons, swaps };
}

export function bucketSort(arr: number[]): SortFnReturn {
  const result = [...arr];
  const steps: number[][] = [[...result]];
  let comparisons = 0;
  let swaps = 0;
  const n = result.length;
  if (n <= 1) return { sorted: result, steps, comparisons, swaps };

  const min = Math.min(...result);
  const max = Math.max(...result);
  const range = max - min;
  if (range === 0) return { sorted: result, steps, comparisons, swaps };

  const bucketCount = Math.min(n, Math.floor(Math.sqrt(n)) + 1);
  const buckets: number[][] = Array.from({ length: bucketCount }, () => []);

  for (let i = 0; i < n; i++) {
    const bucketIdx = Math.floor(((result[i] - min) / range) * (bucketCount - 1));
    buckets[Math.min(bucketIdx, bucketCount - 1)].push(result[i]);
  }

  let idx = 0;
  for (let b = 0; b < bucketCount; b++) {
    const bucket = buckets[b];
    for (let i = 1; i < bucket.length; i++) {
      const key = bucket[i];
      let j = i - 1;
      while (j >= 0) {
        comparisons++;
        if (bucket[j] > key) {
          bucket[j + 1] = bucket[j];
          j--;
        } else {
          break;
        }
      }
      bucket[j + 1] = key;
    }
    for (let i = 0; i < bucket.length; i++) {
      result[idx] = bucket[i];
      swaps++;
      idx++;
    }
    recordStep(steps, result);
  }

  return { sorted: result, steps, comparisons, swaps };
}

export function bogoSort(arr: number[]): SortFnReturn {
  const result = [...arr];
  const steps: number[][] = [[...result]];
  let comparisons = 0;
  let swaps = 0;
  const maxAttempts = 1000;
  let attempts = 0;

  function isSorted(): boolean {
    for (let i = 0; i < result.length - 1; i++) {
      comparisons++;
      if (result[i] > result[i + 1]) return false;
    }
    return true;
  }

  function shuffle(): void {
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
      swaps++;
    }
    recordStep(steps, result);
  }

  while (attempts < maxAttempts && !isSorted()) {
    shuffle();
    attempts++;
  }

  if (!isSorted()) {
    result.sort((a, b) => a - b);
    recordStep(steps, result);
  }

  return { sorted: result, steps, comparisons, swaps };
}

export const algorithmMap: Record<string, SortFunction> = {
  bubble: bubbleSort,
  selection: selectionSort,
  insertion: insertionSort,
  shell: shellSort,
  quick: quickSort,
  merge: mergeSort,
  heap: heapSort,
  tim: timSort,
  cocktail: cocktailShakerSort,
  comb: combSort,
  gnome: gnomeSort,
  counting: countingSort,
  radix: radixSort,
  bucket: bucketSort,
  bogo: bogoSort,
};
