import type { Entry } from '../types';
import { projectionEntries } from './projection';

// カテゴリを1本ずつ追加していく（現時点では 2.1 射影・選択のみ）。
export const ALL_ENTRIES: Entry[] = [...projectionEntries];
