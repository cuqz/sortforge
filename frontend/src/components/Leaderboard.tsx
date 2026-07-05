import { useState, useEffect, useCallback } from 'react';
import type { Submission, AlgorithmInfo } from '../types';
import { fetchLeaderboard, fetchAlgorithms } from '../api/client';
import { formatTime, formatBytes } from '../utils/format';
import { getDisplayName } from '../utils/algorithms';

type SortField = 'speed_ms' | 'memory_bytes' | 'operations' | 'array_size' | 'submitted_at';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 20;

export default function Leaderboard() {
  const [entries, setEntries] = useState<Submission[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('speed_ms');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [algorithmFilter, setAlgorithmFilter] = useState('');
  const [dataTypeFilter, setDataTypeFilter] = useState('');
  const [allAlgos, setAllAlgos] = useState<AlgorithmInfo[]>([]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchLeaderboard({
        sort_by: `${sortDir === 'desc' ? '-' : ''}${sortBy}`,
        page,
        page_size: PAGE_SIZE,
        algorithm_id: algorithmFilter || undefined,
        data_type: dataTypeFilter || undefined,
      });
      setEntries(res.entries || res.submissions || []);
      setTotal(res.total !== undefined ? res.total : (res.entries || res.submissions || []).length);
    } catch (err) {
      console.error('Leaderboard fetch failed:', err);
      setError('Failed to load leaderboard. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, sortDir, algorithmFilter, dataTypeFilter]);

  useEffect(() => {
    load();
    fetchAlgorithms().then(setAllAlgos).catch(() => {});
  }, [load]);

  function handleSort(field: SortField) {
    if (sortBy === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDir(field === 'speed_ms' ? 'asc' : 'desc');
    }
    setPage(1);
  }

  function sortArrow(field: SortField): string {
    if (sortBy !== field) return '';
    return sortDir === 'asc' ? ' \u25B2' : ' \u25BC';
  }

  const getPageRange = () => {
    const maxVisible = 7;
    if (totalPages <= maxVisible) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, page - half);
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <section className="leaderboard">
      <div className="leaderboard-header">
        <h3>Leaderboard</h3>
        <div className="leaderboard-filters">
          <select
            value={algorithmFilter}
            onChange={(e) => { setAlgorithmFilter(e.target.value); setPage(1); }}
            className="filter-select"
          >
            <option value="">All Algorithms</option>
            {allAlgos.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          <select
            value={dataTypeFilter}
            onChange={(e) => { setDataTypeFilter(e.target.value); setPage(1); }}
            className="filter-select"
          >
            <option value="">All Types</option>
            <option value="random">Random</option>
            <option value="nearly-sorted">Nearly Sorted</option>
            <option value="reversed">Reversed</option>
            <option value="few-unique">Few Unique</option>
          </select>
        </div>
      </div>

      {loading && <div className="loading">Loading leaderboard...</div>}
      {error && <div className="error-message">{error}</div>}

      {!loading && !error && entries.length === 0 && (
        <div className="empty-state">No submissions yet. Run a benchmark and submit your result!</div>
      )}

      {!loading && !error && entries.length > 0 && (
        <>
          <div className="table-responsive">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Algorithm</th>
                  <th onClick={() => handleSort('array_size')} className="sortable">
                    Size{sortArrow('array_size')}
                  </th>
                  <th>Data</th>
                  <th onClick={() => handleSort('speed_ms')} className="sortable">
                    Speed{sortArrow('speed_ms')}
                  </th>
                  <th onClick={() => handleSort('memory_bytes')} className="sortable">
                    Memory{sortArrow('memory_bytes')}
                  </th>
                  <th onClick={() => handleSort('operations')} className="sortable">
                    Ops{sortArrow('operations')}
                  </th>
                  <th>Stable</th>
                  <th onClick={() => handleSort('submitted_at')} className="sortable">
                    Date{sortArrow('submitted_at')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, idx) => (
                  <tr key={entry.id}>
                    <td className={`rank ${((page - 1) * PAGE_SIZE + idx + 1) <= 3 ? `rank-${(page - 1) * PAGE_SIZE + idx + 1}` : ''}`}>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                    <td className="name-cell">{entry.name}</td>
                    <td>
                      <span className={`algo-badge ${entry.is_custom ? 'custom' : ''}`}>
                        {getDisplayName(entry.algorithm_id)}
                      </span>
                    </td>
                    <td>{entry.array_size}</td>
                    <td>{entry.data_type}</td>
                    <td>{formatTime(entry.speed_ms)}</td>
                    <td>{formatBytes(entry.memory_bytes)}</td>
                    <td>{entry.operations.toLocaleString()}</td>
                    <td>
                      <span className={`stability-badge ${entry.is_stable ? 'stable' : 'unstable'}`}>
                        {entry.is_stable ? 'Y' : 'N'}
                      </span>
                    </td>
                    <td className="date-cell">{new Date(entry.submitted_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button className="btn btn-sm" disabled={page <= 1} onClick={() => setPage(1)}>
              &laquo;
            </button>
            <button className="btn btn-sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Prev
            </button>
            {getPageRange()[0] > 1 && <span className="ellipsis">...</span>}
            {getPageRange().map((p) => (
              <button
                key={p}
                className={`btn btn-sm ${p === page ? 'active' : ''}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
            {getPageRange()[getPageRange().length - 1] < totalPages && <span className="ellipsis">...</span>}
            <button className="btn btn-sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
              Next
            </button>
            <button className="btn btn-sm" disabled={page >= totalPages} onClick={() => setPage(totalPages)}>
              &raquo;
            </button>
            <span className="total-count">{total} total entries</span>
          </div>
        </>
      )}
    </section>
  );
}
