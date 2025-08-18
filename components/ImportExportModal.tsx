import React, { useCallback } from 'react';
import type { Rank, Character, RankId, ExportData } from '../types';

declare const html2canvas: any;

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: ExportData) => void;
  gridRef: React.RefObject<HTMLDivElement>;
  characters: Character[];
  ranks: Rank[];
  gridState: RankId[][];
}

const ImportExportModal: React.FC<ImportExportModalProps> = ({ isOpen, onClose, onImport, gridRef, characters, ranks, gridState }) => {
  const downloadFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const downloadDataURL = (dataUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleExportJSON = useCallback(() => {
    const exportData: ExportData = { characters, ranks, gridState };
    const jsonString = JSON.stringify(exportData, null, 2);
    downloadFile(jsonString, 'matchup-data.json', 'application/json');
  }, [characters, ranks, gridState]);

  const handleExportCSV = useCallback(() => {
    const header = ['Your Pick', ...characters.map(c => c.name)];
    const csvRows = [header.join(',')];
    gridState.forEach((row, rowIndex) => {
      const rowData = [characters[rowIndex].name];
      row.forEach((rankId, colIndex) => {
        if (rowIndex === colIndex) {
          rowData.push(''); // Diagonal
        } else {
          const rank = ranks.find(r => r.id === rankId);
          rowData.push(rank ? `"${rank.name.replace(/"/g, '""')}"` : 'Unranked');
        }
      });
      csvRows.push(rowData.join(','));
    });
    const csvContent = csvRows.join('\n');
    downloadFile(csvContent, 'matchup-table.csv', 'text/csv;charset=utf-8;');
  }, [characters, ranks, gridState]);

  const handleExportImage = useCallback(async (format: 'png' | 'jpeg') => {
    if (!gridRef.current || typeof html2canvas === 'undefined') {
      alert('Error: Image generation library not loaded.');
      return;
    }
    try {
      const canvas = await html2canvas(gridRef.current, { 
        backgroundColor: '#1f2937', // bg-gray-800
        useCORS: true, 
        allowTaint: true 
      });
      const dataUrl = canvas.toDataURL(`image/${format}`, format === 'jpeg' ? 0.9 : 1.0);
      downloadDataURL(dataUrl, `matchup-table.${format}`);
    } catch (error) {
      console.error('Failed to export image:', error);
      alert('An error occurred while exporting the image. Check the console for details.');
    }
  }, [gridRef]);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("File could not be read.");
        const data = JSON.parse(text);
        onImport(data);
      } catch (error) {
        console.error("Import failed:", error);
        alert("Failed to import file. Please ensure it's a valid JSON export from this application.");
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-export-title"
    >
      <div 
        className="bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-lg border border-gray-700" 
        onClick={e => e.stopPropagation()}
      >
        <h3 id="import-export-title" className="text-2xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
          Import / Export Data
        </h3>
        
        <div className="space-y-6">
          {/* Export Section */}
          <div>
            <h4 className="text-lg font-semibold mb-3 text-gray-300 border-b border-gray-700 pb-2">Export</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button onClick={() => handleExportImage('png')} className="export-button">Export PNG</button>
              <button onClick={() => handleExportImage('jpeg')} className="export-button">Export JPG</button>
              <button onClick={handleExportJSON} className="export-button">Export JSON</button>
              <button onClick={handleExportCSV} className="export-button">Export CSV</button>
            </div>
             <p className="text-xs text-gray-500 mt-2">Export as JSON to save your full configuration, including custom ranks, for later import.</p>
          </div>

          {/* Import Section */}
          <div>
            <h4 className="text-lg font-semibold mb-3 text-gray-300 border-b border-gray-700 pb-2">Import</h4>
            <label htmlFor="import-file" className="w-full text-center px-4 py-3 rounded-md bg-gray-700 hover:bg-gray-600 font-semibold transition-colors cursor-pointer block">
              Click to select a JSON file
            </label>
            <input
              id="import-file"
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-xs text-gray-500 mt-2">Importing will overwrite your current grid and ranks.</p>
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 font-semibold transition-colors">Close</button>
        </div>
      </div>
       <style>{`
            .export-button {
                padding: 0.5rem 1rem;
                border-radius: 0.5rem;
                background-color: #374151; /* bg-gray-700 */
                font-weight: 600;
                transition: background-color 0.2s;
            }
            .export-button:hover {
                background-color: #4B5563; /* bg-gray-600 */
            }
        `}</style>
    </div>
  );
};

export default ImportExportModal;
