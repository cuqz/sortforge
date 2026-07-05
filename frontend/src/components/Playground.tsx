import { useState, useRef, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { generateArray } from '../utils/array';
import type { DataType } from '../types';

const DEFAULT_CODE = `function customSort(arr) {
  const result = [...arr];
  for (let i = 0; i < result.length; i++) {
    for (let j = 0; j < result.length - 1 - i; j++) {
      if (result[j] > result[j + 1]) {
        [result[j], result[j + 1]] = [result[j + 1], result[j]];
      }
    }
  }
  return result;
}`;

const DATA_TYPES: { value: DataType; label: string }[] = [
  { value: 'random', label: 'Random' },
  { value: 'nearly-sorted', label: 'Nearly Sorted' },
  { value: 'reversed', label: 'Reversed' },
  { value: 'few-unique', label: 'Few Unique' },
];

const BLOCKED = ['import(', 'eval(', 'fetch(', 'XMLHttpRequest', 'importScripts(', 'require(', 'process.'];

export default function Playground() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [editorReady, setEditorReady] = useState(false);
  const [output, setOutput] = useState<number[] | null>(null);
  const [error, setError] = useState('');
  const [running, setRunning] = useState(false);
  const [arraySize, setArraySize] = useState(40);
  const [dataType, setDataType] = useState<DataType>('random');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const draw = useCallback((arr: number[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = rect.width;
    const h = rect.height;
    if (w <= 0 || h <= 0) return;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const maxVal = Math.max(...arr, 1);
    const barCount = arr.length;
    const gap = barCount < 60 ? 2 : 1;
    const barW = Math.max(3, (w - gap * (barCount - 1)) / barCount);
    const usableH = h - 12;

    for (let i = 0; i < arr.length; i++) {
      const barH = Math.max(3, (arr[i] / maxVal) * usableH);
      const x = i * (barW + gap);
      const y = h - barH - 6;
      const alpha = 0.35 + 0.5 * (arr[i] / maxVal);
      // canvas fillStyle with OKLCH alpha — use template for reliable parsing
      ctx.fillStyle = `oklch(0.72 0.18 200 / ${Math.round(alpha * 100)}%)`;
      ctx.fillRect(x, y, barW, barH);
    }
  }, []);

  const handleRun = useCallback(() => {
    setRunning(true);
    setError('');
    setOutput(null);

    const src = code.trim();
    if (!src) {
      setError('Code is empty. Write a sort function first.');
      setRunning(false);
      return;
    }

    // check blocked patterns
    for (const pattern of BLOCKED) {
      if (src.includes(pattern)) {
        setError(`Blocked pattern: "${pattern}" is not allowed.`);
        setRunning(false);
        return;
      }
    }

    const arr = generateArray(arraySize, dataType);

    try {
      const fn = new Function('arr', `${src}\nreturn customSort(arr);`);
      const sorted = fn(arr);

      if (!Array.isArray(sorted)) {
        setError(`Function returned ${typeof sorted} instead of an array.`);
        setRunning(false);
        return;
      }
      if (sorted.length !== arr.length) {
        setError(`Expected ${arr.length} items but got ${sorted.length}.`);
        setRunning(false);
        return;
      }

      setOutput(sorted);
      setRunning(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setRunning(false);
    }
  }, [code, arraySize, dataType, draw]);

  // draw whenever output changes (after React commits DOM)
  useEffect(() => {
    if (!output) return;
    // double rAF to ensure layout is done
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => draw(output));
    });
    return () => cancelAnimationFrame(id);
  }, [output, draw]);

  // resize canvas when container changes
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      if (output) draw(output);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [output, draw]);

  // Ctrl+Enter shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (editorReady) handleRun();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleRun, editorReady]);

  return (
    <div className="playground">
      <div className="playground-editor">
        <div className="playground-editor-header">
          Editor — Write a sort function
          {!editorReady && <span style={{ marginLeft: 8, color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none' }}>loading...</span>}
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          <Editor
            height="100%"
            defaultLanguage="javascript"
            theme="vs-dark"
            value={code}
            onChange={(v) => setCode(v || '')}
            onMount={() => setEditorReady(true)}
            loading={<div style={{ padding: 24, color: 'var(--text-muted)', fontSize: '0.8rem' }}>Loading editor...</div>}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              padding: { top: 12 },
              tabSize: 2,
              automaticLayout: true,
            }}
          />
        </div>
      </div>
      <div className="playground-preview">
        <div className="playground-preview-header">
          <span className="playground-preview-title">Preview</span>
          <div className="playground-preview-controls">
            <select
              value={dataType}
              onChange={(e) => setDataType(e.target.value as DataType)}
              style={{
                padding: '2px 6px', fontSize: '0.7rem', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)',
                color: 'var(--text-secondary)', fontFamily: 'var(--font)', cursor: 'pointer',
              }}
            >
              {DATA_TYPES.map(dt => <option key={dt.value} value={dt.value}>{dt.label}</option>)}
            </select>
            <input
              type="range"
              min={10}
              max={200}
              value={arraySize}
              onChange={(e) => setArraySize(Number(e.target.value))}
              style={{ width: 80, accentColor: 'oklch(0.72 0.18 200)', height: 4 }}
            />
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', minWidth: 24 }}>
              {arraySize}
            </span>
            <button
              onClick={handleRun}
              disabled={running || !editorReady}
              className="btn btn-primary"
              style={{ padding: '3px 12px' }}
            >
              {running ? 'Running...' : 'Run'}
            </button>
          </div>
        </div>
        <div className="playground-canvas-wrap" ref={wrapRef}>
          <canvas ref={canvasRef} />
          {!output && !error && !running && (
            <div className="playground-message">Write a function and click Run</div>
          )}
          {running && !output && (
            <div className="playground-message">Sorting...</div>
          )}
          {error && (
            <div className="playground-error">{error}</div>
          )}
        </div>
      </div>
    </div>
  );
}
