export interface AlgorithmInfo {
  id: string;
  name: string;
  category: 'comparison' | 'linear';
  timeComplexity: string;
  stable: boolean;
  description: string;
}

export interface SortResult {
  algorithmId: string;
  arraySize: number;
  dataType: string;
  speedMs: number;
  memoryBytes: number;
  operations: number;
  isStable: boolean;
  steps: number[][];
}

export interface Submission {
  id: number;
  name: string;
  is_custom: boolean;
  algorithm_id: string;
  array_size: number;
  data_type: string;
  speed_ms: number;
  memory_bytes: number;
  operations: number;
  is_stable: boolean;
  custom_code: string;
  submitted_at: string;
}

export type DataType = 'random' | 'nearly-sorted' | 'reversed' | 'few-unique';

export interface SortFnReturn {
  sorted: number[];
  steps: number[][];
  comparisons: number;
  swaps: number;
}

export type SortFunction = (arr: number[]) => SortFnReturn;

export interface WorkerMessage {
  array: number[];
  algorithmId: string;
  customCode?: string;
  dataType?: string;
}

export interface WorkerResponse {
  algorithmId: string;
  sorted: number[];
  steps: number[][];
  speedMs: number;
  memoryBytes: number;
  operations: number;
  isStable: boolean;
  error?: string;
}

export interface LeaderboardParams {
  sort_by?: string;
  limit?: number;
  algorithm_id?: string;
  data_type?: string;
  page?: number;
  page_size?: number;
}

export interface LeaderboardResponse {
  entries?: Submission[];
  submissions?: Submission[];
  total?: number;
  page?: number;
  page_size?: number;
}

export type ViewMode = 'workspace' | 'playground' | 'benchmarks' | 'community';

export interface AlgorithmMeta {
  id: string;
  name: string;
  category: string;
  timeComplexity: string;
  stable: boolean;
  description: string;
}

export interface FrameStep {
  array: number[];
  comparisons: number;
  swaps: number;
  pivot?: number;
  sorted: number[];
  depth?: number;
}

export interface SortRun {
  algorithmId: string;
  arraySize: number;
  dataType: string;
  speedMs: number;
  memoryBytes: number;
  operations: number;
  comparisons: number;
  swaps: number;
  isStable: boolean;
  steps: FrameStep[];
  finishedAt?: string;
}
