import type { TKey } from '@/i18n';
import type { TimeBlock } from '@/types/models';

/** `other` is reserved for plural entries in the dictionary type, so the "other" reason is stored as `misc`. */
export const blockReasonKey = (r: TimeBlock['reason']): TKey => `appointment.block.reasons.${r === 'other' ? 'misc' : r}`;
