import { Link, usePage } from '@inertiajs/react';
import { Command, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { PageProps } from '@/types';

interface PaletteAction {
    label: string;
    description: string;
    href: string;
    roles?: string[];
}

export function CommandPalette() {
    const { auth } = usePage<PageProps>().props;
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const roles = auth.user.roles?.map((role) => role.name) ?? [];

    const actions: PaletteAction[] = [
        {
            label: 'Dashboard',
            description: "See today's clinical activity",
            href: '/dashboard',
        },
        {
            label: 'Search patients',
            description: 'Open the patient directory',
            href: '/patients',
            roles: ['admin', 'doctor', 'receptionist'],
        },
        {
            label: 'Open appointments',
            description: "Coordinate today's schedule",
            href: '/appointments',
            roles: ['admin', 'doctor', 'receptionist'],
        },
        {
            label: 'New consultation',
            description: 'Start a clinical record from a patient',
            href: '/consultations/create',
            roles: ['admin', 'doctor'],
        },
        {
            label: 'Register payment',
            description: 'Record a clinic transaction',
            href: '/payments',
            roles: ['admin', 'receptionist'],
        },
        {
            label: 'Book appointment',
            description: 'Find a time with a doctor',
            href: '/book-appointment',
            roles: ['patient'],
        },
    ];

    const visibleActions = actions
        .filter(
            (action) =>
                !action.roles ||
                action.roles.some((role) => roles.includes(role)),
        )
        .filter((action) => {
            const value = `${action.label} ${action.description}`.toLowerCase();

            return value.includes(query.toLowerCase());
        });

    useEffect(() => {
        const handleShortcut = (event: KeyboardEvent) => {
            if (
                (event.metaKey || event.ctrlKey) &&
                event.key.toLowerCase() === 'k'
            ) {
                event.preventDefault();
                setOpen((current) => !current);
            }

            if (event.key === 'Escape') {
                setOpen(false);
            }
        };

        window.addEventListener('keydown', handleShortcut);

        return () => window.removeEventListener('keydown', handleShortcut);
    }, []);

    useEffect(() => {
        if (open) {
            setQuery('');
        }
    }, [open]);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="hidden items-center gap-2 rounded-lg border border-border/80 bg-background px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground lg:flex"
                aria-label="Open command palette"
            >
                <Search className="size-3.5" />
                <span>Search actions</span>
                <kbd className="ml-2 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                    ⌘K
                </kbd>
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/35 px-4 pt-[14vh] backdrop-blur-sm"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.currentTarget === event.target)
                            setOpen(false);
                    }}
                >
                    <div
                        className="w-full max-w-xl overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Command palette"
                    >
                        <div className="flex items-center gap-3 border-b border-border px-4">
                            <Command className="size-4 text-primary" />
                            <input
                                autoFocus
                                value={query}
                                onChange={(event) =>
                                    setQuery(event.target.value)
                                }
                                placeholder="Search a patient, section or action..."
                                className="h-14 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                            />
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                                aria-label="Close command palette"
                            >
                                <X className="size-4" />
                            </button>
                        </div>
                        <div className="max-h-[min(24rem,60vh)] overflow-y-auto p-2">
                            {visibleActions.length > 0 ? (
                                visibleActions.map((action) => (
                                    <Link
                                        key={action.href}
                                        href={action.href}
                                        prefetch
                                        onClick={() => setOpen(false)}
                                        className="flex items-center justify-between gap-4 rounded-lg px-3 py-3 transition-colors hover:bg-accent focus-visible:bg-accent"
                                    >
                                        <span className="min-w-0">
                                            <span className="block text-sm font-semibold">
                                                {action.label}
                                            </span>
                                            <span className="block truncate text-xs text-muted-foreground">
                                                {action.description}
                                            </span>
                                        </span>
                                        <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                                            ↵
                                        </span>
                                    </Link>
                                ))
                            ) : (
                                <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                                    No actions found.
                                </p>
                            )}
                        </div>
                        <div className="border-t border-border bg-muted/35 px-4 py-2 text-[10px] text-muted-foreground">
                            Press <kbd className="font-mono">Esc</kbd> to close
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
