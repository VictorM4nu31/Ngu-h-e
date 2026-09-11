import { Link, router, usePage } from '@inertiajs/react';
import {
    Bell,
    BellRing,
    CalendarDays,
    CheckCheck,
    CreditCard,
    Pill,
    UserRound,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getEcho } from '@/lib/echo';
import { __ } from '@/lib/i18n';
import type { AppNotification, PageProps } from '@/types';

interface IncomingBroadcast {
    id?: string;
    title?: string;
    message?: string;
    url?: string;
    icon?: string;
    appointment_id?: number;
    status?: string;
    actor?: string;
}

function toNotification(
    item: IncomingBroadcast,
    fallbackId: string,
): AppNotification {
    return {
        id: fallbackId,
        type: 'broadcast',
        data: {
            title: item.title || '',
            message: item.message || '',
            url: item.url || '/dashboard',
            icon: item.icon || 'calendar',
            appointment_id: item.appointment_id,
            status: item.status,
            actor: item.actor,
        },
        read_at: null,
        created_at: new Date().toISOString(),
    };
}

function NotificationIcon({ icon }: { icon: string }) {
    const className = 'size-4 text-primary';

    switch (icon) {
        case 'prescription':
            return <Pill className={className} />;
        case 'payment':
            return <CreditCard className={className} />;
        case 'reminder':
            return <BellRing className={className} />;
        case 'profile':
            return <UserRound className={className} />;
        default:
            return <CalendarDays className={className} />;
    }
}

/**
 * Notification bell shown in the global top bar. Initial data comes from
 * the shared Inertia props; new items arrive in real time over the user's
 * private channel (Reverb). Degrades gracefully to the initial props when
 * the socket is unavailable.
 */
export function NotificationBell() {
    const {
        auth,
        notifications: initial = [],
        unreadCount: initialUnread = 0,
    } = usePage<PageProps>().props;

    const [items, setItems] = useState<AppNotification[]>(initial);
    const [unread, setUnread] = useState<number>(initialUnread);

    // Keep in sync when navigating (Inertia refreshes shared props).
    // State adjustment during render is the endorsed pattern here.
    const [prevInitial, setPrevInitial] = useState(initial);

    if (prevInitial !== initial) {
        setPrevInitial(initial);
        setItems(initial);
        setUnread(initialUnread);
    }

    // Real-time subscription to the user's private channel.
    useEffect(() => {
        const userId = auth.user?.id;

        if (!userId) {
            return;
        }

        const echo = getEcho();

        if (!echo) {
            return undefined;
        }

        const channel = echo.private(`App.Models.User.${userId}`);

        channel.notification((notification: IncomingBroadcast) => {
            setItems((prev) =>
                [
                    toNotification(
                        notification,
                        notification.id || `live-${Date.now()}`,
                    ),
                    ...prev,
                ].slice(0, 15),
            );
            setUnread((prev) => prev + 1);
        });

        return () => {
            echo.leave(`App.Models.User.${userId}`);
        };
    }, [auth.user?.id]);

    const markAllRead = () => {
        router.post(
            '/notifications/read-all',
            {},
            {
                preserveScroll: true,
                preserveState: true,
                only: ['notifications', 'unreadCount'],
                onSuccess: () => {
                    setItems((prev) =>
                        prev.map((item) => ({
                            ...item,
                            read_at: item.read_at || new Date().toISOString(),
                        })),
                    );
                    setUnread(0);
                },
            },
        );
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={__('Notifications')}
                    className="relative"
                >
                    <Bell className="size-5" />
                    {unread > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-destructive text-[11px] font-bold text-white">
                            {unread > 9 ? '9+' : unread}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>{__('Notifications')}</span>
                    {unread > 0 && (
                        <button
                            type="button"
                            onClick={markAllRead}
                            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                            <CheckCheck className="size-3.5" />
                            {__('Mark all as read')}
                        </button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {items.length === 0 && (
                    <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                        {__('You have no notifications.')}
                    </p>
                )}
                {items.slice(0, 10).map((item) => (
                    <DropdownMenuItem key={item.id} asChild>
                        <Link
                            href={item.data.url}
                            onClick={() => {
                                if (!item.read_at) {
                                    router.post(
                                        `/notifications/${item.id}/read`,
                                        {},
                                        { preserveScroll: true },
                                    );
                                }
                            }}
                            className="flex cursor-pointer items-start gap-2.5 py-2.5"
                        >
                            <span className="mt-0.5 rounded-md bg-primary/10 p-1.5">
                                <NotificationIcon icon={item.data.icon} />
                            </span>
                            <span className="flex-1 space-y-0.5">
                                <span className="flex items-center gap-1.5 text-sm font-semibold">
                                    {!item.read_at && (
                                        <span className="size-1.5 rounded-full bg-primary" />
                                    )}
                                    {item.data.title}
                                </span>
                                <span className="block text-xs text-muted-foreground">
                                    {item.data.message}
                                </span>
                            </span>
                        </Link>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
