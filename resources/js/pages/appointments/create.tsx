import { Head, useForm, Link } from '@inertiajs/react';
import { Save, ArrowLeft, Calendar } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { localDateTimeInputValue } from '@/lib/date';
import { __ } from '@/lib/i18n';
import type { BreadcrumbItem } from '@/types';

interface Props {
    patients: { id: number; full_name: string }[];
    doctors: { id: number; name: string }[];
    selected_patient_id?: string;
}

export default function Create({
    patients,
    doctors,
    selected_patient_id,
}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: __('Dashboard'), href: '/dashboard' },
        { title: __('Appointments'), href: '/appointments' },
        { title: __('New Appointment'), href: '#' },
    ];

    const { data, setData, post, processing, errors } = useForm({
        patient_id: selected_patient_id || '',
        doctor_id: '',
        start_time: '',
        end_time: '',
        reason: '',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/appointments');
    };

    // Auto-calculate end time (e.g., 30 mins later) when start time changes
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
            <Head title={__('New Appointment')} />

            <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4">
                <div className="flex items-center gap-4">
                    <Link href="/appointments">
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label={__('Back')}
                        >
                            <ArrowLeft className="size-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-foreground">
                        {__('New Appointment')}
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="size-5" />
                                {__('Appointment Details')}
                            </CardTitle>
                            <CardDescription>
                                {__('Select the patient, doctor and schedule.')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="patient_id">
                                    {__('Patient')} *
                                </Label>
                                <Select
                                    onValueChange={(val) =>
                                        setData('patient_id', val)
                                    }
                                    value={data.patient_id.toString()}
                                >
                                    <SelectTrigger>
                                        <SelectValue
                                            placeholder={__(
                                                'Select a patient...',
                                            )}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {patients.map((p) => (
                                            <SelectItem
                                                key={p.id}
                                                value={p.id.toString()}
                                            >
                                                {p.full_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.patient_id && (
                                    <p className="text-xs text-destructive">
                                        {errors.patient_id}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="doctor_id">
                                    {__('Responsible Doctor')} *
                                </Label>
                                <Select
                                    onValueChange={(val) =>
                                        setData('doctor_id', val)
                                    }
                                    value={data.doctor_id}
                                >
                                    <SelectTrigger>
                                        <SelectValue
                                            placeholder={__(
                                                'Select a doctor...',
                                            )}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {doctors.map((d) => (
                                            <SelectItem
                                                key={d.id}
                                                value={d.id.toString()}
                                            >
                                                {d.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.doctor_id && (
                                    <p className="text-xs text-destructive">
                                        {errors.doctor_id}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="start_time">
                                        {__('Start')} *
                                    </Label>
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
                                    <Label htmlFor="end_time">
                                        {__('End')} *
                                    </Label>
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
                                    {__('Reason for visit')}
                                </Label>
                                <Input
                                    id="reason"
                                    placeholder={__(
                                        'E.g. Headache, Follow-up...',
                                    )}
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
                                <Label htmlFor="notes">
                                    {__('Additional notes')}
                                </Label>
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
                                {__('Cancel')}
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="flex items-center gap-2"
                        >
                            <Save className="size-4" />
                            {__('Schedule Appointment')}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
