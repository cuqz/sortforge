import type { AlgorithmInfo, DataType } from '../types';

interface ControlPanelProps {
  algorithms: AlgorithmInfo[];
  selectedAlgorithms: string[];
  onToggleAlgorithm: (id: string) => void;
  dataType: DataType;
  onDataTypeChange: (dt: DataType) => void;
  arraySize: number;
  onArraySizeChange: (size: number) => void;
  raceMode: boolean;
  onRaceModeChange: (race: boolean) => void;
  onRun: () => void;
  isRunning: boolean;
  onToggleCodeEditor: () => void;
  showCodeEditor: boolean;
}

const DATA_TYPES: { value: DataType; label: string }[] = [
  { value: 'random', label: 'Random' },
  { value: 'nearly-sorted', label: 'Nearly Sorted' },
  { value: 'reversed', label: 'Reversed' },
  { value: 'few-unique', label: 'Few Unique' },
];

export default function ControlPanel({
  algorithms,
  selectedAlgorithms,
  onToggleAlgorithm,
  dataType,
  onDataTypeChange,
  arraySize,
  onArraySizeChange,
  raceMode,
  onRaceModeChange,
  onRun,
  isRunning,
  onToggleCodeEditor,
  showCodeEditor,
}: ControlPanelProps) {
  return (
    <section className="control-panel">
      <div className="control-row">
        <div className="control-group">
          <label className="control-label">
            {selectedAlgorithms.length} algorithm{selectedAlgorithms.length !== 1 ? 's' : ''} selected
          </label>
          <div className="algorithms-grid">
            {algorithms.map((a) => (
              <label key={a.id} className={`algo-checkbox ${selectedAlgorithms.includes(a.id) ? 'selected' : ''}`}>
                <input
                  type="checkbox"
                  checked={selectedAlgorithms.includes(a.id)}
                  onChange={() => onToggleAlgorithm(a.id)}
                />
                <span>{a.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="control-row">
        <div className="control-group">
          <label className="control-label">Data Type</label>
          <div className="radio-group">
            {DATA_TYPES.map((dt) => (
              <label key={dt.value} className={`radio-label ${dataType === dt.value ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="dataType"
                  value={dt.value}
                  checked={dataType === dt.value}
                  onChange={() => onDataTypeChange(dt.value)}
                />
                <span>{dt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="control-group">
          <label className="control-label">Size · {arraySize}</label>
          <input
            type="range"
            min={10}
            max={500}
            value={arraySize}
            onChange={(e) => onArraySizeChange(Number(e.target.value))}
            className="size-slider"
          />
        </div>
      </div>

      <div className="control-row actions">
        <label className="race-toggle">
          <input
            type="checkbox"
            checked={raceMode}
            onChange={(e) => onRaceModeChange(e.target.checked)}
          />
          <span>Race</span>
        </label>

        <button
          className="btn btn-secondary"
          onClick={onToggleCodeEditor}
        >
          {showCodeEditor ? 'Hide Editor' : 'Custom Sort'}
        </button>

        <button
          className="btn btn-primary"
          onClick={onRun}
          disabled={isRunning || selectedAlgorithms.length === 0}
        >
          {isRunning ? 'Benchmarking...' : 'Run Benchmark'}
        </button>
      </div>
    </section>
  );
}
