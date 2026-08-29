import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Activity,
    FileText,
    ClipboardList,
    Thermometer,
    Weight,
    Ruler,
    Pill,
    Download,
    Eye,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { formatStoredDate, formatStoredTime } from '@/lib/date';
import { __ } from '@/lib/i18n';
import type { BreadcrumbItem } from '@/types';

interface Consultation {
    id: number;
    patient: { id: number; full_name: string };
    doctor: { id: number; name: string };
    weight: number | null;
    height: number | null;
    temperature: number | null;
    bp_systolic: number | null;
    bp_diastolic: number | null;
    heart_rate: number | null;
    respiratory_rate: number | null;
    oxygen_saturation: number | null;
    reason_for_visit: string;
    clinical_findings: string | null;
    diagnosis: string;
    treatment_plan: string | null;
    created_at: string;
    prescription?: {
        id: number;
        items: Array<{
            medication: string;
            dosage: string;
            frequency: string;
            duration: string;
        }>;
        general_instructions: string | null;
    } | null;
}

interface Props {
    consultation: Consultation;
}

export default function Show({ consultation }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: __('Dashboard'), href: '/dashboard' },
        { title: __('Patients'), href: '/patients' },
        {
            title: consultation.patient.full_name,
            href: `/patients/${consultation.patient.id}`,
        },
        { title: __('Consultation Detail'), href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head
                title={`${__('Consultation')}: ${consultation.patient.full_name}`}
            />

            <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4 pb-10">
                <div className="flex items-center gap-4">
                    <Link href={`/patients/${consultation.patient.id}`}>
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
                            {__('Consultation Detail')}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {formatStoredDate(consultation.created_at)} -{' '}
                            {formatStoredTime(consultation.created_at)}
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Info Lateral */}
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Activity className="size-4 text-primary" />
                                {__('Vital Signs')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 text-sm">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="flex items-center gap-1.5 text-muted-foreground">
                                        <Weight className="size-3" />{' '}
                                        {__('Weight')}
                                    </p>
                                    <p className="font-medium">
                                        {consultation.weight
                                            ? `${consultation.weight} kg`
                                            : __('N/A')}
                                    </p>
                                </div>
                                <div>
                                    <p className="flex items-center gap-1.5 text-muted-foreground">
                                        <Ruler className="size-3" />{' '}
                                        {__('Height')}
                                    </p>
                                    <p className="font-medium">
                                        {consultation.height
                                            ? `${consultation.height} cm`
                                            : __('N/A')}
                                    </p>
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="flex items-center gap-1.5 text-muted-foreground">
                                        <Thermometer className="size-3" />{' '}
                                        {__('Temp.')}
                                    </span>
                                    <span className="font-medium">
                                        {consultation.temperature
                                            ? `${consultation.temperature} °C`
                                            : __('N/A')}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        {__('Blood Pressure')}
                                    </span>
                                    <span className="font-medium">
                                        {consultation.bp_systolic &&
                                        consultation.bp_diastolic
                                            ? `${consultation.bp_systolic}/${consultation.bp_diastolic}`
                                            : __('N/A')}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        {__('Heart Rate')}
                                    </span>
                                    <span className="font-medium">
                                        {consultation.heart_rate
                                            ? `${consultation.heart_rate} lpm`
                                            : __('N/A')}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        {__('O2 Sat.')}
                                    </span>
                                    <span className="font-medium">
                                        {consultation.oxygen_saturation
                                            ? `${consultation.oxygen_saturation} %`
                                            : __('N/A')}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contenido Principal */}
                    <div className="space-y-6 md:col-span-2">
                        <Card>
                            <CardHeader className="mb-4 border-b pb-3">
                                <div className="flex items-start justify-between">
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <ClipboardList className="size-5 text-primary" />
                                        {__('Clinical Record')}
                                    </CardTitle>
                                    <Badge variant="secondary">
                                        {consultation.doctor.name}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="mb-2 text-sm font-bold text-muted-foreground uppercase">
                                        {__('Reason for visit')}
                                    </h3>
                                    <p className="text-foreground">
                                        {consultation.reason_for_visit}
                                    </p>
                                </div>

                                {consultation.clinical_findings && (
                                    <div>
                                        <h3 className="mb-2 text-sm font-bold text-muted-foreground uppercase">
                                            {__('Findings / Physical Exam')}
                                        </h3>
                                        <p className="rounded-lg border bg-muted/30 p-4 whitespace-pre-wrap text-foreground">
                                            {consultation.clinical_findings}
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <h3 className="mb-2 text-sm font-bold text-indigo-600 uppercase dark:text-indigo-400">
                                        {__('Diagnosis')}
                                    </h3>
                                    <p className="text-lg font-medium">
                                        {consultation.diagnosis}
                                    </p>
                                </div>

                                {consultation.treatment_plan && (
                                    <div className="rounded-lg border bg-muted/50 p-4">
                                        <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase">
                                            <FileText className="size-4" />
                                            {__('Follow-up Notes')}
                                        </h3>
                                        <p className="whitespace-pre-wrap text-foreground">
                                            {consultation.treatment_plan}
                                        </p>
                                    </div>
                                )}

                                {consultation.prescription && (
                                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 shadow-sm">
                                        <div className="mb-4 flex items-center justify-between">
                                            <h3 className="flex items-center gap-2 text-sm font-bold text-primary uppercase">
                                                <Pill className="size-4" />
                                                {__(
                                                    'Medical Prescription (Rp.)',
                                                )}
                                            </h3>
                                            <div className="flex gap-2">
                                                <a
                                                    href={`/prescriptions/${consultation.prescription.id}/preview`}
                                                    target="_blank"
                                                >
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="gap-2 text-xs"
                                                    >
                                                        <Eye className="size-3" />{' '}
                                                        {__('View PDF')}
                                                    </Button>
                                                </a>
                                                <a
                                                    href={`/prescriptions/${consultation.prescription.id}/download`}
                                                >
                                                    <Button
                                                        size="sm"
                                                        className="gap-2 bg-primary text-xs shadow-lg shadow-primary/20"
                                                    >
                                                        <Download className="size-3" />{' '}
                                                        {__('Download')}
                                                    </Button>
                                                </a>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {consultation.prescription.items.map(
                                                (item, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-start justify-between border-b border-primary/10 py-2 last:border-0"
                                                    >
                                                        <div>
                                                            <p className="text-sm font-bold">
                                                                {
                                                                    item.medication
                                                                }
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {item.dosage}{' '}
                                                                {item.frequency &&
                                                                    `— ${item.frequency}`}{' '}
                                                                {item.duration &&
                                                                    `— ${item.duration}`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>

                                        {consultation.prescription
                                            .general_instructions && (
                                            <div className="mt-4 border-t border-primary/10 pt-4">
                                                <p className="mb-1 text-[10px] font-bold text-muted-foreground uppercase">
                                                    {__('General Instructions')}
                                                </p>
                                                <p className="text-sm text-foreground italic">
                                                    {
                                                        consultation
                                                            .prescription
                                                            .general_instructions
                                                    }
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
