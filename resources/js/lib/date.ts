import { usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';

const APP_TIMEZONE = 'America/Mexico_City';

export function localDateInputValue(date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export function localDateTimeInputValue(date = new Date()): string {
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');

    return `${localDateInputValue(date)}T${hour}:${minute}`;
}

function appTimezone(): string {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return usePage<PageProps>().props.appTimezone ?? APP_TIMEZONE;
}

export function formatStoredDate(
    value: string,
    options?: Intl.DateTimeFormatOptions,
): string {
    return new Date(value).toLocaleDateString('es-MX', {
        timeZone: appTimezone(),
        ...options,
    });
}

export function formatStoredTime(value: string): string {
    return new Date(value).toLocaleTimeString('es-MX', {
        timeZone: appTimezone(),
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
    });
}
