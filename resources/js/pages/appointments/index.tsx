import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { useState } from 'react';
import { Calendar, Clock, User, UserSearch, CheckCircle2, XCircle, AlertCircle, Plus, ChevronLeft, ChevronRight, Activity } from 'lucide-react';

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
        links: any[];
    };
    doctors: { id: number; name: string }[];
    filters: { doctor_id: string; date: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Agenda de Citas', href: '/appointments' },
];

export default function Index({ appointments, doctors, filters }: Props) {
    const [date, setDate] = useState(filters.date || new Date().toISOString().split('T')[0]);
    const [doctorId, setDoctorId] = useState(filters.doctor_id || 'all');

    const handleFilter = (newDate?: string, newDoctorId?: string) => {
        const d = newDate !== undefined ? newDate : date;
        const dr = newDoctorId !== undefined ? newDoctorId : doctorId;
        
        router.get('/appointments', { 
            date: d, 
            doctor_id: dr === 'all' ? undefined : dr 
        }, { preserveState: true });
    };

    const statusColors = {
        scheduled: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300',
        confirmed: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300',
        completed: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300',
        cancelled: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300',
        no_show: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300',
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

            <div className="flex flex-col gap-6 p-4 max-w-6xl mx-auto w-full">
                <div className="flex items-center justify-between gap-4">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
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
                    <CardContent className="p-4 flex flex-wrap items-end gap-4">
                        <div className="grid gap-1.5 flex-1 min-w-[200px]">
                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Médico</label>
                            <Select onValueChange={(val) => {
                                setDoctorId(val);
                                handleFilter(undefined, val);
                            }} value={doctorId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Todos los médicos" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los médicos</SelectItem>
                                    {doctors.map(dr => (
                                        <SelectItem key={dr.id} value={dr.id.toString()}>{dr.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-1.5 flex-1 min-w-[200px]">
                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fecha</label>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" onClick={() => {
                                    const d = new Date(date);
                                    d.setDate(d.getDate() - 1);
                                    const str = d.toISOString().split('T')[0];
                                    setDate(str);
                                    handleFilter(str);
                                }}>
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
                                <Button variant="outline" size="icon" onClick={() => {
                                    const d = new Date(date);
                                    d.setDate(d.getDate() + 1);
                                    const str = d.toISOString().split('T')[0];
                                    setDate(str);
                                    handleFilter(str);
                                }}>
                                    <ChevronRight className="size-4" />
                                </Button>
                            </div>
                        </div>

                        <Button 
                            variant="secondary" 
                            onClick={() => {
                                const today = new Date().toISOString().split('T')[0];
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
                            <Card key={app.id} className="overflow-hidden border-l-4" style={{ borderLeftColor: 'rgb(var(--primary))' }}>
                                <div className="flex flex-col md:flex-row p-4 gap-4 items-start md:items-center">
                                    <div className="flex flex-col items-center justify-center bg-muted/50 p-2 rounded-lg min-w-[80px]">
                                        <Clock className="size-4 text-muted-foreground mb-1" />
                                        <span className="text-sm font-bold">
                                            {new Date(app.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Link href={`/patients/${app.patient.id}`} className="text-lg font-bold hover:underline">
                                                {app.patient.full_name}
                                            </Link>
                                            <Badge variant="outline" className={statusColors[app.status]}>
                                                {statusLabels[app.status]}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1.5">
                                                <User className="size-3.5" />
                                                Dr. {app.doctor.name}
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
                                            <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => updateStatus(app.id, 'confirmed')}>
                                                <CheckCircle2 className="size-4 mr-1.5" />
                                                Confirmar
                                            </Button>
                                        )}
                                        {app.status !== 'completed' && app.status !== 'cancelled' && (
                                            <Link href={`/consultations/create?appointment_id=${app.id}`}>
                                                <Button variant="secondary" size="sm" className="gap-1.5">
                                                    <Activity className="size-4" />
                                                    Atender
                                                </Button>
                                            </Link>
                                        )}
                                        {app.status !== 'completed' && app.status !== 'cancelled' && (
                                            <Link href={`/appointments/${app.id}/edit`}>
                                                <Button variant="ghost" size="sm">Editar</Button>
                                            </Link>
                                        )}
                                        {app.status !== 'completed' && (
                                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => {
                                                if (confirm('¿Cancelar cita?')) updateStatus(app.id, 'cancelled');
                                            }}>
                                                <XCircle className="size-4 mr-1.5" />
                                                Cancelar
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center p-12 bg-muted/30 rounded-xl border border-dashed">
                             <Calendar className="size-12 text-muted-foreground/30 mb-4" />
                             <h3 className="text-lg font-medium text-muted-foreground">No hay citas para este día</h3>
                             <p className="text-sm text-muted-foreground/60">Cambie la fecha o use el botón de hoy.</p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
