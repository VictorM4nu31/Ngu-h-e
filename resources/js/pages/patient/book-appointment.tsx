import { Head, useForm, Link } from '@inertiajs/react';
import {
    ChevronLeft,
    User,
    AlertCircle,
    CheckCircle2,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import InputError from '@/components/input-error';
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
import { Spinner } from '@/components/ui/spinner';
import AppLayout from '@/layouts/app-layout';
import { localDateInputValue } from '@/lib/date';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

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
        date: localDateInputValue(),
        time: '',
        reason: '',
    });

    // Cargar disponibilidad cuando cambian doctor o fecha
    useEffect(() => {
        if (data.doctor_id && data.date) {
            // Reset + refetch on filter change; the synchronous resets are intentional.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setLoadingSlots(true);
            setSlots([]);
            setData('time', '');

            fetch(
                `/api/availability?doctor_id=${data.doctor_id}&date=${data.date}`,
            )
                .then((res) => res.json())
                .then((json) => {
                    setSlots(json.slots);
                    setLoadingSlots(false);
                })
                .catch(() => setLoadingSlots(false));
        }
    }, [data.doctor_id, data.date, setData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/book-appointment');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Agendar Cita Médica" />

            <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4">
                <div className="flex items-center gap-2">
                    <Link href="/my-appointments">
                        <Button variant="ghost" size="icon">
                            <ChevronLeft className="size-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">Agendar Cita Médica</h1>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Formulario de Selección */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-lg">Selección</CardTitle>
                            <CardDescription>
                                Elige tu médico y la fecha de consulta.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="doctor">
                                    Médico Especialista
                                </Label>
                                <select
                                    id="doctor"
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                                    value={data.doctor_id}
                                    onChange={(e) =>
                                        setData('doctor_id', e.target.value)
                                    }
                                    required
                                >
                                    <option value="">
                                        Selecciona un médico
                                    </option>
                                    {doctors.map((dr) => (
                                        <option key={dr.id} value={dr.id}>
                                            {dr.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.doctor_id} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="date">Fecha de Cita</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    min={localDateInputValue()}
                                    value={data.date}
                                    onChange={(e) =>
                                        setData('date', e.target.value)
                                    }
                                    required
                                />
                                <InputError message={errors.date} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="reason">
                                    Motivo de consulta (Opcional)
                                </Label>
                                <Input
                                    id="reason"
                                    placeholder="Ej: Control anual, Dolor de cabeza..."
                                    value={data.reason}
                                    onChange={(e) =>
                                        setData('reason', e.target.value)
                                    }
                                />
                                <InputError message={errors.reason} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Selector de Horarios */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg">
                                Horarios Disponibles
                            </CardTitle>
                            <CardDescription>
                                {!data.doctor_id
                                    ? 'Por favor selecciona un médico primero.'
                                    : `Disponibilidad para el día ${new Date(`${data.date}T00:00:00`).toLocaleDateString('es-MX')}`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loadingSlots ? (
                                <div className="flex flex-col items-center justify-center gap-2 py-12">
                                    <Spinner className="size-8" />
                                    <p className="text-sm text-muted-foreground">
                                        Buscando horarios...
                                    </p>
                                </div>
                            ) : data.doctor_id && slots.length > 0 ? (
                                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                                    {slots.map((slot) => (
                                        <Button
                                            key={slot.time}
                                            type="button"
                                            variant={
                                                data.time === slot.time
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            disabled={!slot.available}
                                            className={cn(
                                                'flex h-12 flex-col items-center justify-center',
                                                data.time === slot.time &&
                                                    'ring-2 ring-primary ring-offset-2',
                                            )}
                                            onClick={() =>
                                                setData('time', slot.time)
                                            }
                                        >
                                            <span className="text-sm font-bold">
                                                {slot.time}
                                            </span>
                                        </Button>
                                    ))}
                                </div>
                            ) : data.doctor_id ? (
                                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 py-12 text-center">
                                    <AlertCircle className="mb-2 size-8 text-muted-foreground" />
                                    <p className="font-medium">
                                        No hay horarios disponibles
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Intenta con otra fecha.
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/10 py-12 text-center">
                                    <User className="mb-2 size-8 text-muted-foreground/30" />
                                    <p className="text-sm text-muted-foreground">
                                        Selecciona un médico y fecha para ver
                                        horarios.
                                    </p>
                                </div>
                            )}

                            <InputError
                                message={errors.time}
                                className="mt-4"
                            />

                            <div className="mt-8 flex justify-end">
                                <Button
                                    onClick={handleSubmit}
                                    disabled={
                                        processing ||
                                        !data.time ||
                                        !data.doctor_id
                                    }
                                    className="w-full gap-2 sm:w-auto"
                                >
                                    {processing ? (
                                        <Spinner className="mr-2" />
                                    ) : (
                                        <CheckCircle2 className="size-4" />
                                    )}
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
