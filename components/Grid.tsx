import React, { forwardRef } from 'react';
import { RankId, Character, Rank } from '../types';
import Cell from './Cell';

interface GridProps {
  characters: Character[];
  gridState: RankId[][];
  ranks: Rank[];
  onCellClick: (rowIndex: number, colIndex: number) => void;
}

const Grid = forwardRef<HTMLDivElement, GridProps>(({ characters, gridState, ranks, onCellClick }, ref) => {
  return (
    <div ref={ref} className="relative border border-gray-700 bg-gray-800 rounded-xl p-2 shadow-lg">
        <div className="absolute top-2 left-2 w-32 h-32 text-center flex items-end justify-start p-2">
            <span className="transform -rotate-45 text-gray-400 font-bold text-sm">Your Pick</span>
        </div>
        <div className="absolute top-2 left-2 w-32 h-32 text-center flex items-start justify-end p-2">
            <span className="transform -rotate-45 text-gray-400 font-bold text-sm">Opponent</span>
        </div>
        <div 
            className="grid gap-px"
            style={{
                gridTemplateColumns: `minmax(8rem, auto) repeat(${characters.length}, minmax(2.5rem, 1fr))`,
                gridTemplateRows: `minmax(8rem, auto) repeat(${characters.length}, minmax(2.5rem, 1fr))`,
            }}
        >
            {/* Top-left empty cell */}
            <div className="bg-gray-800 sticky top-0 left-0 z-20" style={{
                clipPath: 'polygon(0 0, 100% 0, 0 100%)'
            }}></div>

            {/* Top Header: Opponent's Pick */}
            {characters.map((char, index) => (
                <div key={`col-header-${index}`} className="sticky top-0 z-10 flex flex-col items-center justify-end p-1 bg-gray-800">
                    <span className="writing-mode-vertical-rl transform rotate-180 text-xs font-semibold whitespace-nowrap text-gray-300 pb-1">
                        {char.name}
                    </span>
                    <img src={char.image} alt={char.name} className="w-16 h-16 object-cover rounded-md border-2 border-gray-600"/>
                </div>
            ))}

            {/* Side Header and Grid Cells */}
            {characters.map((yourChar, rowIndex) => (
                <React.Fragment key={`row-${rowIndex}`}>
                    <div className="sticky left-0 z-10 flex items-center justify-end p-2 bg-gray-800">
                        <span className="text-xs sm:text-sm font-semibold text-right text-gray-300 mr-2">
                            {yourChar.name}
                        </span>
                        <img src={yourChar.image} alt={yourChar.name} className="w-16 h-16 object-cover rounded-md border-2 border-gray-600"/>
                    </div>
                    {characters.map((_, colIndex) => (
                         <Cell
                            key={`${rowIndex}-${colIndex}`}
                            rowIndex={rowIndex}
                            colIndex={colIndex}
                            rankId={gridState[rowIndex][colIndex]}
                            ranks={ranks}
                            isDiagonal={rowIndex === colIndex}
                            onCellClick={onCellClick}
                        />
                    ))}
                </React.Fragment>
            ))}
        </div>
        <style>{`
            .writing-mode-vertical-rl {
                writing-mode: vertical-rl;
            }
        `}</style>
    </div>
  );
});

export default Grid;
