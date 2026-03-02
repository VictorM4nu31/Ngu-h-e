import { usePage } from '@inertiajs/react';

/**
 * Get a translation string from the translations object.
 *
 * @param key - The translation key (e.g., 'auth.failed')
 * @param replacements - Object with replacement values
 * @returns The translated string
 */
export function trans(key: string, replacements?: Record<string, string | number>): string {
    const { translations } = usePage().props as { translations: Record<string, string> };

    let translation = translations[key] || key;

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
