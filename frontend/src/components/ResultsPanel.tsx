import { useState } from 'react';
import type { SortResult } from '../types';
import { submitResult } from '../api/client';
import { formatTime, formatBytes } from '../utils/format';
import { getDisplayName } from '../utils/algorithms';

interface ResultsPanelProps {
  results: SortResult[];
  dataType: string;
  arraySize: number;
  customCode: string;
}

export default function ResultsPanel({ results, dataType, arraySize, customCode }: ResultsPanelProps) {
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submitName, setSubmitName] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  if (results.length === 0) return null;

  const bestSpeed = Math.min(...results.map((r) => r.speedMs));
  const maxSpeed = Math.max(...results.map((r) => r.speedMs), 1);

  async function handleSubmit() {
    if (!submitName.trim()) return;
    setSubmitStatus('submitting');
    try {
      for (const result of results) {
        await submitResult({
          name: submitName.trim(),
          is_custom: result.algorithmId === 'custom',
          algorithm_id: result.algorithmId,
          array_size: arraySize,
          data_type: dataType,
          speed_ms: result.speedMs,
          memory_bytes: result.memoryBytes,
          operations: result.operations,
          is_stable: result.isStable,
          custom_code: result.algorithmId === 'custom' ? customCode : '',
        });
      }
      setSubmitStatus('success');
    } catch {
      setSubmitStatus('error');
    }
  }

  return (
    <section className="results-panel">
      <div className="results-header">
        <h3>Results</h3>
        <button className="btn btn-accent" onClick={() => setShowSubmitDialog(true)}>
          Submit to Leaderboard
        </button>
      </div>

      <div className="results-comparison">
        {results.map((r) => (
          <div key={r.algorithmId} className="result-bar-row">
            <div className="result-bar-label">
              <span className="result-bar-name">{getDisplayName(r.algorithmId)}</span>
              {r.speedMs === bestSpeed && <span className="result-bar-badge winner">Fastest</span>}
            </div>
            <div className="result-bar-track">
              <div
                className={`result-bar-fill${r.speedMs === bestSpeed ? ' winner' : ''}`}
                style={{ width: `${Math.max(3, (r.speedMs / maxSpeed) * 100)}%` }}
              >
                <span className="result-bar-value">{formatTime(r.speedMs)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="result-detail-row">
        {results.map((r) => (
          <div key={r.algorithmId} className="result-stat">
            <span className="result-stat-label">{getDisplayName(r.algorithmId)}</span>
            <span className={`result-stat-value${r.speedMs === bestSpeed ? ' best' : ''}`}>
              {formatTime(r.speedMs)}
            </span>
            <span className="result-stat-value" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {formatBytes(r.memoryBytes)} · {r.operations.toLocaleString()} ops · {r.isStable ? 'Stable' : 'Unstable'}
            </span>
          </div>
        ))}
      </div>

      {showSubmitDialog && (
        <div className="dialog-overlay" onClick={() => { setShowSubmitDialog(false); setSubmitStatus('idle'); }}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Submit to Leaderboard</h3>
            {submitStatus === 'success' ? (
              <p className="success-text">Submitted successfully!</p>
            ) : submitStatus === 'error' ? (
              <p className="error-text">Submission failed. Is the backend running?</p>
            ) : (
              <>
                <p>Enter your name to submit {results.length} result{results.length > 1 ? 's' : ''}.</p>
                <input
                  type="text"
                  className="dialog-input"
                  placeholder="Your name"
                  value={submitName}
                  onChange={(e) => setSubmitName(e.target.value)}
                  maxLength={50}
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
                <div className="dialog-actions">
                  <button
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={submitStatus === 'submitting' || !submitName.trim()}
                  >
                    {submitStatus === 'submitting' ? 'Submitting...' : 'Submit'}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => { setShowSubmitDialog(false); setSubmitStatus('idle'); }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
