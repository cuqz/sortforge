import type { SortResult } from '../types';
import { getDisplayName } from '../utils/algorithms';

interface BenchmarkDashboardProps {
  results: SortResult[];
}

export default function BenchmarkDashboard({ results }: BenchmarkDashboardProps) {
  if (results.length === 0) {
    return (
      <div className="benchmarks">
        <div className="benchmark-chart">
          <div className="benchmark-chart-title">Runtime Comparison</div>
          <div className="chart-empty">
            Run algorithms from the workspace first, then check back here for comparison charts.
          </div>
        </div>
      </div>
    );
  }

  const maxSpeed = Math.max(...results.map(r => r.speedMs));
  const maxMem = Math.max(...results.map(r => r.memoryBytes));
  const maxOps = Math.max(...results.map(r => r.operations));

  return (
    <div className="benchmarks">
      <div className="benchmark-chart">
        <div className="benchmark-chart-title">Runtime Comparison</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 0' }}>
          {results.map(r => (
            <div key={r.algorithmId} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.72rem' }}>
              <span style={{ width: 120, color: 'var(--text-secondary)', flexShrink: 0 }}>{getDisplayName(r.algorithmId)}</span>
              <div style={{ flex: 1, height: 16, background: 'var(--bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  width: `${(r.speedMs / maxSpeed) * 100}%`,
                  height: '100%',
                  background: 'oklch(0.72 0.16 195 / 0.6)',
                  borderRadius: 4,
                  transition: 'width 0.3s ease',
                }} />
              </div>
              <span style={{ width: 70, textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                {r.speedMs < 1 ? '<1ms' : `${r.speedMs.toFixed(1)}ms`}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="benchmark-chart">
        <div className="benchmark-chart-title">Memory Usage</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 0' }}>
          {results.map(r => (
            <div key={r.algorithmId} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.72rem' }}>
              <span style={{ width: 120, color: 'var(--text-secondary)', flexShrink: 0 }}>{getDisplayName(r.algorithmId)}</span>
              <div style={{ flex: 1, height: 16, background: 'var(--bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  width: `${(r.memoryBytes / maxMem) * 100}%`,
                  height: '100%',
                  background: 'oklch(0.55 0.14 145 / 0.6)',
                  borderRadius: 4,
                  transition: 'width 0.3s ease',
                }} />
              </div>
              <span style={{ width: 70, textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                {r.memoryBytes < 1024 ? `${r.memoryBytes}B` : `${(r.memoryBytes / 1024).toFixed(1)}KB`}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="benchmark-chart">
        <div className="benchmark-chart-title">Operations</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 0' }}>
          {results.map(r => (
            <div key={r.algorithmId} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.72rem' }}>
              <span style={{ width: 120, color: 'var(--text-secondary)', flexShrink: 0 }}>{getDisplayName(r.algorithmId)}</span>
              <div style={{ flex: 1, height: 16, background: 'var(--bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  width: `${(r.operations / maxOps) * 100}%`,
                  height: '100%',
                  background: 'oklch(0.6 0.14 85 / 0.6)',
                  borderRadius: 4,
                  transition: 'width 0.3s ease',
                }} />
              </div>
              <span style={{ width: 70, textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                {r.operations.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
