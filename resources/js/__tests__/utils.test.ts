import { describe, expect, it } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn', () => {
    it('merges class names and removes falsy values', () => {
        const extra = false;
        expect(cn('foo', 'bar')).toBe('foo bar');
        expect(cn('foo', extra && 'bar', null, undefined, 'baz')).toBe(
            'foo baz',
        );
    });

    it('resolves tailwind conflicts keeping the last class', () => {
        expect(cn('p-2', 'p-4')).toBe('p-4');
    });
});
