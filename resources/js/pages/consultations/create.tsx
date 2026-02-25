import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Save, ArrowLeft, Activity, Heart, Thermometer, User, FileText, ClipboardList } from 'lucide-react';

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
    const { auth } = usePage().props as any;
    
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
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Pacientes', href: '/patients' },
        { title: patient.full_name, href: `/patients/${patient.id}` },
        { title: 'Nueva Consulta', href: '#' },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/consultations');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Consulta: ${patient.full_name}`} />

            <div className="flex flex-col gap-6 p-4 max-w-5xl mx-auto w-full pb-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/patients/${patient.id}`}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="size-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">Registro de Consulta</h1>
                            <p className="text-muted-foreground text-sm">
                                Paciente: <span className="font-semibold text-foreground">{patient.full_name}</span>
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-6">
                    <div className="grid gap-6 md:grid-cols-3">
                        {/* Signos Vitales */}
                        <Card className="md:col-span-1">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Activity className="size-4 text-primary" />
                                    Signos Vitales
                                </CardTitle>
                                <CardDescription>Captura de métricas base.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="weight" className="text-xs">Peso (kg)</Label>
                                        <Input id="weight" type="number" step="0.01" value={data.weight} onChange={e => setData('weight', e.target.value)} />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="height" className="text-xs">Talla (cm)</Label>
                                        <Input id="height" type="number" step="0.01" value={data.height} onChange={e => setData('height', e.target.value)} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="temperature" className="text-xs">Temp (°C)</Label>
                                        <Input id="temperature" type="number" step="0.1" value={data.temperature} onChange={e => setData('temperature', e.target.value)} />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="heart_rate" className="text-xs">FC (lpm)</Label>
                                        <Input id="heart_rate" type="number" value={data.heart_rate} onChange={e => setData('heart_rate', e.target.value)} />
                                    </div>
                                </div>

                                <Separator />
                                <Label className="text-xs font-semibold uppercase text-muted-foreground">Presión Arterial</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="bp_systolic" className="text-xs">Sistólica</Label>
                                        <Input id="bp_systolic" type="number" placeholder="120" value={data.bp_systolic} onChange={e => setData('bp_systolic', e.target.value)} />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="bp_diastolic" className="text-xs">Diastólica</Label>
                                        <Input id="bp_diastolic" type="number" placeholder="80" value={data.bp_diastolic} onChange={e => setData('bp_diastolic', e.target.value)} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="respiratory_rate" className="text-xs">FR (rpm)</Label>
                                        <Input id="respiratory_rate" type="number" value={data.respiratory_rate} onChange={e => setData('respiratory_rate', e.target.value)} />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="oxygen_saturation" className="text-xs">SpO2 (%)</Label>
                                        <Input id="oxygen_saturation" type="number" value={data.oxygen_saturation} onChange={e => setData('oxygen_saturation', e.target.value)} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Evolución Clínica */}
                        <div className="md:col-span-2 space-y-6">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <ClipboardList className="size-4 text-primary" />
                                        Subjetivo y Objetivo
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-4">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="reason_for_visit">Motivo de Consulta *</Label>
                                        <Input 
                                            id="reason_for_visit" 
                                            placeholder="Ej. Dolor abdominal de 2 días..." 
                                            value={data.reason_for_visit} 
                                            onChange={e => setData('reason_for_visit', e.target.value)} 
                                            required
                                        />
                                        {errors.reason_for_visit && <p className="text-xs text-destructive">{errors.reason_for_visit}</p>}
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="clinical_findings">Hallazgos y Examen Físico</Label>
                                        <textarea
                                            id="clinical_findings"
                                            rows={4}
                                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="Detalles observados durante la revisión..."
                                            value={data.clinical_findings}
                                            onChange={e => setData('clinical_findings', e.target.value)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3 text-indigo-600 dark:text-indigo-400">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <FileText className="size-4" />
                                        Análisis y Plan
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-4">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="diagnosis">Diagnóstico *</Label>
                                        <textarea
                                            id="diagnosis"
                                            rows={2}
                                            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            placeholder="Diagnóstico clínico o CIE-10..."
                                            value={data.diagnosis}
                                            onChange={e => setData('diagnosis', e.target.value)}
                                            required
                                        />
                                        {errors.diagnosis && <p className="text-xs text-destructive">{errors.diagnosis}</p>}
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="treatment_plan">Plan de Tratamiento / Receta</Label>
                                        <textarea
                                            id="treatment_plan"
                                            rows={4}
                                            className="flex w-full rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-sm ring-offset-background placeholder:text-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            placeholder="Indicaciones, medicamentos, dosis..."
                                            value={data.treatment_plan}
                                            onChange={e => setData('treatment_plan', e.target.value)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex justify-end gap-3">
                                <Link href={`/patients/${patient.id}`}>
                                    <Button variant="outline" type="button">Cancelar</Button>
                                </Link>
                                <Button type="submit" disabled={processing} className="px-8 gap-2">
                                    <Save className="size-4" />
                                    Guardar Consulta
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
