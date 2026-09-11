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
import { ConfirmDialog } from '@/components/confirm-dialog';
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
import { __ } from '@/lib/i18n';
import type { BreadcrumbItem, PaginationLink } from '@/types';

interface Appointment {
    id: number;
    patient: { id: number; full_name: string } | null;
    doctor: { id: number; name: string } | null;
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
    canAttend: boolean;
}

export default function Index({
    appointments,
    doctors,
    filters,
    canAttend,
}: Props) {
    const [date, setDate] = useState(filters.date || localDateInputValue());
    const [doctorId, setDoctorId] = useState(filters.doctor_id || 'all');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: __('Dashboard'), href: '/dashboard' },
        { title: __('Appointments'), href: '/appointments' },
    ];

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
            'border-clinical-blue/30 bg-accent text-clinical-blue dark:bg-accent/40',
        confirmed:
            'border-primary/30 bg-primary/10 text-primary dark:bg-primary/15',
        completed:
            'border-success/30 bg-success/10 text-clinical-green dark:bg-success/15',
        cancelled:
            'border-destructive/30 bg-destructive/10 text-destructive dark:bg-destructive/15',
        no_show:
            'border-warning/30 bg-warning/10 text-warning dark:bg-warning/15',
    };

    const statusLabels: Record<Appointment['status'], string> = {
        scheduled: __('Scheduled'),
        confirmed: __('Confirmed'),
        completed: __('Completed'),
        cancelled: __('Cancelled'),
        no_show: __('No Show'),
    };

    const updateStatus = (id: number, status: string) => {
        router.put(`/appointments/${id}`, { status }, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('Appointments')} />

            <div className="mx-auto flex w-full max-w-6xl flex-col gap-7 p-4 pb-10 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-primary uppercase">
                            {__('Clinical operations')}
                        </p>
                        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-[-0.04em]">
                            <Calendar className="size-6 text-primary" />
                            {__('Appointments')}
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {__(
                                'Move through the day with context, not just a list.',
                            )}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link href="/patients">
                            <Button variant="outline" className="gap-2">
                                <UserSearch className="size-4" />
                                {__('Search Patient')}
                            </Button>
                        </Link>
                        <Link href="/appointments/create">
                            <Button className="gap-2">
                                <Plus className="size-4" />
                                {__('New Appointment')}
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Filtros */}
                <Card>
                    <CardContent className="flex flex-wrap items-end gap-4 bg-muted/20 p-4">
                        <div className="grid min-w-[200px] flex-1 gap-1.5">
                            <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                {__('Doctor')}
                            </label>
                            <Select
                                onValueChange={(val) => {
                                    setDoctorId(val);
                                    handleFilter(undefined, val);
                                }}
                                value={doctorId}
                            >
                                <SelectTrigger>
                                    <SelectValue
                                        placeholder={__('All doctors')}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        {__('All doctors')}
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
                                {__('Date')}
                            </label>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    aria-label={__('Previous day')}
                                    onClick={() => {
                                        const d = new Date(date);
                                        d.setDate(d.getDate() - 1);
                                        const str = localDateInputValue(d);
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
                                    aria-label={__('Next day')}
                                    onClick={() => {
                                        const d = new Date(date);
                                        d.setDate(d.getDate() + 1);
                                        const str = localDateInputValue(d);
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
                            {__('Today')}
                        </Button>
                    </CardContent>
                </Card>

                {/* Timeline de citas */}
                <div className="relative grid gap-3 before:absolute before:top-2 before:bottom-2 before:left-[3.75rem] before:w-px before:bg-border sm:before:left-[4.75rem]">
                    {appointments.data.length > 0 ? (
                        appointments.data.map((app) => (
                            <Card
                                key={app.id}
                                className="group relative border-border/80 shadow-none transition-colors hover:border-primary/45"
                            >
                                <div className="flex flex-col items-start gap-4 p-4 sm:flex-row sm:items-center">
                                    <div className="z-10 flex min-w-[4.5rem] flex-col items-center justify-center bg-card py-1 sm:min-w-[5.5rem]">
                                        <Clock className="mb-1 size-4 text-muted-foreground" />
                                        <span className="font-mono text-sm font-bold tracking-tight text-primary">
                                            {formatStoredTime(app.start_time)}
                                        </span>
                                    </div>

                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            {app.patient ? (
                                                <Link
                                                    href={`/patients/${app.patient.id}`}
                                                    className="text-lg font-semibold tracking-[-0.02em] transition-colors group-hover:text-primary"
                                                >
                                                    {app.patient.full_name}
                                                </Link>
                                            ) : (
                                                <span className="text-lg font-bold text-muted-foreground">
                                                    {__('Unassigned patient')}
                                                </span>
                                            )}
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
                                                {app.doctor?.name ??
                                                    __('Unassigned')}
                                            </span>
                                            {app.reason && (
                                                <span className="flex items-center gap-1.5">
                                                    <AlertCircle className="size-3.5" />
                                                    {app.reason}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-end gap-2 self-end md:self-center">
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
                                                {__('Confirm')}
                                            </Button>
                                        )}
                                        {canAttend &&
                                            app.status !== 'completed' &&
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
                                                        {__('Attend')}
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
                                                        {__('Edit')}
                                                    </Button>
                                                </Link>
                                            )}
                                        {app.status !== 'completed' &&
                                            app.status !== 'cancelled' && (
                                                <ConfirmDialog
                                                    title={__(
                                                        'Cancel appointment',
                                                    )}
                                                    description={__(
                                                        'Are you sure you want to cancel this appointment?',
                                                    )}
                                                    confirmLabel={__(
                                                        'Yes, cancel it',
                                                    )}
                                                    cancelLabel={__('Keep it')}
                                                    onConfirm={() =>
                                                        updateStatus(
                                                            app.id,
                                                            'cancelled',
                                                        )
                                                    }
                                                    trigger={
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-destructive"
                                                        >
                                                            <XCircle className="mr-1.5 size-4" />
                                                            {__('Cancel')}
                                                        </Button>
                                                    }
                                                />
                                            )}
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 p-12">
                            <Calendar className="mb-4 size-12 text-muted-foreground/30" />
                            <h3 className="text-lg font-medium text-muted-foreground">
                                {__('No appointments for this day')}
                            </h3>
                            <p className="text-sm text-muted-foreground/60">
                                {__('Change the date or use the today button.')}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
