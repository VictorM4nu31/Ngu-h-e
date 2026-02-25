import { Head, Link, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { VitalSignsChart } from '@/components/clinical/vital-signs-chart';
import { 
    Edit, Phone, Mail, MapPin, Calendar, User, Activity, 
    AlertCircle, FileText, Paperclip, Upload, Trash2, 
    Download, Clock, Eye, History, TrendingUp, NotebookTabs 
} from 'lucide-react';

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
    weight?: number;
    height?: number;
    temperature?: number;
    bp_systolic?: number;
    bp_diastolic?: number;
    heart_rate?: number;
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

    // Unified Timeline Logic
    const timelineItems = [
        ...(patient.consultations || []).map(c => ({
            id: `c-${c.id}`,
            date: c.created_at,
            type: 'consultation',
            data: c
        })),
        ...(patient.attachments || []).map(a => ({
            id: `a-${a.id}`,
            date: a.created_at,
            type: 'attachment',
            data: a
        }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const chartData = (patient.consultations || [])
        .filter(c => c.weight || c.bp_systolic)
        .map(c => ({
            date: c.created_at,
            weight: c.weight ? Number(c.weight) : undefined,
            bp_systolic: c.bp_systolic ? Number(c.bp_systolic) : undefined,
            bp_diastolic: c.bp_diastolic ? Number(c.bp_diastolic) : undefined,
        }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Expediente: ${patient.full_name}`} />

            <div className="flex flex-col gap-6 p-4 max-w-6xl mx-auto w-full pb-10">
                {/* Header Acciones */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-2xl shadow-sm border border-primary/20">
                            <User className="size-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{patient.full_name}</h1>
                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <Badge variant="secondary" className="font-mono">ID: {patient.document_id || 'N/A'}</Badge>
                                <span>•</span>
                                <span>{calculateAge(patient.birth_date)} años</span>
                                <span>•</span>
                                <span className="capitalize">{patient.gender || 'No especificado'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/patients/${patient.id}/edit`}>
                            <Button variant="outline" className="gap-2">
                                <Edit className="size-4" />
                                Editar Perfil
                            </Button>
                        </Link>
                        <Link href={`/consultations/create?patient_id=${patient.id}`}>
                            <Button className="gap-2 shadow-lg shadow-primary/20">
                                <Activity className="size-4" />
                                Nueva Consulta
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-4">
                    {/* Lateral: Alertas y Contacto */}
                    <div className="md:col-span-1 space-y-6">
                        <Card className="border-destructive/30 bg-destructive/5 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold flex items-center gap-2 text-destructive uppercase tracking-wider">
                                    <AlertCircle className="size-4" />
                                    Alertas Médicas
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 text-sm">
                                <div>
                                    <p className="font-semibold text-destructive/80 text-xs uppercase mb-1">Alergias</p>
                                    <p className="font-medium text-destructive">{patient.allergies || 'Ninguna conocida'}</p>
                                </div>
                                <Separator className="bg-destructive/20" />
                                <div>
                                    <p className="font-semibold text-destructive/80 text-xs uppercase mb-1">Curas Crónicas</p>
                                    <p className="font-medium text-destructive">{patient.chronic_diseases || 'Ninguna reportada'}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Contacto</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 text-sm">
                                <div className="flex items-center gap-3 group">
                                    <div className="p-1.5 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                                        <Phone className="size-3.5 text-muted-foreground group-hover:text-primary" />
                                    </div>
                                    <span className="font-medium">{patient.phone || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-3 group">
                                    <div className="p-1.5 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                                        <Mail className="size-3.5 text-muted-foreground group-hover:text-primary" />
                                    </div>
                                    <span className="font-medium truncate">{patient.email || 'N/A'}</span>
                                </div>
                                <div className="flex items-start gap-3 group">
                                    <div className="p-1.5 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors mt-0.5">
                                        <MapPin className="size-3.5 text-muted-foreground group-hover:text-primary" />
                                    </div>
                                    <span className="font-medium text-xs leading-relaxed">{patient.address || 'N/A'}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Principal con Tabs */}
                    <div className="md:col-span-3">
                        <Tabs defaultValue="evolution" className="w-full">
                            <TabsList className="grid w-full grid-cols-4 mb-6">
                                <TabsTrigger value="evolution" className="gap-2">
                                    <History className="size-4" />
                                    <span className="hidden sm:inline">Evolución</span>
                                </TabsTrigger>
                                <TabsTrigger value="vitals" className="gap-2">
                                    <TrendingUp className="size-4" />
                                    <span className="hidden sm:inline">Tendencias</span>
                                </TabsTrigger>
                                <TabsTrigger value="clinical" className="gap-2">
                                    <NotebookTabs className="size-4" />
                                    <span className="hidden sm:inline">Resumen</span>
                                </TabsTrigger>
                                <TabsTrigger value="docs" className="gap-2">
                                    <Paperclip className="size-4" />
                                    <span className="hidden sm:inline">Documentos</span>
                                </TabsTrigger>
                            </TabsList>

                            {/* TAB: Evolución (Timeline Unificado) */}
                            <TabsContent value="evolution" className="space-y-6">
                                {timelineItems.length > 0 ? (
                                    <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                                        {timelineItems.map((item) => (
                                            <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                                {/* Icono Central */}
                                                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-primary text-slate-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                                    {item.type === 'consultation' ? <Activity className="size-5" /> : <Paperclip className="size-5" />}
                                                </div>
                                                {/* Contendio */}
                                                <div className="w-[calc(100%-4rem)] md:w-[45%] p-4 rounded border border-slate-200 bg-white shadow">
                                                    <div className="flex items-center justify-between space-x-2 mb-1">
                                                        <time className="font-bold text-slate-900 text-xs">
                                                            {new Date(item.date).toLocaleDateString()}
                                                        </time>
                                                        {item.type === 'consultation' && (
                                                            <Badge variant="outline" className="text-[10px] font-medium">Dr. {(item.data as Consultation).doctor.name}</Badge>
                                                        )}
                                                    </div>
                                                    {item.type === 'consultation' ? (
                                                        <div className="text-slate-500 text-sm">
                                                            <p className="font-semibold text-slate-700 mb-1">{(item.data as Consultation).diagnosis}</p>
                                                            <p className="line-clamp-2 text-xs">{(item.data as Consultation).reason_for_visit}</p>
                                                            <Link href={`/consultations/${(item.data as Consultation).id}`} className="mt-2 inline-flex items-center gap-1 text-primary text-xs font-bold hover:underline">
                                                                Ver detalles <Eye className="size-3" />
                                                            </Link>
                                                        </div>
                                                    ) : (
                                                        <div className="text-slate-500 text-sm flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <FileText className="size-4 text-muted-foreground" />
                                                                <span className="font-medium text-slate-700 truncate max-w-[150px]">{(item.data as Attachment).label || (item.data as Attachment).file_name}</span>
                                                            </div>
                                                            <a href={(item.data as Attachment).url} target="_blank" className="text-primary hover:bg-primary/10 p-1 rounded transition-colors">
                                                                <Download className="size-4" />
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                ) : (
                                    <div className="bg-muted/30 rounded-xl border border-dashed p-12 text-center text-muted-foreground">
                                        <History className="size-12 mx-auto mb-4 opacity-20" />
                                        <p>No hay actividad registrada para este paciente.</p>
                                    </div>
                                )}
                            </TabsContent>

                            {/* TAB: Signos Vitales (Gráficas) */}
                            <TabsContent value="vitals">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Tendencias de Salud</CardTitle>
                                        <CardDescription>Evolución histórica de métricas clave.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <VitalSignsChart data={chartData} />
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* TAB: Resumen Clínico */}
                            <TabsContent value="clinical">
                                <div className="grid gap-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <AlertCircle className="size-4 text-primary" />
                                                Antecedentes Médicos
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/30 p-4 rounded-lg border leading-relaxed">
                                                {patient.medical_antecedents || 'No se han registrado antecedentes.'}
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Activity className="size-4 text-primary" />
                                                Medicación Actual
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-primary/5 p-4 rounded-lg border border-primary/10 leading-relaxed font-medium">
                                                {patient.current_medication || 'No hay medicación registrada.'}
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Notas Adicionales</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground italic">
                                                {patient.notes || 'Sin notas adicionales.'}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            {/* TAB: Documentos */}
                            <TabsContent value="docs" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Upload className="size-4" />
                                            Subir Nuevo Documento
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleUpload} className="flex flex-col md:flex-row items-end gap-3 p-4 border rounded-xl bg-muted/30">
                                            <div className="grid gap-1.5 flex-1 w-full">
                                                <Label htmlFor="file" className="text-xs font-bold uppercase">Archivo</Label>
                                                <Input 
                                                    id="file" 
                                                    type="file" 
                                                    onChange={(e) => setData('file', e.target.files?.[0] || null)}
                                                    required
                                                />
                                            </div>
                                            <div className="grid gap-1.5 flex-1 w-full">
                                                <Label htmlFor="label" className="text-xs font-bold uppercase">Etiqueta</Label>
                                                <Input 
                                                    id="label" 
                                                    placeholder="Ej. Resonancia Magnética" 
                                                    value={data.label}
                                                    onChange={(e) => setData('label', e.target.value)}
                                                />
                                            </div>
                                            <Button type="submit" disabled={processing} className="w-full md:w-auto px-8">
                                                {processing ? 'Subiendo...' : 'Subir'}
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {patient.attachments && patient.attachments.length > 0 ? (
                                        patient.attachments.map((file) => (
                                            <Card key={file.id} className="group overflow-hidden hover:shadow-md transition-shadow">
                                                <CardContent className="p-4 flex flex-col h-full">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10 transition-colors">
                                                            <FileText className="size-5 text-muted-foreground group-hover:text-primary" />
                                                        </div>
                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <a href={file.url} target="_blank" rel="noopener noreferrer">
                                                                <Button variant="ghost" size="icon" className="size-8">
                                                                    <Download className="size-4" />
                                                                </Button>
                                                            </a>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="size-8 text-destructive"
                                                                onClick={() => {
                                                                    if (confirm('¿Eliminar archivo?')) {
                                                                        router.delete(`/attachments/${file.id}`);
                                                                    }
                                                                }}
                                                            >
                                                                <Trash2 className="size-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className="mt-auto">
                                                        <h4 className="text-sm font-bold truncate pr-4">{file.label || file.file_name}</h4>
                                                        <p className="text-[10px] text-muted-foreground uppercase flex gap-2">
                                                            <span>{formatSize(file.file_size)}</span>
                                                            <span>•</span>
                                                            <span>{new Date(file.created_at).toLocaleDateString()}</span>
                                                        </p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    ) : (
                                        <div className="col-span-full py-12 text-center text-muted-foreground">
                                            <Paperclip className="size-12 mx-auto mb-4 opacity-10" />
                                            <p>No hay documentos adjuntos.</p>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

