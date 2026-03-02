import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Users, Calendar, Activity, Clock, ChevronRight, 
    ArrowUpRight, UserSearch, ClipboardList 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { __ } from '@/lib/i18n';

interface Stat {
    label: string;
    value: number;
    icon: any;
    color: string;
    description: string;
}

interface Props {
    stats: {
        total_patients: number;
        appointments_today: number;
        pending_appointments: number;
        consultations_today: number;
    };
    recentConsultations: any[];
    upcomingAppointments: any[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({ stats, recentConsultations, upcomingAppointments }: Props) {
    const { auth } = usePage().props as any;
    const userRoles = auth.user.roles?.map((r: any) => r.name) || [];

    const getRoleGreeting = () => {
        if (userRoles.includes('admin')) return __('Welcome, Administrator');
        if (userRoles.includes('doctor')) return __('Welcome, Doctor');
        if (userRoles.includes('receptionist')) return __('Welcome, Receptionist');
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
                color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-400/10',
                description: __('Scheduled soon')
            },
            { 
                label: __('Appointments Today'), 
                value: stats.appointments_today, 
                icon: Clock, 
                color: 'text-blue-600 bg-blue-50 dark:bg-blue-400/10',
                description: __('Scheduled for today')
            },
        ]
        : [
            { 
                label: __('Total Patients'), 
                value: stats.total_patients, 
                icon: Users, 
                color: 'text-blue-600 bg-blue-50 dark:bg-blue-400/10',
                description: __('Registered in the system')
            },
            { 
                label: __('Appointments Today'), 
                value: stats.appointments_today, 
                icon: Calendar, 
                color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-400/10',
                description: __('Scheduled for today')
            },
            { 
                label: __('Consultations Today'), 
                value: stats.consultations_today, 
                icon: Activity, 
                color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-400/10',
                description: __('Successfully attended')
            },
        ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('Clinical Dashboard')} />
            
            <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
                {/* Saludo y Acción Rápida */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {getRoleGreeting()}
                        </h1>
                        <p className="text-muted-foreground">
                            {isPatient 
                                ? __('Here you can view your medical information and appointments.') 
                                : __('Here is a summary of today\'s clinical activity.')}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        {isPatient ? (
                            <>
                                <Link href="/my-appointments">
                                    <Button variant="outline" className="gap-2">
                                        <Clock className="size-4" />
                                        {__('My Appointments')}
                                    </Button>
                                </Link>
                                <Link href="/book-appointment">
                                    <Button className="gap-2 shadow-lg shadow-primary/20">
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
                                    <Button className="gap-2 shadow-lg shadow-primary/20">
                                        <Clock className="size-4" />
                                        {__('View Schedule')}
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-3">
                    {statCards.map((stat) => (
                        <Card key={stat.label} className="overflow-hidden border-none shadow-sm bg-card hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">{stat.label}</p>
                                        <h3 className="text-3xl font-extrabold">{stat.value}</h3>
                                        <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                                    </div>
                                    <div className={`p-3 rounded-2xl ${stat.color}`}>
                                        <stat.icon className="size-6" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                    {/* Próximas Citas */}
                    <Card className="lg:col-span-3">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Calendar className="size-4 text-primary" />
                                    {__('Upcoming Appointments')}
                                </CardTitle>
                                <p className="text-xs text-muted-foreground">{__('Scheduled for the next hours.')}</p>
                            </div>
                            <Badge variant="outline">{stats.pending_appointments} {__('Pending')}</Badge>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="space-y-4">
                                {upcomingAppointments.length > 0 ? (
                                    upcomingAppointments.map((app) => (
                                        <div key={app.id} className="flex items-center justify-between p-3 rounded-xl border bg-muted/30 hover:bg-muted/50 transition-colors group">
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-col items-center justify-center size-10 rounded-lg bg-background border shadow-sm">
                                                    <span className="text-[10px] font-bold uppercase text-primary">
                                                        {new Date(app.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).split(' ')[0]}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold group-hover:text-primary transition-colors">{app.patient.full_name}</p>
                                                    <p className="text-xs text-muted-foreground line-clamp-1">{app.reason}</p>
                                                </div>
                                            </div>
                                            <Link href="/appointments">
                                                <Button variant="ghost" size="icon" className="size-8 rounded-full">
                                                    <ChevronRight className="size-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-8 text-center text-muted-foreground border border-dashed rounded-xl">
                                        <p className="text-sm italic">{__('No more appointments for today.')}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Consultas Recientes */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <ClipboardList className="size-4 text-primary" />
                                    {__('Recent Consultations')}
                                </CardTitle>
                                <p className="text-xs text-muted-foreground">{__('Summary of recent care.')}</p>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="space-y-6">
                                {recentConsultations.length > 0 ? (
                                    recentConsultations.map((consultation) => (
                                        <div key={consultation.id} className="flex items-start gap-4">
                                            <div className="size-2 mt-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-sm font-bold truncate">{consultation.patient.full_name}</p>
                                                    <time className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                        {new Date(consultation.created_at).toLocaleDateString()}
                                                    </time>
                                                </div>
                                                <p className="text-xs text-muted-foreground font-medium truncate mt-0.5">{consultation.diagnosis}</p>
                                                <Link href={`/consultations/${consultation.id}`}>
                                                    <button className="text-[10px] font-bold text-primary mt-1 hover:underline flex items-center gap-0.5">
                                                        {__('View record')} <ArrowUpRight className="size-2.5" />
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-8 text-center text-muted-foreground border border-dashed rounded-xl">
                                        <p className="text-sm italic">{__('No recent activity.')}</p>
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

