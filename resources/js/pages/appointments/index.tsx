import { Head, Link, router } from '@inertiajs/react';
import {
    Calendar,
    Clock,
    User,
    UserSearch,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Plus,
    ChevronLeft,
    ChevronRight,
    Activity,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { formatStoredTime, localDateInputValue } from '@/lib/date';
import type { BreadcrumbItem, PaginationLink } from '@/types';

interface Appointment {
    id: number;
    patient: { id: number; full_name: string };
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
    doctors: { id: number; name: string }[];
    filters: { doctor_id: string; date: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Agenda de Citas', href: '/appointments' },
];

export default function Index({ appointments, doctors, filters }: Props) {
    const [date, setDate] = useState(filters.date || localDateInputValue());
    const [doctorId, setDoctorId] = useState(filters.doctor_id || 'all');

    const handleFilter = (newDate?: string, newDoctorId?: string) => {
        const d = newDate !== undefined ? newDate : date;
        const dr = newDoctorId !== undefined ? newDoctorId : doctorId;

        router.get(
            '/appointments',
            {
                date: d,
                doctor_id: dr === 'all' ? undefined : dr,
            },
            { preserveState: true },
        );
    };

    const statusColors = {
        scheduled:
            'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300',
        confirmed:
            'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300',
        completed:
            'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300',
        cancelled:
            'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300',
        no_show:
            'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300',
    };

    const statusLabels = {
        scheduled: 'Programada',
        confirmed: 'Confirmada',
        completed: 'Completada',
        cancelled: 'Cancelada',
        no_show: 'No asistió',
    };

    const updateStatus = (id: number, status: string) => {
        router.put(`/appointments/${id}`, { status }, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Agenda de Citas" />

            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4">
                <div className="flex items-center justify-between gap-4">
                    <h1 className="flex items-center gap-2 text-2xl font-bold">
                        <Calendar className="size-6" />
                        Agenda de Citas
                    </h1>
                    <div className="flex gap-2">
                        <Link href="/patients">
                            <Button variant="outline" className="gap-2">
                                <UserSearch className="size-4" />
                                Buscar Paciente
                            </Button>
                        </Link>
                        <Link href="/appointments/create">
                            <Button className="gap-2">
                                <Plus className="size-4" />
                                Nueva Cita
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Filtros */}
                <Card>
                    <CardContent className="flex flex-wrap items-end gap-4 p-4">
                        <div className="grid min-w-[200px] flex-1 gap-1.5">
                            <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Médico
                            </label>
                            <Select
                                onValueChange={(val) => {
                                    setDoctorId(val);
                                    handleFilter(undefined, val);
                                }}
                                value={doctorId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Todos los médicos" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Todos los médicos
                                    </SelectItem>
                                    {doctors.map((dr) => (
                                        <SelectItem
                                            key={dr.id}
                                            value={dr.id.toString()}
                                        >
                                            {dr.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid min-w-[200px] flex-1 gap-1.5">
                            <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                Fecha
                            </label>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                        const d = new Date(date);
                                        d.setDate(d.getDate() - 1);
                                        const str = d
                                            .toISOString()
                                            .split('T')[0];
                                        setDate(str);
                                        handleFilter(str);
                                    }}
                                >
                                    <ChevronLeft className="size-4" />
                                </Button>
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={(e) => {
                                        setDate(e.target.value);
                                        handleFilter(e.target.value);
                                    }}
                                    className="flex-1"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                        const d = new Date(date);
                                        d.setDate(d.getDate() + 1);
                                        const str = d
                                            .toISOString()
                                            .split('T')[0];
                                        setDate(str);
                                        handleFilter(str);
                                    }}
                                >
                                    <ChevronRight className="size-4" />
                                </Button>
                            </div>
                        </div>

                        <Button
                            variant="secondary"
                            onClick={() => {
                                const today = localDateInputValue();
                                setDate(today);
                                setDoctorId('all');
                                handleFilter(today, 'all');
                            }}
                        >
                            HOY
                        </Button>
                    </CardContent>
                </Card>

                {/* Listado de Citas */}
                <div className="grid gap-4">
                    {appointments.data.length > 0 ? (
                        appointments.data.map((app) => (
                            <Card
                                key={app.id}
                                className="overflow-hidden border-l-4"
                                style={{
                                    borderLeftColor: 'rgb(var(--primary))',
                                }}
                            >
                                <div className="flex flex-col items-start gap-4 p-4 md:flex-row md:items-center">
                                    <div className="flex min-w-[80px] flex-col items-center justify-center rounded-lg bg-muted/50 p-2">
                                        <Clock className="mb-1 size-4 text-muted-foreground" />
                                        <span className="text-sm font-bold">
                                            {formatStoredTime(app.start_time)}
                                        </span>
                                    </div>

                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/patients/${app.patient.id}`}
                                                className="text-lg font-bold hover:underline"
                                            >
                                                {app.patient.full_name}
                                            </Link>
                                            <Badge
                                                variant="outline"
                                                className={
                                                    statusColors[app.status]
                                                }
                                            >
                                                {statusLabels[app.status]}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1.5">
                                                <User className="size-3.5" />
                                                {app.doctor.name}
                                            </span>
                                            {app.reason && (
                                                <span className="flex items-center gap-1.5">
                                                    <AlertCircle className="size-3.5" />
                                                    {app.reason}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 self-end md:self-center">
                                        {app.status === 'scheduled' && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-green-600 hover:bg-green-50 hover:text-green-700"
                                                onClick={() =>
                                                    updateStatus(
                                                        app.id,
                                                        'confirmed',
                                                    )
                                                }
                                            >
                                                <CheckCircle2 className="mr-1.5 size-4" />
                                                Confirmar
                                            </Button>
                                        )}
                                        {app.status !== 'completed' &&
                                            app.status !== 'cancelled' && (
                                                <Link
                                                    href={`/consultations/create?appointment_id=${app.id}`}
                                                >
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        className="gap-1.5"
                                                    >
                                                        <Activity className="size-4" />
                                                        Atender
                                                    </Button>
                                                </Link>
                                            )}
                                        {app.status !== 'completed' &&
                                            app.status !== 'cancelled' && (
                                                <Link
                                                    href={`/appointments/${app.id}/edit`}
                                                >
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                    >
                                                        Editar
                                                    </Button>
                                                </Link>
                                            )}
                                        {app.status !== 'completed' && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive"
                                                onClick={() => {
                                                    if (
                                                        confirm(
                                                            '¿Cancelar cita?',
                                                        )
                                                    )
                                                        updateStatus(
                                                            app.id,
                                                            'cancelled',
                                                        );
                                                }}
                                            >
                                                <XCircle className="mr-1.5 size-4" />
                                                Cancelar
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 p-12">
                            <Calendar className="mb-4 size-12 text-muted-foreground/30" />
                            <h3 className="text-lg font-medium text-muted-foreground">
                                No hay citas para este día
                            </h3>
                            <p className="text-sm text-muted-foreground/60">
                                Cambie la fecha o use el botón de hoy.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
