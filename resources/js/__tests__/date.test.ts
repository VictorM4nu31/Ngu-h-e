import { describe, expect, it } from 'vitest';
import { localDateInputValue, localDateTimeInputValue } from '@/lib/date';

describe('lib/date helpers', () => {
    it('localDateInputValue formats a date as YYYY-MM-DD', () => {
        expect(localDateInputValue(new Date(2026, 7, 29))).toBe('2026-08-29');
        expect(localDateInputValue(new Date(2026, 0, 5))).toBe('2026-01-05');
    });

    it('localDateTimeInputValue formats a date as YYYY-MM-DDTHH:MM', () => {
        expect(localDateTimeInputValue(new Date(2026, 7, 29, 9, 5))).toBe(
            '2026-08-29T09:05',
        );
        expect(localDateTimeInputValue(new Date(2026, 0, 5, 23, 59))).toBe(
            '2026-01-05T23:59',
        );
    });
});
