import { Head, useForm, Link } from '@inertiajs/react';
import { ChevronLeft, User, AlertCircle, CheckCircle2 } from 'lucide-react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import AppLayout from '@/layouts/app-layout';
import { localDateInputValue } from '@/lib/date';
import { __ } from '@/lib/i18n';
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

export default function BookAppointment({ doctors }: Props) {
    const [slots, setSlots] = useState<Slot[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [slotError, setSlotError] = useState<string | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: __('Dashboard'), href: '/dashboard' },
        { title: __('My Appointments'), href: '/my-appointments' },
        { title: __('Book Appointment'), href: '/book-appointment' },
    ];

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
            setSlotError(null);

            const controller = new AbortController();

            fetch(
                `/api/availability?doctor_id=${data.doctor_id}&date=${data.date}`,
                { signal: controller.signal },
            )
                .then((res) => {
                    if (!res.ok) throw new Error('Network error');
                    return res.json();
                })
                .then((json) => {
                    setSlots(json.slots);
                })
                .catch((err) => {
                    if (err.name !== 'AbortError')
                        setSlotError(__('Could not load the schedules.'));
                })
                .finally(() => setLoadingSlots(false));

            return () => controller.abort();
        }
    }, [data.doctor_id, data.date, setData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/book-appointment');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('Book Appointment')} />

            <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4">
                <div className="flex items-center gap-2">
                    <Link href="/my-appointments">
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label={__('Back')}
                        >
                            <ChevronLeft className="size-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">
                        {__('Book Appointment')}
                    </h1>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Formulario de Selección */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-lg">
                                {__('Selection')}
                            </CardTitle>
                            <CardDescription>
                                {__(
                                    'Choose your doctor and consultation date.',
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="doctor">
                                    {__('Specialist Doctor')}
                                </Label>
                                <Select
                                    value={data.doctor_id || undefined}
                                    onValueChange={(val) =>
                                        setData('doctor_id', val)
                                    }
                                >
                                    <SelectTrigger id="doctor">
                                        <SelectValue
                                            placeholder={__('Select a doctor')}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
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
                                <InputError message={errors.doctor_id} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="date">
                                    {__('Appointment Date')}
                                </Label>
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
                                    {__('Reason for visit (Optional)')}
                                </Label>
                                <Input
                                    id="reason"
                                    placeholder={__(
                                        'E.g: Annual check-up, Headache...',
                                    )}
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
                                {__('Available Schedules')}
                            </CardTitle>
                            <CardDescription>
                                {!data.doctor_id
                                    ? __('Please select a doctor first.')
                                    : `${__('Availability for the day')} ${new Date(`${data.date}T12:00:00`).toLocaleDateString('es-MX')}`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loadingSlots ? (
                                <div className="flex flex-col items-center justify-center gap-2 py-12">
                                    <Spinner className="size-8" />
                                    <p className="text-sm text-muted-foreground">
                                        {__('Searching for schedules...')}
                                    </p>
                                </div>
                            ) : slotError ? (
                                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-destructive/40 bg-destructive/5 py-12 text-center">
                                    <AlertCircle className="mb-2 size-8 text-destructive" />
                                    <p className="font-medium text-destructive">
                                        {slotError}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {__('Try again.')}
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
                                        {__('No schedules available')}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {__('Try another date.')}
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/10 py-12 text-center">
                                    <User className="mb-2 size-8 text-muted-foreground/30" />
                                    <p className="text-sm text-muted-foreground">
                                        {__(
                                            'Select a doctor and date to see schedules.',
                                        )}
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
                                    {__('Confirm Appointment')}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
