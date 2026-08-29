import { Head, useForm, usePage, Link } from '@inertiajs/react';
import {
    Save,
    ArrowLeft,
    Activity,
    FileText,
    ClipboardList,
    Plus,
    Trash2,
    Pill,
    DollarSign,
} from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { __ } from '@/lib/i18n';
import type { BreadcrumbItem, PageProps } from '@/types';

interface Patient {
    id: number;
    full_name: string;
    document_id: string;
    birth_date: string;
}

interface Appointment {
    id: number;
    reason: string;
}

interface Props {
    patient: Patient;
    appointment?: Appointment;
}

export default function Create({ patient, appointment }: Props) {
    const { auth } = usePage<PageProps>().props;

    const { data, setData, post, processing, errors } = useForm({
        patient_id: patient.id,
        doctor_id: auth.user.id,
        appointment_id: appointment?.id || '',
        weight: '',
        height: '',
        temperature: '',
        bp_systolic: '',
        bp_diastolic: '',
        heart_rate: '',
        respiratory_rate: '',
        oxygen_saturation: '',
        reason_for_visit: appointment?.reason || '',
        clinical_findings: '',
        diagnosis: '',
        treatment_plan: '',
        prescription_items: [] as Array<{
            medication: string;
            dosage: string;
            frequency: string;
            duration: string;
        }>,
        prescription_instructions: '',
        payment_amount: '',
        payment_method: 'cash',
    });

    const addMedication = () => {
        setData('prescription_items', [
            ...data.prescription_items,
            { medication: '', dosage: '', frequency: '', duration: '' },
        ]);
    };

    const removeMedication = (index: number) => {
        const newItems = [...data.prescription_items];
        newItems.splice(index, 1);
        setData('prescription_items', newItems);
    };

    const updateMedication = (
        index: number,
        field: 'medication' | 'dosage' | 'frequency' | 'duration',
        value: string,
    ) => {
        const newItems = [...data.prescription_items];
        newItems[index][field] = value;
        setData('prescription_items', newItems);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: __('Dashboard'), href: '/dashboard' },
        { title: __('Patients'), href: '/patients' },
        { title: patient.full_name, href: `/patients/${patient.id}` },
        { title: __('New Consultation'), href: '#' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/consultations');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${__('Consultation')}: ${patient.full_name}`} />

            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 pb-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/patients/${patient.id}`}>
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label={__('Back')}
                            >
                                <ArrowLeft className="size-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">
                                {__('Consultation Record')}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {__('Patient:')}{' '}
                                <span className="font-semibold text-foreground">
                                    {patient.full_name}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-6">
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="md:col-span-1">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Activity className="size-4 text-primary" />
                                    {__('Vital Signs')}
                                </CardTitle>
                                <CardDescription>
                                    {__('Capture of baseline metrics.')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="grid gap-1.5">
                                        <Label
                                            htmlFor="weight"
                                            className="text-xs"
                                        >
                                            {__('Weight (kg)')}
                                        </Label>
                                        <Input
                                            id="weight"
                                            type="number"
                                            step="0.01"
                                            value={data.weight}
                                            onChange={(e) =>
                                                setData(
                                                    'weight',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label
                                            htmlFor="height"
                                            className="text-xs"
                                        >
                                            {__('Height (cm)')}
                                        </Label>
                                        <Input
                                            id="height"
                                            type="number"
                                            step="0.01"
                                            value={data.height}
                                            onChange={(e) =>
                                                setData(
                                                    'height',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="grid gap-1.5">
                                        <Label
                                            htmlFor="temperature"
                                            className="text-xs"
                                        >
                                            {__('Temp (°C)')}
                                        </Label>
                                        <Input
                                            id="temperature"
                                            type="number"
                                            step="0.1"
                                            value={data.temperature}
                                            onChange={(e) =>
                                                setData(
                                                    'temperature',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label
                                            htmlFor="heart_rate"
                                            className="text-xs"
                                        >
                                            {__('HR (bpm)')}
                                        </Label>
                                        <Input
                                            id="heart_rate"
                                            type="number"
                                            value={data.heart_rate}
                                            onChange={(e) =>
                                                setData(
                                                    'heart_rate',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                <Separator />
                                <Label className="text-xs font-semibold text-muted-foreground uppercase">
                                    {__('Blood Pressure')}
                                </Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="grid gap-1.5">
                                        <Label
                                            htmlFor="bp_systolic"
                                            className="text-xs"
                                        >
                                            {__('Systolic')}
                                        </Label>
                                        <Input
                                            id="bp_systolic"
                                            type="number"
                                            placeholder={__('120')}
                                            value={data.bp_systolic}
                                            onChange={(e) =>
                                                setData(
                                                    'bp_systolic',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label
                                            htmlFor="bp_diastolic"
                                            className="text-xs"
                                        >
                                            {__('Diastolic')}
                                        </Label>
                                        <Input
                                            id="bp_diastolic"
                                            type="number"
                                            placeholder={__('80')}
                                            value={data.bp_diastolic}
                                            onChange={(e) =>
                                                setData(
                                                    'bp_diastolic',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="grid gap-1.5">
                                        <Label
                                            htmlFor="respiratory_rate"
                                            className="text-xs"
                                        >
                                            {__('RR (rpm)')}
                                        </Label>
                                        <Input
                                            id="respiratory_rate"
                                            type="number"
                                            value={data.respiratory_rate}
                                            onChange={(e) =>
                                                setData(
                                                    'respiratory_rate',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label
                                            htmlFor="oxygen_saturation"
                                            className="text-xs"
                                        >
                                            {__('SpO2 (%)')}
                                        </Label>
                                        <Input
                                            id="oxygen_saturation"
                                            type="number"
                                            value={data.oxygen_saturation}
                                            onChange={(e) =>
                                                setData(
                                                    'oxygen_saturation',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-6 md:col-span-2">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <ClipboardList className="size-4 text-primary" />
                                        {__('Subjective and Objective')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-4">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="reason_for_visit">
                                            {__('Reason for visit')} *
                                        </Label>
                                        <Input
                                            id="reason_for_visit"
                                            placeholder={__(
                                                'E.g. Abdominal pain for 2 days...',
                                            )}
                                            value={data.reason_for_visit}
                                            onChange={(e) =>
                                                setData(
                                                    'reason_for_visit',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                        {errors.reason_for_visit && (
                                            <p className="text-xs text-destructive">
                                                {errors.reason_for_visit}
                                            </p>
                                        )}
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="clinical_findings">
                                            {__('Findings and Physical Exam')}
                                        </Label>
                                        <Textarea
                                            id="clinical_findings"
                                            rows={4}
                                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder={__(
                                                'Details observed during the examination...',
                                            )}
                                            value={data.clinical_findings}
                                            onChange={(e) =>
                                                setData(
                                                    'clinical_findings',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3 text-indigo-600 dark:text-indigo-400">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <FileText className="size-4" />
                                        {__('Analysis and Diagnosis')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-4">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="diagnosis">
                                            {__('Diagnosis')} *
                                        </Label>
                                        <Textarea
                                            id="diagnosis"
                                            rows={2}
                                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                                            placeholder={__(
                                                'Clinical diagnosis or ICD-10...',
                                            )}
                                            value={data.diagnosis}
                                            onChange={(e) =>
                                                setData(
                                                    'diagnosis',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                        {errors.diagnosis && (
                                            <p className="text-xs text-destructive">
                                                {errors.diagnosis}
                                            </p>
                                        )}
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="treatment_plan">
                                            {__(
                                                'Follow-up Plan / Internal Notes',
                                            )}
                                        </Label>
                                        <Textarea
                                            id="treatment_plan"
                                            rows={3}
                                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                                            placeholder={__(
                                                'Action plan, general recommendations...',
                                            )}
                                            value={data.treatment_plan}
                                            onChange={(e) =>
                                                setData(
                                                    'treatment_plan',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-primary/20 bg-primary/5">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="flex items-center gap-2 text-lg text-primary">
                                                <Pill className="size-4" />
                                                {__('Medical Prescription')}
                                            </CardTitle>
                                            <CardDescription>
                                                {__(
                                                    'Add medications to generate the printable prescription.',
                                                )}
                                            </CardDescription>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addMedication}
                                            className="gap-1 border-primary text-primary hover:bg-primary hover:text-white"
                                        >
                                            <Plus className="size-4" />
                                            {__('Add Medication')}
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="grid gap-4">
                                    {data.prescription_items.length > 0 ? (
                                        <div className="space-y-4">
                                            {data.prescription_items.map(
                                                (item, index) => (
                                                    <div
                                                        key={index}
                                                        className="group relative grid gap-3 rounded-lg border bg-background p-4 shadow-sm"
                                                    >
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="absolute top-2 right-2 text-destructive opacity-0 transition-opacity group-hover:opacity-100"
                                                            onClick={() =>
                                                                removeMedication(
                                                                    index,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </Button>

                                                        <div className="grid gap-4 md:grid-cols-4">
                                                            <div className="grid gap-1.5 md:col-span-1">
                                                                <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                                                                    {__(
                                                                        'Medication',
                                                                    )}
                                                                </Label>
                                                                <Input
                                                                    placeholder={__(
                                                                        'Name / Substance',
                                                                    )}
                                                                    value={
                                                                        item.medication
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        updateMedication(
                                                                            index,
                                                                            'medication',
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    required
                                                                />
                                                            </div>
                                                            <div className="grid gap-1.5">
                                                                <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                                                                    {__(
                                                                        'Dosage',
                                                                    )}
                                                                </Label>
                                                                <Input
                                                                    placeholder={__(
                                                                        '500mg, 1 cap, etc.',
                                                                    )}
                                                                    value={
                                                                        item.dosage
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        updateMedication(
                                                                            index,
                                                                            'dosage',
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    required
                                                                />
                                                            </div>
                                                            <div className="grid gap-1.5">
                                                                <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                                                                    {__(
                                                                        'Frequency',
                                                                    )}
                                                                </Label>
                                                                <Input
                                                                    placeholder={__(
                                                                        'Every 8 hours...',
                                                                    )}
                                                                    value={
                                                                        item.frequency
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        updateMedication(
                                                                            index,
                                                                            'frequency',
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                />
                                                            </div>
                                                            <div className="grid gap-1.5">
                                                                <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                                                                    {__(
                                                                        'Duration',
                                                                    )}
                                                                </Label>
                                                                <Input
                                                                    placeholder={__(
                                                                        'For 5 days...',
                                                                    )}
                                                                    value={
                                                                        item.duration
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        updateMedication(
                                                                            index,
                                                                            'duration',
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ),
                                            )}

                                            <div className="grid gap-1.5">
                                                <Label htmlFor="prescription_instructions">
                                                    {__(
                                                        'General Prescription Instructions',
                                                    )}
                                                </Label>
                                                <Textarea
                                                    id="prescription_instructions"
                                                    rows={2}
                                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                                                    placeholder={__(
                                                        'E.g. Rest, drink plenty of fluids...',
                                                    )}
                                                    value={
                                                        data.prescription_instructions
                                                    }
                                                    onChange={(e) =>
                                                        setData(
                                                            'prescription_instructions',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border border-dashed py-8 text-center text-muted-foreground">
                                            <Pill className="mx-auto mb-2 size-8 opacity-20" />
                                            <p className="text-sm">
                                                {__(
                                                    'No medications have been added to this consultation.',
                                                )}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="border-emerald-500/20 bg-emerald-500/5 shadow-sm">
                                <CardHeader className="mb-4 border-b border-emerald-500/10 pb-3">
                                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                        <DollarSign className="size-4" />
                                        <CardTitle className="text-lg">
                                            {__('Consultation Payment')}
                                        </CardTitle>
                                    </div>
                                    <CardDescription>
                                        {__(
                                            'Record the payment quickly if it is made now.',
                                        )}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-4 md:grid-cols-2">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="payment_amount">
                                            {__('Amount ($)')}
                                        </Label>
                                        <Input
                                            id="payment_amount"
                                            type="number"
                                            placeholder={__('0.00')}
                                            value={data.payment_amount}
                                            onChange={(e) =>
                                                setData(
                                                    'payment_amount',
                                                    e.target.value,
                                                )
                                            }
                                            className="border-emerald-200 focus-visible:ring-emerald-500"
                                        />
                                        {errors.payment_amount && (
                                            <p className="text-xs text-destructive">
                                                {errors.payment_amount}
                                            </p>
                                        )}
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="payment_method">
                                            {__('Payment Method')}
                                        </Label>
                                        <Select
                                            value={data.payment_method}
                                            onValueChange={(val) =>
                                                setData('payment_method', val)
                                            }
                                        >
                                            <SelectTrigger
                                                id="payment_method"
                                                className="border-emerald-200 focus-visible:ring-emerald-500"
                                            >
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="cash">
                                                    {__('Cash')}
                                                </SelectItem>
                                                <SelectItem value="card">
                                                    {__('Credit/Debit Card')}
                                                </SelectItem>
                                                <SelectItem value="transfer">
                                                    {__('Bank Transfer')}
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex justify-end gap-3">
                                <Link href={`/patients/${patient.id}`}>
                                    <Button variant="outline" type="button">
                                        {__('Cancel')}
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="gap-2 px-8"
                                >
                                    <Save className="size-4" />
                                    {__('Save Consultation')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
