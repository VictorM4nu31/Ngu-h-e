import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User } from 'lucide-react';

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
        links: any[];
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Mis Citas', href: '/my-appointments' },
];

const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    confirmed: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    no_show: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
};

const statusLabels: Record<string, string> = {
    scheduled: 'Programada',
    confirmed: 'Confirmada',
    completed: 'Completada',
    cancelled: 'Cancelada',
    no_show: 'No asistió',
};

export default function MyAppointments({ appointments }: Props) {
    const data = Array.isArray(appointments) ? appointments : (appointments?.data || []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mis Citas" />

            <div className="flex flex-col gap-6 p-4 max-w-4xl mx-auto w-full">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Calendar className="size-6" />
                    Mis Citas
                </h1>

                <div className="grid gap-4">
                    {data.length > 0 ? (
                        data.map((app) => (
                            <Card key={app.id} className="overflow-hidden">
                                <CardContent className="p-4">
                                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                                        <div className="flex flex-col items-center justify-center bg-muted/50 p-3 rounded-lg min-w-[90px]">
                                            <Clock className="size-4 text-muted-foreground mb-1" />
                                            <span className="text-sm font-bold">
                                                {new Date(app.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(app.start_time).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <div className="flex-1 space-y-1">
                                            {app.doctor && (
                                                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                                    <User className="size-3.5" />
                                                    Dr. {app.doctor.name}
                                                </p>
                                            )}
                                            {app.reason && (
                                                <p className="text-sm">{app.reason}</p>
                                            )}
                                        </div>

                                        <Badge variant="outline" className={statusColors[app.status]}>
                                            {statusLabels[app.status]}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center p-12 bg-muted/30 rounded-xl border border-dashed">
                            <Calendar className="size-12 text-muted-foreground/30 mb-4" />
                            <h3 className="text-lg font-medium text-muted-foreground">No tienes citas registradas</h3>
                            <p className="text-sm text-muted-foreground/60">Tus próximas citas aparecerán aquí.</p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
