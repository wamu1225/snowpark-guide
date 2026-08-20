import type { Entry } from '../types';
import { projectionEntries } from './projection';
import { filteringEntries } from './filtering';

// カテゴリを1本ずつ追加していく。
export const ALL_ENTRIES: Entry[] = [...projectionEntries, ...filteringEntries];
