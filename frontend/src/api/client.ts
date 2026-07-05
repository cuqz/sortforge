import type { AlgorithmInfo, Submission, LeaderboardParams, LeaderboardResponse } from '../types';

const BASE_URL = 'http://localhost:8080';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function fetchAlgorithms(): Promise<AlgorithmInfo[]> {
  const data = await request<{ algorithms: AlgorithmInfo[] }>('/api/algorithms');
  return data.algorithms;
}

export async function submitResult(data: {
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
}): Promise<Submission> {
  return request<Submission>('/api/submissions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchLeaderboard(params?: LeaderboardParams): Promise<LeaderboardResponse> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, String(value));
      }
    });
  }
  const qs = searchParams.toString();
  return request<LeaderboardResponse>(`/api/leaderboard${qs ? `?${qs}` : ''}`);
}

export async function fetchStats(): Promise<{
  total_submissions: number;
  unique_algorithms: number;
  fastest_speed_ms: number;
  largest_array: number;
}> {
  return request('/api/leaderboard/stats');
}
