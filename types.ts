export type RankId = number | string;
export type GameMode = 'solo' | 'dual';

export interface Rank {
  id: RankId;
  name: string;
  description: string;
  colorClass: string;
  selectedColorClass: string;
}

export interface Character {
  name:string;
  image: string;
}

export interface ExportData {
  characters: Character[];
  ranks: Rank[];
  // For new exports with multiple modes
  gridStates?: {
    solo: RankId[][];
    dual: RankId[][];
  };
  // For backward compatibility with old single-grid exports
  gridState?: RankId[][];
}