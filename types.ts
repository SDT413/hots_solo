export type RankId = number | string;

export interface Rank {
  id: RankId;
  name: string;
  description: string;
  colorClass: string;
  selectedColorClass: string;
}

export interface Character {
  name: string;
  image: string;
}

export interface ExportData {
  characters: Character[];
  ranks: Rank[];
  gridState: RankId[][];
}
