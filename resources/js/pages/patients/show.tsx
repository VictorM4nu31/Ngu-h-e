import { Head, Link, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Edit, Phone, Mail, MapPin, Calendar, User, Activity, AlertCircle, FileText, Paperclip, Upload, Trash2, Download, Clock, Eye } from 'lucide-react';

interface Attachment {
    id: number;
    file_name: string;
    file_path: string;
    file_size: number;
    mime_type: string;
    label: string | null;
    url: string;
    created_at: string;
}

interface Consultation {
    id: number;
    doctor: { id: number; name: string };
    start_time: string;
    reason_for_visit: string;
    clinical_findings: string | null;
    diagnosis: string;
    treatment_plan: string | null;
    created_at: string;
    // Vital signs if needed
    weight?: number;
    height?: number;
    temperature?: number;
    bp_systolic?: number;
    bp_diastolic?: number;
}

interface Patient {
    id: number;
    full_name: string;
    document_id: string;
    birth_date: string;
    gender: string;
    phone: string;
    email: string;
    address: string;
    medical_antecedents: string;
    allergies: string;
    chronic_diseases: string;
    current_medication: string;
    notes: string;
    created_at: string;
    attachments?: Attachment[];
    consultations?: Consultation[];
}

interface Props {
    patient: Patient;
}

export default function Show({ patient }: Props) {
    const { data, setData, post, processing, reset } = useForm({
        file: null as File | null,
        label: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Pacientes', href: '/patients' },
        { title: patient.full_name, href: '#' },
    ];

    const calculateAge = (dateString: string) => {
        if (!dateString) return 'N/A';
        const today = new Date();
        const birthDate = new Date(dateString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/patients/${patient.id}/attachments`, {
            onSuccess: () => reset(),
        });
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Expediente: ${patient.full_name}`} />

            <div className="flex flex-col gap-6 p-4 max-w-6xl mx-auto w-full">
                {/* Header Acciones */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                            <User className="size-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{patient.full_name}</h1>
                            <p className="text-muted-foreground text-sm">ID: {patient.document_id || 'Sin identificación'}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/patients/${patient.id}/edit`}>
                            <Button variant="outline" className="flex items-center gap-2">
                                <Edit className="size-4" />
                                Editar Datos
                            </Button>
                        </Link>
                        <Link href={`/consultations/create?patient_id=${patient.id}`}>
                            <Button className="flex items-center gap-2">
                                <Activity className="size-4" />
                                Nueva Consulta
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Columna Lateral: Info Base */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Datos de Contacto</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 text-sm">
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <Phone className="size-4" />
                                    <span>{patient.phone || 'Sin teléfono'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <Mail className="size-4" />
                                    <span>{patient.email || 'Sin correo'}</span>
                                </div>
                                <div className="flex items-start gap-3 text-muted-foreground">
                                    <MapPin className="size-4 mt-0.5" />
                                    <span>{patient.address || 'Sin dirección registrada'}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Edad:</span>
                                    <span className="font-medium">{calculateAge(patient.birth_date)} años</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Género:</span>
                                    <Badge variant="outline" className="capitalize">
                                        {patient.gender || 'No especificado'}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-destructive/20 bg-destructive/5">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                                    <AlertCircle className="size-4" />
                                    Alertas Médicas
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 text-sm">
                                <div>
                                    <p className="font-semibold text-destructive">Alergias:</p>
                                    <p className="text-destructive/80">{patient.allergies || 'Ninguna conocida'}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-destructive">Condiciones Crónicas:</p>
                                    <p className="text-destructive/80">{patient.chronic_diseases || 'Ninguna reportada'}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Adjuntos */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Paperclip className="size-4" />
                                    Documentos y Adjuntos
                                </CardTitle>
                                <CardDescription>Estudios, fotos, recetas escaneadas.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <form onSubmit={handleUpload} className="grid gap-3 p-3 border rounded-lg bg-muted/30">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="file" className="text-xs">Subir archivo</Label>
                                        <Input 
                                            id="file" 
                                            type="file" 
                                            className="text-xs h-8"
                                            onChange={(e) => setData('file', e.target.files?.[0] || null)}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="label" className="text-xs">Etiqueta (Opcional)</Label>
                                        <Input 
                                            id="label" 
                                            placeholder="Ej. Rayos X" 
                                            className="text-xs h-8"
                                            value={data.label}
                                            onChange={(e) => setData('label', e.target.value)}
                                        />
                                    </div>
                                    <Button type="submit" size="sm" className="w-full gap-2" disabled={processing}>
                                        <Upload className="size-3" />
                                        Subir
                                    </Button>
                                </form>

                                <div className="space-y-2">
                                    {patient.attachments && patient.attachments.length > 0 ? (
                                        patient.attachments.map((file) => (
                                            <div key={file.id} className="flex items-center justify-between p-2 rounded-md border bg-card group">
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-xs font-medium truncate">{file.label || file.file_name}</span>
                                                    <span className="text-[10px] text-muted-foreground">{formatSize(file.file_size)}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <a href={file.url} target="_blank" rel="noopener noreferrer">
                                                        <Button variant="ghost" size="icon" className="size-7">
                                                            <Download className="size-3" />
                                                        </Button>
                                                    </a>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="size-7 text-destructive"
                                                        onClick={() => {
                                                            if (confirm('Eliminar archivo?')) {
                                                                router.delete(`/attachments/${file.id}`);
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="size-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-center text-muted-foreground pt-2">Sin adjuntos.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Columna Principal: Historia / Notas */}
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <FileText className="size-4" />
                                    Resumen Clínico
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="font-medium mb-2">Antecedentes Médicos</h3>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/30 p-3 rounded-md border">
                                        {patient.medical_antecedents || 'No se han registrado antecedentes.'}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-medium mb-2">Medicación Actual</h3>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-primary/5 p-3 rounded-md border border-primary/10">
                                        {patient.current_medication || 'No hay medicación registrada.'}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-medium mb-2">Notas Administrativas/Internas</h3>
                                    <p className="text-sm text-muted-foreground italic">
                                        {patient.notes || 'Sin notas adicionales.'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Timeline / Historial */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Calendar className="size-5" />
                                Historial de Consultas
                            </h2>
                            
                            {patient.consultations && patient.consultations.length > 0 ? (
                                <div className="space-y-4">
                                    {patient.consultations.map((consultation) => (
                                        <Card key={consultation.id} className="overflow-hidden">
                                            <CardHeader className="bg-muted/30 pb-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="size-4 text-muted-foreground" />
                                                        <span className="text-sm font-medium">
                                                            {new Date(consultation.created_at).toLocaleDateString()} - {new Date(consultation.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline">Dr. {consultation.doctor.name}</Badge>
                                                        <Link href={`/consultations/${consultation.id}`}>
                                                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1">
                                                                <Eye className="size-3" />
                                                                Ver
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="pt-4 space-y-3">
                                                <div>
                                                    <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Motivo</h4>
                                                    <p className="text-sm">{consultation.reason_for_visit}</p>
                                                </div>
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <div>
                                                        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Diagnóstico</h4>
                                                        <p className="text-sm font-medium">{consultation.diagnosis}</p>
                                                    </div>
                                                    {consultation.treatment_plan && (
                                                        <div>
                                                            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Plan de Tratamiento</h4>
                                                            <p className="text-sm italic">{consultation.treatment_plan}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-muted/50 rounded-xl border border-dashed p-8 text-center text-muted-foreground">
                                    <p>No hay consultas registradas para este paciente.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
