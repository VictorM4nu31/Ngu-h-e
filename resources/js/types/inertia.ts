import type { User } from './auth';

export interface PageProps {
    auth: { user: User & { roles?: { name: string }[] } };
    flash?: { success?: string | null; error?: string | null };
    translations?: Record<string, string>;
    appTimezone?: string;
    name?: string;
    [key: string]: unknown;
}
