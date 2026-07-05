import { useState, useEffect, useCallback, useRef } from 'react';
import type { AlgorithmInfo, DataType, SortResult, ViewMode } from './types';
import { algorithms as localAlgorithms } from './algorithms/registry';
import { fetchAlgorithms } from './api/client';
import { generateArray } from './utils/array';
import { runSortsInParallel } from './algorithms/runner';
import TopBar from './components/TopBar';
import ControlPanel from './components/ControlPanel';
import VisualizationArea from './components/VisualizationArea';
import ResultsPanel from './components/ResultsPanel';
import Playground from './components/Playground';
import BenchmarkDashboard from './components/BenchmarkDashboard';
import Community from './components/Community';

export default function App() {
  const [algorithms, setAlgorithms] = useState<AlgorithmInfo[]>(localAlgorithms);
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>(['bubble', 'quick', 'merge']);
  const [dataType, setDataType] = useState<DataType>('random');
  const [arraySize, setArraySize] = useState(50);
  const [raceMode, setRaceMode] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<SortResult[]>([]);
  const [stepsList, setStepsList] = useState<{ algorithmId: string; steps: number[][]; arraySize: number }[]>([]);
  const [customCode, setCustomCode] = useState('');

  const [viewMode, setViewMode] = useState<ViewMode>('workspace');
  const [showMobilePanel, setShowMobilePanel] = useState(false);

  useEffect(() => {
    fetchAlgorithms()
      .then((data) => setAlgorithms(data))
      .catch((err) => { console.error('Failed to fetch algorithms:', err); setAlgorithms(localAlgorithms); });
  }, []);

  const handleToggleAlgorithm = useCallback((id: string) => {
    setSelectedAlgorithms((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }, []);

  const cancelRef = useRef<(() => void) | null>(null);

  const handleRun = useCallback(() => {
    if (isRunning) return;
    const algos = selectedAlgorithms;
    if (algos.length === 0) return;

    setIsRunning(true);
    setResults([]);
    setStepsList([]);

    const currentArray = generateArray(arraySize, dataType);
    const completedResults: SortResult[] = [];
    const completedSteps: { algorithmId: string; steps: number[][]; arraySize: number }[] = [];

    cancelRef.current = runSortsInParallel(
      algos,
      currentArray,
      arraySize,
      dataType,
      customCode,
      (result) => {
        completedResults.push(result);
        completedSteps.push({
          algorithmId: result.algorithmId,
          steps: result.steps,
          arraySize,
        });
      },
      () => {
        setResults([...completedResults]);
        setStepsList([...completedSteps]);
        setIsRunning(false);
        cancelRef.current = null;
      }
    );
  }, [selectedAlgorithms, dataType, arraySize, customCode, isRunning]);

  const handleRunRef = useRef(handleRun);
  handleRunRef.current = handleRun;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        handleRunRef.current();
      }
      if (e.key === '1') setViewMode('workspace');
      if (e.key === '2') setViewMode('playground');
      if (e.key === '3') setViewMode('benchmarks');
      if (e.key === '4') setViewMode('community');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const renderView = () => {
    switch (viewMode) {
      case 'workspace':
        return (
          <div className="workspace">
            <ControlPanel
              algorithms={algorithms}
              selectedAlgorithms={selectedAlgorithms}
              onToggleAlgorithm={handleToggleAlgorithm}
              dataType={dataType}
              onDataTypeChange={setDataType}
              arraySize={arraySize}
              onArraySizeChange={setArraySize}
              raceMode={raceMode}
              onRaceModeChange={setRaceMode}
              onRun={handleRun}
              isRunning={isRunning}
              onToggleCodeEditor={() => setViewMode('playground')}
              showCodeEditor={false}
            />
            <VisualizationArea
              stepsList={stepsList}
              isRunning={isRunning}
              onRun={handleRun}
            />
            {results.length > 0 && (
              <ResultsPanel
                results={results}
                dataType={dataType}
                arraySize={arraySize}
                customCode={customCode}
              />
            )}
          </div>
        );
      case 'playground':
        return <Playground />;
      case 'benchmarks':
        return <BenchmarkDashboard results={results} />;
      case 'community':
        return <Community />;
    }
  };

  return (
    <div className="app">
      <TopBar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onToggleSidebar={() => setShowMobilePanel(s => !s)}
      />
      {renderView()}
      {showMobilePanel && (
        <div className="mobile-overlay open" onClick={() => setShowMobilePanel(false)} />
      )}
    </div>
  );
}
