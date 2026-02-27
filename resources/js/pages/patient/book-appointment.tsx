import { Head, useForm, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';
import { Calendar as CalendarIcon, Clock, ChevronLeft, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface Doctor {
    id: number;
    name: string;
}

interface Slot {
    time: string;
    available: boolean;
}

interface Props {
    doctors: Doctor[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Mis Citas', href: '/my-appointments' },
    { title: 'Agendar Cita', href: '/book-appointment' },
];

export default function BookAppointment({ doctors }: Props) {
    const [slots, setSlots] = useState<Slot[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        doctor_id: '',
        date: new Date().toISOString().split('T')[0],
        time: '',
        reason: '',
    });

    // Cargar disponibilidad cuando cambian doctor o fecha
    useEffect(() => {
        if (data.doctor_id && data.date) {
            setLoadingSlots(true);
            setSlots([]);
            setData('time', '');
            
            fetch(`/api/availability?doctor_id=${data.doctor_id}&date=${data.date}`)
                .then(res => res.json())
                .then(json => {
                    setSlots(json.slots);
                    setLoadingSlots(false);
                })
                .catch(() => setLoadingSlots(false));
        }
    }, [data.doctor_id, data.date]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/book-appointment');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Agendar Cita Médica" />

            <div className="flex flex-col gap-6 p-4 max-w-4xl mx-auto w-full">
                <div className="flex items-center gap-2">
                    <Link href="/my-appointments">
                        <Button variant="ghost" size="icon">
                            <ChevronLeft className="size-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">Agendar Cita Médica</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Formulario de Selección */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-lg">Selección</CardTitle>
                            <CardDescription>Elige tu médico y la fecha de consulta.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="doctor">Médico Especialista</Label>
                                <select
                                    id="doctor"
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={data.doctor_id}
                                    onChange={(e) => setData('doctor_id', e.target.value)}
                                    required
                                >
                                    <option value="">Selecciona un médico</option>
                                    {doctors.map(dr => (
                                        <option key={dr.id} value={dr.id}>{dr.name}</option>
                                    ))}
                                </select>
                                <InputError message={errors.doctor_id} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="date">Fecha de Cita</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    min={new Date().toISOString().split('T')[0]}
                                    value={data.date}
                                    onChange={(e) => setData('date', e.target.value)}
                                    required
                                />
                                <InputError message={errors.date} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="reason">Motivo de consulta (Opcional)</Label>
                                <Input
                                    id="reason"
                                    placeholder="Ej: Control anual, Dolor de cabeza..."
                                    value={data.reason}
                                    onChange={(e) => setData('reason', e.target.value)}
                                />
                                <InputError message={errors.reason} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Selector de Horarios */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg">Horarios Disponibles</CardTitle>
                            <CardDescription>
                                {!data.doctor_id 
                                    ? 'Por favor selecciona un médico primero.' 
                                    : `Disponibilidad para el día ${new Date(data.date).toLocaleDateString()}`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loadingSlots ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-2">
                                    <Spinner className="size-8" />
                                    <p className="text-sm text-muted-foreground">Buscando horarios...</p>
                                </div>
                            ) : data.doctor_id && slots.length > 0 ? (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                    {slots.map((slot) => (
                                        <Button
                                            key={slot.time}
                                            type="button"
                                            variant={data.time === slot.time ? 'default' : 'outline'}
                                            disabled={!slot.available}
                                            className={cn(
                                                "h-12 flex flex-col items-center justify-center",
                                                data.time === slot.time && "ring-2 ring-primary ring-offset-2"
                                            )}
                                            onClick={() => setData('time', slot.time)}
                                        >
                                            <span className="text-sm font-bold">{slot.time}</span>
                                        </Button>
                                    ))}
                                </div>
                            ) : data.doctor_id ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/30 rounded-lg border border-dashed">
                                    <AlertCircle className="size-8 text-muted-foreground mb-2" />
                                    <p className="font-medium">No hay horarios disponibles</p>
                                    <p className="text-sm text-muted-foreground">Intenta con otra fecha.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/10 rounded-lg border border-dashed">
                                    <User className="size-8 text-muted-foreground/30 mb-2" />
                                    <p className="text-sm text-muted-foreground">Selecciona un médico y fecha para ver horarios.</p>
                                </div>
                            )}

                            <InputError message={errors.time} className="mt-4" />

                            <div className="flex justify-end mt-8">
                                <Button 
                                    onClick={handleSubmit} 
                                    disabled={processing || !data.time || !data.doctor_id}
                                    className="w-full sm:w-auto gap-2"
                                >
                                    {processing ? <Spinner className="mr-2" /> : <CheckCircle2 className="size-4" />}
                                    Confirmar Cita
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
