import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window {
        Pusher: typeof Pusher;
    }
}

let instance: Echo<'reverb'> | null = null;

/**
 * Shared Laravel Echo instance (Reverb). Returns null when the realtime
 * credentials are not configured — callers must fall back to the
 * server-rendered props in that case.
 */
export function getEcho(): Echo<'reverb'> | null {
    if (typeof window === 'undefined') {
        return null;
    }

    if (instance) {
        return instance;
    }

    const key = import.meta.env.VITE_REVERB_APP_KEY as string | undefined;

    if (!key) {
        return null;
    }

    window.Pusher = Pusher;

    instance = new Echo({
        broadcaster: 'reverb',
        key,
        wsHost:
            (import.meta.env.VITE_REVERB_HOST as string | undefined) ||
            window.location.hostname,
        wsPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
        wssPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
        forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
        enabledTransports: ['ws', 'wss'],
    });

    return instance;
}
