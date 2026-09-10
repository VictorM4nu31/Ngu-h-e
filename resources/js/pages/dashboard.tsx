import { Head, Link, usePage } from '@inertiajs/react';
import {
    Users,
    Calendar,
    Activity,
    Clock,
    ChevronRight,
    ArrowUpRight,
    UserSearch,
    ClipboardList,
    type LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { formatStoredDate, formatStoredTime } from '@/lib/date';
import { __ } from '@/lib/i18n';
import type { BreadcrumbItem, PageProps } from '@/types';

interface Stat {
    label: string;
    value: number;
    icon: LucideIcon;
    color: string;
    description: string;
}

interface ConsultationSummary {
    id: number;
    patient: { full_name: string };
    diagnosis: string;
    created_at: string;
}

interface AppointmentSummary {
    id: number;
    patient: { full_name: string };
    start_time: string;
    reason: string | null;
}

interface Props {
    stats: {
        total_patients: number;
        appointments_today: number;
        pending_appointments: number;
        consultations_today: number;
    };
    recentConsultations: ConsultationSummary[];
    upcomingAppointments: AppointmentSummary[];
}

export default function Dashboard({
    stats,
    recentConsultations,
    upcomingAppointments,
}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: __('Dashboard'),
            href: '/dashboard',
        },
    ];

    const { auth } = usePage<PageProps>().props;
    const userRoles = auth.user.roles?.map((r) => r.name) || [];

    const getRoleGreeting = () => {
        if (userRoles.includes('admin')) return __('Welcome, Administrator');
        if (userRoles.includes('doctor')) return __('Welcome, Doctor');
        if (userRoles.includes('receptionist'))
            return __('Welcome, Receptionist');
        if (userRoles.includes('patient')) return __('Welcome, Patient');
        return __('Welcome, User');
    };

    const isPatient = userRoles.includes('patient');

    const statCards: Stat[] = isPatient
        ? [
              {
                  label: __('Pending Appointments'),
                  value: stats.pending_appointments,
                  icon: Calendar,
                  color: 'text-clinical-blue bg-accent dark:bg-accent/40',
                  description: __('Scheduled soon'),
              },
              {
                  label: __('Appointments Today'),
                  value: stats.appointments_today,
                  icon: Clock,
                  color: 'text-clinical-blue bg-accent dark:bg-accent/40',
                  description: __('Scheduled for today'),
              },
          ]
        : [
              {
                  label: __('Total Patients'),
                  value: stats.total_patients,
                  icon: Users,
                  color: 'text-clinical-blue bg-accent dark:bg-accent/40',
                  description: __('Registered in the system'),
              },
              {
                  label: __('Appointments Today'),
                  value: stats.appointments_today,
                  icon: Calendar,
                  color: 'text-clinical-blue bg-accent dark:bg-accent/40',
                  description: __('Scheduled for today'),
              },
              {
                  label: __('Consultations Today'),
                  value: stats.consultations_today,
                  icon: Activity,
                  color: 'text-clinical-green bg-success/10 dark:bg-success/15',
                  description: __('Successfully attended'),
              },
          ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('Clinical Dashboard')} />

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-4 pb-10 sm:p-6">
                {/* Saludo y Acción Rápida */}
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-primary uppercase">
                            {__('Clinical operations')}
                        </p>
                        <h1 className="text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
                            {getRoleGreeting()}
                        </h1>
                        <p className="mt-2 max-w-xl text-muted-foreground">
                            {isPatient
                                ? __(
                                      'Here you can view your medical information and appointments.',
                                  )
                                : __(
                                      "Here is a summary of today's clinical activity.",
                                  )}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {isPatient ? (
                            <>
                                <Link href="/my-appointments">
                                    <Button variant="outline" className="gap-2">
                                        <Clock className="size-4" />
                                        {__('My Appointments')}
                                    </Button>
                                </Link>
                                <Link href="/book-appointment">
                                    <Button className="gap-2">
                                        <Calendar className="size-4" />
                                        {__('Book Appointment')}
                                    </Button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/patients">
                                    <Button variant="outline" className="gap-2">
                                        <UserSearch className="size-4" />
                                        {__('Search Patient')}
                                    </Button>
                                </Link>
                                <Link href="/appointments">
                                    <Button className="gap-2">
                                        <Clock className="size-4" />
                                        {__('View Schedule')}
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-3 md:grid-cols-3">
                    {statCards.map((stat) => (
                        <Card
                            key={stat.label}
                            className="group overflow-hidden border-border/80 bg-card shadow-none transition-colors hover:border-primary/50"
                        >
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="mb-2 text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                                            {stat.label}
                                        </p>
                                        <h3 className="text-3xl font-bold tracking-[-0.05em]">
                                            {stat.value}
                                        </h3>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {stat.description}
                                        </p>
                                    </div>
                                    <div
                                        className={`rounded-lg p-3 transition-transform group-hover:scale-105 ${stat.color}`}
                                    >
                                        <stat.icon className="size-6" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    {/* Próximas Citas */}
                    <Card className="border-border/80 shadow-none lg:col-span-3">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="space-y-1">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Calendar className="size-4 text-primary" />
                                    {__('Upcoming Appointments')}
                                </CardTitle>
                                <p className="text-xs text-muted-foreground">
                                    {__('Scheduled for the next hours.')}
                                </p>
                            </div>
                            <Badge
                                variant="outline"
                                className="border-primary/30 text-primary"
                            >
                                {stats.pending_appointments} {__('Pending')}
                            </Badge>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="space-y-4">
                                {upcomingAppointments.length > 0 ? (
                                    upcomingAppointments.map((app) => (
                                        <div
                                            key={app.id}
                                            className="group flex items-center justify-between rounded-lg border border-border/70 bg-muted/35 p-3 transition-colors hover:border-primary/35 hover:bg-accent/50"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="flex size-12 flex-col items-center justify-center rounded-lg border border-primary/25 bg-primary/5">
                                                    <span className="text-[10px] font-bold text-primary uppercase">
                                                        {formatStoredTime(
                                                            app.start_time,
                                                        )}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold transition-colors group-hover:text-primary">
                                                        {app.patient.full_name}
                                                    </p>
                                                    <p className="line-clamp-1 text-xs text-muted-foreground">
                                                        {app.reason}
                                                    </p>
                                                </div>
                                            </div>
                                            <Link href="/appointments">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8 rounded-full"
                                                    aria-label="Ver citas"
                                                >
                                                    <ChevronRight className="size-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-xl border border-dashed py-8 text-center text-muted-foreground">
                                        <p className="text-sm italic">
                                            {__(
                                                'No more appointments for today.',
                                            )}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Consultas Recientes */}
                    <Card className="border-border/80 shadow-none lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="space-y-1">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <ClipboardList className="size-4 text-primary" />
                                    {__('Recent Consultations')}
                                </CardTitle>
                                <p className="text-xs text-muted-foreground">
                                    {__('Summary of recent care.')}
                                </p>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="space-y-6">
                                {recentConsultations.length > 0 ? (
                                    recentConsultations.map((consultation) => (
                                        <div
                                            key={consultation.id}
                                            className="flex items-start gap-4"
                                        >
                                            <div className="mt-1.5 size-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="truncate text-sm font-bold">
                                                        {
                                                            consultation.patient
                                                                .full_name
                                                        }
                                                    </p>
                                                    <time className="text-[10px] whitespace-nowrap text-muted-foreground">
                                                        {formatStoredDate(
                                                            consultation.created_at,
                                                        )}
                                                    </time>
                                                </div>
                                                <p className="mt-0.5 truncate text-xs font-medium text-muted-foreground">
                                                    {consultation.diagnosis}
                                                </p>
                                                <Link
                                                    href={`/consultations/${consultation.id}`}
                                                >
                                                    <button className="mt-1 flex items-center gap-0.5 text-[10px] font-bold text-primary hover:underline">
                                                        {__('View record')}{' '}
                                                        <ArrowUpRight className="size-2.5" />
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-xl border border-dashed py-8 text-center text-muted-foreground">
                                        <p className="text-sm italic">
                                            {__('No recent activity.')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
