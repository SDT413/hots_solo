import React, { useState } from 'react';
import type { Rank } from '../types';
import { RankId } from '../types';
import RankEditorModal from './RankEditorModal';

interface LegendProps {
  ranks: Rank[];
  selectedRank: RankId | null;
  onRankSelect: (rankId: RankId) => void;
  onAddRank: (rank: Omit<Rank, 'id'>) => void;
  onUpdateRank: (rank: Rank) => void;
  onDeleteRank: (rankId: RankId) => void;
}

const Legend: React.FC<LegendProps> = ({ ranks, selectedRank, onRankSelect, onAddRank, onUpdateRank, onDeleteRank }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRank, setEditingRank] = useState<Rank | null>(null);
  
  const handleEdit = (e: React.MouseEvent, rank: Rank) => {
    e.stopPropagation();
    setEditingRank(rank);
    setIsModalOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, rankId: RankId) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this rank? This will reset all corresponding cells in the grid.")) {
      onDeleteRank(rankId);
    }
  };
  
  const handleAdd = () => {
    setEditingRank(null);
    setIsModalOpen(true);
  };
  
  const handleSave = (rankData: Omit<Rank, 'id'>) => {
     if (editingRank) {
       onUpdateRank({ ...rankData, id: editingRank.id });
     } else {
       onAddRank(rankData);
     }
     setIsModalOpen(false);
  };

  return (
    <>
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 w-full">
        <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Legend & Rank Editor</h2>
            <p className="text-gray-400 text-sm">Select a rank to apply, or hover to edit.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {ranks.map((rank, index) => (
            <div key={rank.id} className="relative group rounded-lg">
              <button
                onClick={() => onRankSelect(rank.id)}
                className={`w-full h-full flex items-center p-3 rounded-lg text-left transition-all duration-200 focus:outline-none ${
                  selectedRank === rank.id ? rank.selectedColorClass : 'hover:bg-gray-700'
                }`}
                aria-pressed={selectedRank === rank.id}
              >
                <div className={`w-6 h-6 rounded-md mr-4 flex-shrink-0 ${rank.colorClass.split(' ')[0]}`}></div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{rank.name}</p>
                  <p className="text-xs text-gray-400 truncate">{rank.description}</p>
                </div>
                {index < 9 && (
                  <div className="ml-2 w-5 h-5 bg-gray-900 bg-opacity-70 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                )}
              </button>
              <div className="absolute top-1/2 -translate-y-1/2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-gray-900/50 backdrop-blur-sm p-1 rounded-md">
                <button onClick={(e) => handleEdit(e, rank)} className="p-1 text-gray-300 hover:text-white" aria-label={`Edit ${rank.name}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                </button>
                <button onClick={(e) => handleDelete(e, rank.id)} className="p-1 text-gray-300 hover:text-red-500" aria-label={`Delete ${rank.name}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                </button>
              </div>
            </div>
          ))}
          {ranks.length < 9 && (
            <button 
              onClick={handleAdd}
              className="w-full flex items-center justify-center p-3 rounded-lg transition-colors duration-200 border-2 border-dashed border-gray-600 hover:border-gray-500 hover:bg-gray-700 text-gray-400"
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
               Add New Rank
            </button>
          )}
        </div>
      </div>
      {isModalOpen && (
        <RankEditorModal 
          rank={editingRank}
          onSave={handleSave}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default Legend;
