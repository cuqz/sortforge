export type DataType = 'random' | 'nearly-sorted' | 'reversed' | 'few-unique';

export function generateArray(size: number, dataType: DataType): number[] {
  const arr: number[] = [];
  switch (dataType) {
    case 'random':
      for (let i = 0; i < size; i++) {
        arr.push(Math.floor(Math.random() * 1000) + 1);
      }
      break;
    case 'nearly-sorted':
      for (let i = 0; i < size; i++) {
        arr.push(Math.floor(Math.random() * 1000) + 1);
      }
      arr.sort((a, b) => a - b);
      for (let i = 0; i < Math.floor(size * 0.1); i++) {
        const a = Math.floor(Math.random() * size);
        const b = Math.floor(Math.random() * size);
        [arr[a], arr[b]] = [arr[b], arr[a]];
      }
      break;
    case 'reversed':
      for (let i = size; i > 0; i--) {
        arr.push(Math.floor(Math.random() * 100) + (i * 2));
      }
      break;
    case 'few-unique':
      const uniqueValues = [10, 50, 100, 250, 500, 750, 1000];
      for (let i = 0; i < size; i++) {
        arr.push(uniqueValues[Math.floor(Math.random() * uniqueValues.length)]);
      }
      break;
  }
  return arr;
}

export function downsampleSteps(steps: number[][], maxSteps: number): number[][] {
  if (steps.length <= maxSteps) return steps;
  const result: number[][] = [];
  const ratio = steps.length / maxSteps;
  for (let i = 0; i < maxSteps; i++) {
    result.push(steps[Math.floor(i * ratio)]);
  }
  result.push(steps[steps.length - 1]);
  return result;
}
