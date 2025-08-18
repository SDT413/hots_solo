import React, { useState, useEffect } from 'react';
import { COLOR_OPTIONS } from '../constants';
import type { Rank } from '../types';

type RankColor = typeof COLOR_OPTIONS[number];

interface RankEditorModalProps {
  rank: Rank | null;
  onSave: (rankData: Omit<Rank, 'id'>) => void;
  onClose: () => void;
}

const RankEditorModal: React.FC<RankEditorModalProps> = ({ rank, onSave, onClose }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedColor, setSelectedColor] = useState<RankColor>(COLOR_OPTIONS[0]);

    useEffect(() => {
        if (rank) {
            setName(rank.name);
            setDescription(rank.description);
            const colorOption = COLOR_OPTIONS.find(c => c.colorClass === rank.colorClass) || COLOR_OPTIONS[0];
            setSelectedColor(colorOption);
        } else {
            setName('');
            setDescription('');
            setSelectedColor(COLOR_OPTIONS[5]); // Default to green for new ranks
        }
    }, [rank]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            alert("Rank name is required.");
            return;
        }
        onSave({
            name,
            description,
            colorClass: selectedColor.colorClass,
            selectedColorClass: selectedColor.selectedColorClass
        });
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4" 
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="rank-editor-title"
        >
            <div 
                className="bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md border border-gray-700" 
                onClick={e => e.stopPropagation()}
            >
                <h3 id="rank-editor-title" className="text-2xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">{rank ? 'Edit Rank' : 'Add New Rank'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="rank-name" className="block text-sm font-medium text-gray-300 mb-1">Rank Name</label>
                        <input
                            id="rank-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="rank-description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                        <textarea
                            id="rank-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
                       <div className="grid grid-cols-8 gap-2">
                           {COLOR_OPTIONS.map(color => (
                               <button
                                   key={color.name}
                                   type="button"
                                   onClick={() => setSelectedColor(color)}
                                   className={`w-full aspect-square rounded-md transition-transform duration-150 transform hover:scale-110 ${color.colorClass.split(' ')[0]} ${selectedColor.name === color.name ? 'ring-4 ring-offset-2 ring-offset-gray-800 ring-white' : ''}`}
                                   aria-label={`Select color ${color.name}`}
                               >
                               </button>
                           ))}
                       </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 font-semibold transition-colors">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-500 font-semibold transition-colors">Save Rank</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RankEditorModal;
