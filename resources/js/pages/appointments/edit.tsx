import { Head, useForm, Link } from '@inertiajs/react';
import { Save, ArrowLeft, Calendar, User, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { localDateTimeInputValue } from '@/lib/date';
import { __ } from '@/lib/i18n';
import type { BreadcrumbItem } from '@/types';

interface Appointment {
    id: number;
    patient: { id: number; full_name: string };
    doctor: { id: number; name: string };
    start_time: string;
    end_time: string;
    reason: string | null;
    notes: string | null;
}

interface Props {
    appointment: Appointment;
}

export default function Edit({ appointment }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: __('Dashboard'), href: '/dashboard' },
        { title: __('Appointments'), href: '/appointments' },
        { title: __('Edit Appointment'), href: '#' },
    ];

    const { data, setData, put, processing, errors } = useForm({
        start_time: localDateTimeInputValue(new Date(appointment.start_time)),
        end_time: localDateTimeInputValue(new Date(appointment.end_time)),
        reason: appointment.reason || '',
        notes: appointment.notes || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/appointments/${appointment.id}`);
    };

    const handleStartTimeChange = (val: string) => {
        setData('start_time', val);
        if (val && !data.end_time) {
            const date = new Date(val);
            date.setMinutes(date.getMinutes() + 30);
            setData('end_time', localDateTimeInputValue(date));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar Cita" />

            <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4">
                <div className="flex items-center gap-4">
                    <Link href="/appointments">
                        <Button variant="ghost" size="icon" aria-label="Volver">
                            <ArrowLeft className="size-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-foreground">
                        Editar Cita
                    </h1>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="size-4" />
                        Paciente: {appointment.patient.full_name}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Stethoscope className="size-4" />
                        Médico: {appointment.doctor.name}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="size-5" />
                                Detalles de la Cita
                            </CardTitle>
                            <CardDescription>
                                Actualice el horario, motivo o notas.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="start_time">Inicio *</Label>
                                    <Input
                                        id="start_time"
                                        type="datetime-local"
                                        value={data.start_time}
                                        onChange={(e) =>
                                            handleStartTimeChange(
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    {errors.start_time && (
                                        <p className="text-xs text-destructive">
                                            {errors.start_time}
                                        </p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="end_time">Fin *</Label>
                                    <Input
                                        id="end_time"
                                        type="datetime-local"
                                        value={data.end_time}
                                        onChange={(e) =>
                                            setData('end_time', e.target.value)
                                        }
                                        required
                                    />
                                    {errors.end_time && (
                                        <p className="text-xs text-destructive">
                                            {errors.end_time}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="reason">
                                    Motivo de Consulta
                                </Label>
                                <Input
                                    id="reason"
                                    placeholder="Ej. Dolor de cabeza, Seguimiento..."
                                    value={data.reason}
                                    onChange={(e) =>
                                        setData('reason', e.target.value)
                                    }
                                />
                                {errors.reason && (
                                    <p className="text-xs text-destructive">
                                        {errors.reason}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="notes">Notas adicionales</Label>
                                <Textarea
                                    id="notes"
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                    value={data.notes}
                                    onChange={(e) =>
                                        setData('notes', e.target.value)
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Link href="/appointments">
                            <Button variant="outline" type="button">
                                Cancelar
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="flex items-center gap-2"
                        >
                            <Save className="size-4" />
                            Guardar Cambios
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
