import { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { downsampleSteps } from '../utils/array';
import { getDisplayName, getComplexity } from '../utils/algorithms';

interface VisualizationAreaProps {
  stepsList: { algorithmId: string; steps: number[][]; arraySize: number }[];
  isRunning: boolean;
  onRun: () => void;
}

const MAX_FRAMES = 300;
const LANE_HEIGHT = 110;

const PALETTE = [
  'oklch(0.72 0.18 200)',
  'oklch(0.62 0.16 145)',
  'oklch(0.66 0.14 80)',
  'oklch(0.62 0.16 30)',
  'oklch(0.64 0.14 280)',
  'oklch(0.62 0.13 170)',
  'oklch(0.68 0.12 40)',
  'oklch(0.62 0.14 310)',
  'oklch(0.60 0.16 220)',
  'oklch(0.65 0.13 120)',
  'oklch(0.60 0.15 350)',
  'oklch(0.64 0.12 250)',
  'oklch(0.66 0.14 60)',
  'oklch(0.62 0.13 190)',
  'oklch(0.68 0.12 15)',
];

function LaneCard({ steps, color, name, complexity }: {
  steps: number[][];
  color: string;
  name: string;
  complexity: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [frame, setFrame] = useState(0);
  const [done, setDone] = useState(false);
  const frameRef = useRef(0);
  const animRef = useRef<number>(0);

  const downsampled = useMemo(() => downsampleSteps(steps, MAX_FRAMES), [steps]);

  // reset when new steps arrive
  useEffect(() => {
    cancelAnimationFrame(animRef.current);
    setFrame(0);
    setDone(false);
    frameRef.current = 0;
  }, [steps]);

  const draw = useCallback((f: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !downsampled[f]) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    ctx.clearRect(0, 0, w, h);

    const data = downsampled[f];
    const maxVal = Math.max(...data, 1);
    const barCount = data.length;
    const gap = Math.max(1, barCount < 100 ? 2 : 1);
    const barW = Math.max(2, (w - gap * (barCount - 1)) / barCount);
    const isSorted = f >= downsampled.length - 1 && downsampled.length > 1;

    for (let i = 0; i < data.length; i++) {
      const barH = Math.max(2, (data[i] / maxVal) * (h - 6));
      const x = i * (barW + gap);
      const y = h - barH;

      ctx.fillStyle = isSorted
        ? `oklch(0.72 0.14 200 / ${0.4 + 0.4 * (data[i] / maxVal)})`
        : color.replace(')', ` / ${0.3 + 0.5 * (data[i] / maxVal)})`).replace('oklch(', 'oklch(');
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, [1, 1, 0, 0]);
      ctx.fill();
    }
  }, [downsampled, color]);

  // animation loop
  useEffect(() => {
    if (downsampled.length <= 1) return;
    let stopped = false;
    let lastTime = 0;
    const interval = 25;

    function loop(ts: number) {
      if (stopped) return;
      if (ts - lastTime >= interval) {
        lastTime = ts;
        frameRef.current += 1;
        const n = frameRef.current;
        if (n >= downsampled.length - 1) {
          draw(downsampled.length - 1);
          setFrame(downsampled.length - 1);
          setDone(true);
          return;
        }
        draw(n);
        setFrame(n);
      }
      animRef.current = requestAnimationFrame(loop);
    }
    animRef.current = requestAnimationFrame(loop);

    return () => { stopped = true; cancelAnimationFrame(animRef.current); };
  }, [downsampled, draw]);

  // resize observer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);
    return () => ro.disconnect();
  }, [draw]);

  const progress = downsampled.length > 1 ? (frame / (downsampled.length - 1)) * 100 : 0;

  return (
    <div className={`lane-card${done ? ' done' : ''}`}>
      <div className="lane-header">
        <span className="lane-dot" style={{ background: color }} />
        <span className="lane-name">{name}</span>
        <span className="lane-complexity">{complexity}</span>
        <span className="lane-status">
          {downsampled.length > 0 ? `frame ${frame + 1}/${downsampled.length}` : 'idle'}
        </span>
      </div>
      <div className="lane-canvas-wrap" style={{ height: LANE_HEIGHT }}>
        <canvas ref={canvasRef} />
      </div>
      <div className="lane-progress">
        <div className="lane-progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

export default function VisualizationArea({ stepsList, isRunning: _isRunning, onRun }: VisualizationAreaProps) {
  if (stepsList.length === 0) {
    return (
      <div className="viz-area">
        <div className="viz-empty">
          <div className="viz-empty-icon">&Sigma;</div>
          <div className="viz-empty-title">SortForge</div>
          <div className="viz-empty-subtitle">Visual algorithm benchmarking</div>
          <div className="viz-empty-hint">
            <span>Select algorithms above and</span>
            <span className="viz-empty-key">Space</span>
            <span>to run</span>
          </div>
        </div>
      </div>
    );
  }

  const multiColumn = stepsList.length > 3;

  return (
    <div className="viz-area">
      <div className={`lane-grid${multiColumn ? ' multi' : ''}`}>
        {stepsList.map((item, idx) => (
          <LaneCard
            key={item.algorithmId}
            steps={item.steps}
            color={PALETTE[idx % PALETTE.length]}
            name={getDisplayName(item.algorithmId)}
            complexity={getComplexity(item.algorithmId)}
          />
        ))}
      </div>
    </div>
  );
}
