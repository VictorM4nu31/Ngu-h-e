import { usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';

/**
 * Get a translation string from the translations object.
 *
 * @param key - The translation key (e.g., 'auth.failed')
 * @param replacements - Object with replacement values
 * @returns The translated string
 */
export function trans(
    key: string,
    replacements?: Record<string, string | number>,
): string {
    // __() is only invoked during render of Inertia components, so reading the
    // shared props via usePage here is intentional.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { translations } = usePage<PageProps>().props;

    let translation = translations?.[key] || key;

    if (replacements) {
        Object.entries(replacements).forEach(([placeholder, value]) => {
            translation = translation.replace(`:${placeholder}`, String(value));
        });
    }

    return translation;
}

/**
 * Alias for trans function
 */
export const __ = trans;
