import type { Entry } from '../types';
import { projectionEntries } from './projection';
import { filteringEntries } from './filtering';
import { aggregationEntries } from './aggregation';
import { joinsEntries } from './joins';
import { sortingEntries } from './sorting';
import { expressionsEntries } from './expressions';

// カテゴリを1本ずつ追加していく。
export const ALL_ENTRIES: Entry[] = [
  ...projectionEntries,
  ...filteringEntries,
  ...aggregationEntries,
  ...joinsEntries,
  ...sortingEntries,
  ...expressionsEntries,
];
