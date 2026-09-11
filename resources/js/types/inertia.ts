import type { User } from './auth';

export interface AppNotification {
    id: string;
    type: string;
    data: {
        title: string;
        message: string;
        url: string;
        icon: string;
        appointment_id?: number;
        status?: string;
        actor?: string;
    };
    read_at: string | null;
    created_at: string;
}

export interface PageProps {
    auth: { user: User & { roles?: { name: string }[] } };
    flash?: { success?: string | null; error?: string | null };
    translations?: Record<string, string>;
    appTimezone?: string;
    name?: string;
    notifications?: AppNotification[];
    unreadCount?: number;
    [key: string]: unknown;
}
