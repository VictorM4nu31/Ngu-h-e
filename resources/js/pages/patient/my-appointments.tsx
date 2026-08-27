import { Head } from '@inertiajs/react';
import { Calendar, Clock, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { formatStoredDate, formatStoredTime } from '@/lib/date';
import type { BreadcrumbItem, PaginationLink } from '@/types';

interface Appointment {
    id: number;
    doctor: { id: number; name: string };
    start_time: string;
    end_time: string;
    status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
    reason: string;
}

interface Props {
    appointments: {
        data: Appointment[];
        links: PaginationLink[];
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Mis Citas', href: '/my-appointments' },
];

const statusColors: Record<string, string> = {
    scheduled:
        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    confirmed:
        'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    completed:
        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    no_show:
        'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
};

const statusLabels: Record<string, string> = {
    scheduled: 'Programada',
    confirmed: 'Confirmada',
    completed: 'Completada',
    cancelled: 'Cancelada',
    no_show: 'No asistió',
};

export default function MyAppointments({ appointments }: Props) {
    const data = Array.isArray(appointments)
        ? appointments
        : appointments?.data || [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mis Citas" />

            <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4">
                <h1 className="flex items-center gap-2 text-2xl font-bold">
                    <Calendar className="size-6" />
                    Mis Citas
                </h1>

                <div className="grid gap-4">
                    {data.length > 0 ? (
                        data.map((app) => (
                            <Card key={app.id} className="overflow-hidden">
                                <CardContent className="p-4">
                                    <div className="flex flex-col items-start gap-4 md:flex-row md:items-center">
                                        <div className="flex min-w-[90px] flex-col items-center justify-center rounded-lg bg-muted/50 p-3">
                                            <Clock className="mb-1 size-4 text-muted-foreground" />
                                            <span className="text-sm font-bold">
                                                {formatStoredTime(
                                                    app.start_time,
                                                )}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {formatStoredDate(
                                                    app.start_time,
                                                )}
                                            </span>
                                        </div>

                                        <div className="flex-1 space-y-1">
                                            {app.doctor && (
                                                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                    <User className="size-3.5" />
                                                    {app.doctor.name}
                                                </p>
                                            )}
                                            {app.reason && (
                                                <p className="text-sm">
                                                    {app.reason}
                                                </p>
                                            )}
                                        </div>

                                        <Badge
                                            variant="outline"
                                            className={statusColors[app.status]}
                                        >
                                            {statusLabels[app.status]}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 p-12">
                            <Calendar className="mb-4 size-12 text-muted-foreground/30" />
                            <h3 className="text-lg font-medium text-muted-foreground">
                                No tienes citas registradas
                            </h3>
                            <p className="text-sm text-muted-foreground/60">
                                Tus próximas citas aparecerán aquí.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
