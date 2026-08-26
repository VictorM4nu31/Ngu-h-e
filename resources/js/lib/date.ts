export function localDateInputValue(date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export function formatStoredDate(
    value: string,
    options?: Intl.DateTimeFormatOptions,
): string {
    return new Date(value).toLocaleDateString('es-MX', {
        timeZone: 'UTC',
        ...options,
    });
}

export function formatStoredTime(value: string): string {
    return new Date(value).toLocaleTimeString('es-MX', {
        timeZone: 'UTC',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
    });
}
