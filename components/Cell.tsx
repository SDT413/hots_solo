import React from 'react';
import { UNRANKED_COLOR, DIAGONAL_COLOR } from '../constants';
import { RankId, Rank } from '../types';

interface CellProps {
  rowIndex: number;
  colIndex: number;
  rankId: RankId;
  ranks: Rank[];
  isDiagonal: boolean;
  onCellClick: (rowIndex: number, colIndex: number) => void;
}

const Cell: React.FC<CellProps> = ({ rowIndex, colIndex, rankId, ranks, isDiagonal, onCellClick }) => {
  const rank = ranks.find(r => r.id === rankId);
  const color = rank ? rank.colorClass.split(' ')[0] : UNRANKED_COLOR;

  const handleClick = () => {
    if (!isDiagonal) {
      onCellClick(rowIndex, colIndex);
    }
  };

  if (isDiagonal) {
    return <div className={`aspect-square ${DIAGONAL_COLOR}`}></div>;
  }

  return (
    <button
      aria-label={`Set rank for row ${rowIndex + 1}, column ${colIndex + 1}`}
      onClick={handleClick}
      className={`aspect-square w-full h-full transition-transform duration-150 ease-in-out transform hover:scale-110 hover:z-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-400 ${color}`}
    ></button>
  );
};

// Memoize to prevent re-renders of all cells when only one changes
export default React.memo(Cell);
