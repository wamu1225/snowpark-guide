import type { Entry } from '../types';
import { projectionEntries } from './projection';
import { filteringEntries } from './filtering';
import { aggregationEntries } from './aggregation';
import { joinsEntries } from './joins';
import { sortingEntries } from './sorting';
import { expressionsEntries } from './expressions';
import { windowEntries } from './window';
import { nullsEntries } from './nulls';
import { executionEntries } from './execution';

// カテゴリを1本ずつ追加していく。9カテゴリ56メソッドで完走。
export const ALL_ENTRIES: Entry[] = [
  ...projectionEntries,
  ...filteringEntries,
  ...aggregationEntries,
  ...joinsEntries,
  ...sortingEntries,
  ...expressionsEntries,
  ...windowEntries,
  ...nullsEntries,
  ...executionEntries,
];
