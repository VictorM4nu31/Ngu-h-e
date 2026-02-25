import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { ArrowLeft, Clock, User, Activity, FileText, ClipboardList, Thermometer, Weight, Ruler } from 'lucide-react';

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
}

interface Props {
    consultation: Consultation;
}

export default function Show({ consultation }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Pacientes', href: '/patients' },
        { title: consultation.patient.full_name, href: `/patients/${consultation.patient.id}` },
        { title: 'Detalle de Consulta', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Consulta: ${consultation.patient.full_name}`} />

            <div className="flex flex-col gap-6 p-4 max-w-4xl mx-auto w-full pb-10">
                <div className="flex items-center gap-4">
                    <Link href={`/patients/${consultation.patient.id}`}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="size-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Detalle de Consulta</h1>
                        <p className="text-muted-foreground text-sm">
                            {new Date(consultation.created_at).toLocaleDateString()} - {new Date(consultation.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Info Lateral */}
                    <Card className="md:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Activity className="size-4 text-primary" />
                                Signos Vitales
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 text-sm">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-muted-foreground flex items-center gap-1.5"><Weight className="size-3" /> Peso</p>
                                    <p className="font-medium">{consultation.weight ? `${consultation.weight} kg` : 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground flex items-center gap-1.5"><Ruler className="size-3" /> Talla</p>
                                    <p className="font-medium">{consultation.height ? `${consultation.height} cm` : 'N/A'}</p>
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1.5"><Thermometer className="size-3" /> Temp.</span>
                                    <span className="font-medium">{consultation.temperature ? `${consultation.temperature} °C` : 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Presión A.</span>
                                    <span className="font-medium">
                                        {consultation.bp_systolic && consultation.bp_diastolic 
                                            ? `${consultation.bp_systolic}/${consultation.bp_diastolic}` 
                                            : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">F. Cardíaca</span>
                                    <span className="font-medium">{consultation.heart_rate ? `${consultation.heart_rate} lpm` : 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Sat. O2</span>
                                    <span className="font-medium">{consultation.oxygen_saturation ? `${consultation.oxygen_saturation} %` : 'N/A'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contenido Principal */}
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader className="pb-3 border-b mb-4">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <ClipboardList className="size-5 text-primary" />
                                        Registro Clínico
                                    </CardTitle>
                                    <Badge variant="secondary">Dr. {consultation.doctor.name}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="font-bold text-sm uppercase text-muted-foreground mb-2">Motivo de Consulta</h3>
                                    <p className="text-foreground">{consultation.reason_for_visit}</p>
                                </div>

                                {consultation.clinical_findings && (
                                    <div>
                                        <h3 className="font-bold text-sm uppercase text-muted-foreground mb-2">Hallazgos / Examen Físico</h3>
                                        <p className="text-foreground whitespace-pre-wrap bg-muted/30 p-4 rounded-lg border">
                                            {consultation.clinical_findings}
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <h3 className="font-bold text-sm uppercase text-indigo-600 dark:text-indigo-400 mb-2">Diagnóstico</h3>
                                    <p className="text-lg font-medium">{consultation.diagnosis}</p>
                                </div>

                                {consultation.treatment_plan && (
                                    <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                                        <h3 className="font-bold text-sm uppercase text-primary mb-2 flex items-center gap-2">
                                            <FileText className="size-4" />
                                            Plan de Tratamiento / Receta
                                        </h3>
                                        <p className="text-foreground whitespace-pre-wrap italic">
                                            {consultation.treatment_plan}
                                        </p>
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
