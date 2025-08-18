import React, { useState, useCallback, useEffect, useRef } from 'react';
import { INITIAL_CHARACTERS, INITIAL_RANKS } from './constants';
import { RankId, Rank, Character, ExportData, GameMode } from './types';
import Grid from './components/Grid';
import Legend from './components/Legend';
import ImportExportModal from './components/ImportExportModal';

const DEFAULT_RANK_ID = 3; // Corresponds to "Even"

const createInitialGrid = (size: number): RankId[][] =>
    Array(size).fill(null).map(() => Array(size).fill(DEFAULT_RANK_ID));

function App() {
  const [characters, setCharacters] = useState<Character[]>(INITIAL_CHARACTERS);
  const [ranks, setRanks] = useState<Rank[]>(INITIAL_RANKS);

  const [activeMode, setActiveMode] = useState<GameMode>('solo');
  const [gridStates, setGridStates] = useState<{ solo: RankId[][]; dual: RankId[][] }>(() => {
    const initialGrid = createInitialGrid(INITIAL_CHARACTERS.length);
    return {
      solo: initialGrid,
      dual: initialGrid.map(row => [...row]), // Deep copy for the second grid
    };
  });

  const [selectedRank, setSelectedRank] = useState<RankId | null>(ranks.length > 0 ? ranks[0].id : null);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ranks.length > 0 && selectedRank === null) {
      setSelectedRank(ranks[0].id);
    }
  }, [ranks, selectedRank]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      const key = parseInt(event.key, 10);
      if (key >= 1 && key <= 9) {
        event.preventDefault();
        const rankIndex = key - 1;
        if (ranks[rankIndex]) {
          setSelectedRank(ranks[rankIndex].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [ranks]);

  const handleCellClick = useCallback((rowIndex: number, colIndex: number) => {
    if (selectedRank === null) return;
    setGridStates(prevState => {
      const newActiveGrid = prevState[activeMode].map(row => [...row]);
      newActiveGrid[rowIndex][colIndex] = selectedRank;
      return {
        ...prevState,
        [activeMode]: newActiveGrid,
      };
    });
  }, [selectedRank, activeMode]);

  const handleRankSelect = useCallback((rankId: RankId) => {
    setSelectedRank(rankId);
  }, []);
  
  const handleReset = useCallback(() => {
    setGridStates(prev => ({
      ...prev,
      [activeMode]: createInitialGrid(characters.length)
    }));
  }, [characters, activeMode]);

  const handleAddRank = useCallback((newRankData: Omit<Rank, 'id'>) => {
    setRanks(prevRanks => {
      const newRank: Rank = {
        ...newRankData,
        id: Date.now().toString(),
      };
      return [...prevRanks, newRank];
    });
  }, []);
  
  const handleUpdateRank = useCallback((updatedRank: Rank) => {
    setRanks(prevRanks => prevRanks.map(r => r.id === updatedRank.id ? updatedRank : r));
  }, []);

  const handleDeleteRank = useCallback((rankIdToDelete: RankId) => {
    // When a rank is deleted, it must be reset in BOTH grids.
    setGridStates(prevState => ({
      solo: prevState.solo.map(row => row.map(cellRankId => cellRankId === rankIdToDelete ? DEFAULT_RANK_ID : cellRankId)),
      dual: prevState.dual.map(row => row.map(cellRankId => cellRankId === rankIdToDelete ? DEFAULT_RANK_ID : cellRankId)),
    }));

    const remainingRanks = ranks.filter(rank => rank.id !== rankIdToDelete);
    setRanks(remainingRanks);
    
    if (selectedRank === rankIdToDelete) {
      setSelectedRank(remainingRanks.length > 0 ? remainingRanks[0].id : null);
    }
  }, [ranks, selectedRank]);

  const handleImport = useCallback((data: ExportData) => {
    if (!data.characters || !data.ranks || (!data.gridState && !data.gridStates) ||
        !Array.isArray(data.characters) || !Array.isArray(data.ranks)) {
      alert('Invalid import file format.');
      return;
    }
    
    setCharacters(data.characters);
    setRanks(data.ranks);

    if (data.gridStates && data.gridStates.solo && data.gridStates.dual) {
      // New format with both grids
      setGridStates(data.gridStates);
    } else if (data.gridState && Array.isArray(data.gridState)) {
      // Legacy format, load into solo and create a default for dual
      const defaultDualGrid = createInitialGrid(data.characters.length);
      setGridStates({
        solo: data.gridState,
        dual: defaultDualGrid,
      });
    }


    if (data.ranks.length > 0) {
      setSelectedRank(data.ranks[0].id);
    } else {
      setSelectedRank(null);
    }

    alert('Data imported successfully!');
    setIsImportExportModalOpen(false);
  }, []);

  const activeGridState = gridStates[activeMode];

  return (
      <>
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-8 font-sans">
          <header className="w-full max-w-7xl text-center mb-6">
            <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              Heroes Matchup Ranker
            </h1>
            <p className="text-lg text-gray-400 mt-2">
              Who did the opponent pick? Select a rank and build your counter-pick chart.
            </p>
          </header>

          <main className="w-full max-w-[1600px] flex flex-col gap-6 items-center justify-center">

            {/* Mode Tabs */}
            <div className="w-full max-w-md bg-gray-800 p-1 rounded-lg flex space-x-1 border border-gray-700">
              <button
                  onClick={() => setActiveMode('solo')}
                  className={`w-full py-2 px-4 rounded-md text-sm font-semibold transition-colors ${activeMode === 'solo' ? 'bg-purple-600 text-white shadow' : 'text-gray-300 hover:bg-gray-700'}`}
              >
                Solo Lane
              </button>
              <button
                  onClick={() => setActiveMode('dual')}
                  className={`w-full py-2 px-4 rounded-md text-sm font-semibold transition-colors ${activeMode === 'dual' ? 'bg-purple-600 text-white shadow' : 'text-gray-300 hover:bg-gray-700'}`}
              >
                Dual Lane
              </button>
            </div>

            <div className="flex-grow w-full overflow-x-auto">
              <Grid
                  ref={gridRef}
                  characters={characters}
                  gridState={activeGridState}
                  ranks={ranks}
                  onCellClick={handleCellClick}
              />
            </div>

            <div className="w-full lg:max-w-5xl flex-shrink-0">
              <Legend
                  ranks={ranks}
                  selectedRank={selectedRank}
                  onRankSelect={handleRankSelect}
                  onAddRank={handleAddRank}
                  onUpdateRank={handleUpdateRank}
                  onDeleteRank={handleDeleteRank}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <button
                    onClick={() => setIsImportExportModalOpen(true)}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" /><path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z" clipRule="evenodd" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" /><path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 10a1 1 0 112 0v3a1 1 0 11-2 0v-3z" clipRule="evenodd" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-7a1 1 0 112 0v4a1 1 0 11-2 0v-4z" clipRule="evenodd" /><path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm1 2a1 1 0 011-1h8a1 1 0 011 1v6a1 1 0 01-1 1H6a1 1 0 01-1-1V6z" /><path fillRule="evenodd" d="M10 3a1 1 0 01.894.553l2.882 5.764a1 1 0 01-.894 1.447H7.118a1 1 0 01-.894-1.447l2.882-5.764A1 1 0 0110 3zM6 12a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z" clipRule="evenodd" /><path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2H4zm1 2h10v6H5V7z" clipRule="evenodd" /><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm8 3a1 1 0 011 1v4a1 1 0 11-2 0V8a1 1 0 011-1z" /></svg>
                  Import / Export
                </button>
                <button
                    onClick={handleReset}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
                  Reset Grid
                </button>
              </div>
            </div>
          </main>

          <footer className="mt-12 text-center text-gray-500">
            <p>Inspired by the classic Heroes of the Storm solo lane matchup chart.</p>
            <p>Use keys <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">1</kbd> - <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">9</kbd> to select ranks. Hover over a rank to edit or delete.</p>
          </footer>
        </div>
        {isImportExportModalOpen && (
            <ImportExportModal
                isOpen={isImportExportModalOpen}
                onClose={() => setIsImportExportModalOpen(false)}
                onImport={handleImport}
                gridRef={gridRef}
                characters={characters}
                ranks={ranks}
                gridStates={gridStates}
                activeMode={activeMode}
            />
        )}
      </>
  );
}

export default App;