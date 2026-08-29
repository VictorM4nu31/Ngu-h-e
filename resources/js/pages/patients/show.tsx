import { Head, Link, useForm, router } from '@inertiajs/react';
import {
    Edit,
    Phone,
    Mail,
    MapPin,
    User,
    Activity,
    AlertCircle,
    FileText,
    Paperclip,
    Upload,
    Trash2,
    Download,
    Eye,
    History,
    TrendingUp,
    NotebookTabs,
} from 'lucide-react';
import { VitalSignsChart } from '@/components/clinical/vital-signs-chart';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Badge } from '@/components/ui/badge';
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
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

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

type TimelineItem = {
    id: string;
    date: string;
} & (
    | { type: 'consultation'; data: Consultation }
    | { type: 'attachment'; data: Attachment }
);

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
    const timelineItems: TimelineItem[] = [
        ...(patient.consultations || []).map<TimelineItem>((c) => ({
            id: `c-${c.id}`,
            date: c.created_at,
            type: 'consultation',
            data: c,
        })),
        ...(patient.attachments || []).map<TimelineItem>((a) => ({
            id: `a-${a.id}`,
            date: a.created_at,
            type: 'attachment',
            data: a,
        })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const chartData = (patient.consultations || [])
        .filter((c) => c.weight || c.bp_systolic)
        .map((c) => ({
            date: c.created_at,
            weight: c.weight ? Number(c.weight) : undefined,
            bp_systolic: c.bp_systolic ? Number(c.bp_systolic) : undefined,
            bp_diastolic: c.bp_diastolic ? Number(c.bp_diastolic) : undefined,
        }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Expediente: ${patient.full_name}`} />

            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 pb-10">
                {/* Header Acciones */}
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div className="flex items-center gap-4">
                        <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3 shadow-sm">
                            <User className="size-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                {patient.full_name}
                            </h1>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Badge
                                    variant="secondary"
                                    className="font-mono"
                                >
                                    ID: {patient.document_id || 'N/A'}
                                </Badge>
                                <span>•</span>
                                <span>
                                    {calculateAge(patient.birth_date)} años
                                </span>
                                <span>•</span>
                                <span className="capitalize">
                                    {patient.gender === 'male'
                                        ? 'Masculino'
                                        : patient.gender === 'female'
                                          ? 'Femenino'
                                          : patient.gender || 'No especificado'}
                                </span>
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
                        <Link
                            href={`/consultations/create?patient_id=${patient.id}`}
                        >
                            <Button className="gap-2 shadow-lg shadow-primary/20">
                                <Activity className="size-4" />
                                Nueva Consulta
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-4">
                    {/* Lateral: Alertas y Contacto */}
                    <div className="space-y-6 md:col-span-1">
                        <Card className="border-destructive/30 bg-destructive/5 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-sm font-bold tracking-wider text-destructive uppercase">
                                    <AlertCircle className="size-4" />
                                    Alertas Médicas
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 text-sm">
                                <div>
                                    <p className="mb-1 text-xs font-semibold text-destructive/80 uppercase">
                                        Alergias
                                    </p>
                                    <p className="font-medium text-destructive">
                                        {patient.allergies ||
                                            'Ninguna conocida'}
                                    </p>
                                </div>
                                <Separator className="bg-destructive/20" />
                                <div>
                                    <p className="mb-1 text-xs font-semibold text-destructive/80 uppercase">
                                        Curas Crónicas
                                    </p>
                                    <p className="font-medium text-destructive">
                                        {patient.chronic_diseases ||
                                            'Ninguna reportada'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-bold tracking-wider text-muted-foreground uppercase">
                                    Contacto
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 text-sm">
                                <div className="group flex items-center gap-3">
                                    <div className="rounded-lg bg-muted p-1.5 transition-colors group-hover:bg-primary/10">
                                        <Phone className="size-3.5 text-muted-foreground group-hover:text-primary" />
                                    </div>
                                    <span className="font-medium">
                                        {patient.phone || 'N/A'}
                                    </span>
                                </div>
                                <div className="group flex items-center gap-3">
                                    <div className="rounded-lg bg-muted p-1.5 transition-colors group-hover:bg-primary/10">
                                        <Mail className="size-3.5 text-muted-foreground group-hover:text-primary" />
                                    </div>
                                    <span className="truncate font-medium">
                                        {patient.email || 'N/A'}
                                    </span>
                                </div>
                                <div className="group flex items-start gap-3">
                                    <div className="mt-0.5 rounded-lg bg-muted p-1.5 transition-colors group-hover:bg-primary/10">
                                        <MapPin className="size-3.5 text-muted-foreground group-hover:text-primary" />
                                    </div>
                                    <span className="text-xs leading-relaxed font-medium">
                                        {patient.address || 'N/A'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Principal con Tabs */}
                    <div className="md:col-span-3">
                        <Tabs defaultValue="evolution" className="w-full">
                            <TabsList className="mb-6 grid w-full grid-cols-4">
                                <TabsTrigger
                                    value="evolution"
                                    className="gap-2"
                                >
                                    <History className="size-4" />
                                    <span className="hidden sm:inline">
                                        Evolución
                                    </span>
                                </TabsTrigger>
                                <TabsTrigger value="vitals" className="gap-2">
                                    <TrendingUp className="size-4" />
                                    <span className="hidden sm:inline">
                                        Tendencias
                                    </span>
                                </TabsTrigger>
                                <TabsTrigger value="clinical" className="gap-2">
                                    <NotebookTabs className="size-4" />
                                    <span className="hidden sm:inline">
                                        Resumen
                                    </span>
                                </TabsTrigger>
                                <TabsTrigger value="docs" className="gap-2">
                                    <Paperclip className="size-4" />
                                    <span className="hidden sm:inline">
                                        Documentos
                                    </span>
                                </TabsTrigger>
                            </TabsList>

                            {/* TAB: Evolución (Timeline Unificado) */}
                            <TabsContent
                                value="evolution"
                                className="space-y-6"
                            >
                                {timelineItems.length > 0 ? (
                                    <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:-translate-x-px before:bg-linear-to-b before:from-transparent before:via-slate-300 before:to-transparent md:before:mx-auto md:before:translate-x-0">
                                        {timelineItems.map((item) => (
                                            <div
                                                key={item.id}
                                                className="group is-active relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse"
                                            >
                                                {/* Icono Central */}
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white bg-slate-300 text-slate-500 shadow group-[.is-active]:bg-primary group-[.is-active]:text-white md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                                    {item.type ===
                                                    'consultation' ? (
                                                        <Activity className="size-5" />
                                                    ) : (
                                                        <Paperclip className="size-5" />
                                                    )}
                                                </div>
                                                {/* Contendio */}
                                                <div className="w-[calc(100%-4rem)] rounded border border-slate-200 bg-white p-4 shadow md:w-[45%]">
                                                    <div className="mb-1 flex items-center justify-between space-x-2">
                                                        <time className="text-xs font-bold text-slate-900">
                                                            {new Date(
                                                                item.date,
                                                            ).toLocaleDateString()}
                                                        </time>
                                                        {item.type ===
                                                            'consultation' && (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-[10px] font-medium"
                                                            >
                                                                {
                                                                    (
                                                                        item.data as Consultation
                                                                    ).doctor
                                                                        .name
                                                                }
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {item.type ===
                                                    'consultation' ? (
                                                        <div className="text-sm text-slate-500">
                                                            <p className="mb-1 font-semibold text-slate-700">
                                                                {
                                                                    (
                                                                        item.data as Consultation
                                                                    ).diagnosis
                                                                }
                                                            </p>
                                                            <p className="line-clamp-2 text-xs">
                                                                {
                                                                    (
                                                                        item.data as Consultation
                                                                    )
                                                                        .reason_for_visit
                                                                }
                                                            </p>
                                                            <Link
                                                                href={`/consultations/${item.data.id}`}
                                                                className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                                                            >
                                                                Ver detalles{' '}
                                                                <Eye className="size-3" />
                                                            </Link>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-between text-sm text-slate-500">
                                                            <div className="flex items-center gap-2">
                                                                <FileText className="size-4 text-muted-foreground" />
                                                                <span className="max-w-[150px] truncate font-medium text-slate-700">
                                                                    {(
                                                                        item.data as Attachment
                                                                    ).label ||
                                                                        (
                                                                            item.data as Attachment
                                                                        )
                                                                            .file_name}
                                                                </span>
                                                            </div>
                                                            <a
                                                                href={
                                                                    (
                                                                        item.data as Attachment
                                                                    ).url
                                                                }
                                                                target="_blank"
                                                                className="rounded p-1 text-primary transition-colors hover:bg-primary/10"
                                                            >
                                                                <Download className="size-4" />
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-dashed bg-muted/30 p-12 text-center text-muted-foreground">
                                        <History className="mx-auto mb-4 size-12 opacity-20" />
                                        <p>
                                            No hay actividad registrada para
                                            este paciente.
                                        </p>
                                    </div>
                                )}
                            </TabsContent>

                            {/* TAB: Signos Vitales (Gráficas) */}
                            <TabsContent value="vitals">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            Tendencias de Salud
                                        </CardTitle>
                                        <CardDescription>
                                            Evolución histórica de métricas
                                            clave.
                                        </CardDescription>
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
                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                <AlertCircle className="size-4 text-primary" />
                                                Antecedentes Médicos
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="rounded-lg border bg-muted/30 p-4 text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                                                {patient.medical_antecedents ||
                                                    'No se han registrado antecedentes.'}
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                <Activity className="size-4 text-primary" />
                                                Medicación Actual
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="rounded-lg border border-primary/10 bg-primary/5 p-4 text-sm leading-relaxed font-medium whitespace-pre-wrap text-muted-foreground">
                                                {patient.current_medication ||
                                                    'No hay medicación registrada.'}
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">
                                                Notas Adicionales
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground italic">
                                                {patient.notes ||
                                                    'Sin notas adicionales.'}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            {/* TAB: Documentos */}
                            <TabsContent value="docs" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Upload className="size-4" />
                                            Subir Nuevo Documento
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <form
                                            onSubmit={handleUpload}
                                            className="flex flex-col items-end gap-3 rounded-xl border bg-muted/30 p-4 md:flex-row"
                                        >
                                            <div className="grid w-full flex-1 gap-1.5">
                                                <Label
                                                    htmlFor="file"
                                                    className="text-xs font-bold uppercase"
                                                >
                                                    Archivo
                                                </Label>
                                                <Input
                                                    id="file"
                                                    type="file"
                                                    onChange={(e) =>
                                                        setData(
                                                            'file',
                                                            e.target
                                                                .files?.[0] ||
                                                                null,
                                                        )
                                                    }
                                                    required
                                                />
                                            </div>
                                            <div className="grid w-full flex-1 gap-1.5">
                                                <Label
                                                    htmlFor="label"
                                                    className="text-xs font-bold uppercase"
                                                >
                                                    Etiqueta
                                                </Label>
                                                <Input
                                                    id="label"
                                                    placeholder="Ej. Resonancia Magnética"
                                                    value={data.label}
                                                    onChange={(e) =>
                                                        setData(
                                                            'label',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="w-full px-8 md:w-auto"
                                            >
                                                {processing
                                                    ? 'Subiendo...'
                                                    : 'Subir'}
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {patient.attachments &&
                                    patient.attachments.length > 0 ? (
                                        patient.attachments.map((file) => (
                                            <Card
                                                key={file.id}
                                                className="group overflow-hidden transition-shadow hover:shadow-md"
                                            >
                                                <CardContent className="flex h-full flex-col p-4">
                                                    <div className="mb-2 flex items-start justify-between">
                                                        <div className="rounded-lg bg-muted p-2 transition-colors group-hover:bg-primary/10">
                                                            <FileText className="size-5 text-muted-foreground group-hover:text-primary" />
                                                        </div>
                                                        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                                            <a
                                                                href={file.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="size-8"
                                                                    aria-label="Descargar archivo"
                                                                >
                                                                    <Download className="size-4" />
                                                                </Button>
                                                            </a>
                                                            <ConfirmDialog
                                                                title="Eliminar archivo"
                                                                description="¿Estás seguro de eliminar este archivo?"
                                                                confirmLabel="Eliminar"
                                                                onConfirm={() =>
                                                                    router.delete(
                                                                        `/attachments/${file.id}`,
                                                                    )
                                                                }
                                                                trigger={
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="size-8 text-destructive"
                                                                        aria-label="Eliminar archivo"
                                                                    >
                                                                        <Trash2 className="size-4" />
                                                                    </Button>
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="mt-auto">
                                                        <h4 className="truncate pr-4 text-sm font-bold">
                                                            {file.label ||
                                                                file.file_name}
                                                        </h4>
                                                        <p className="flex gap-2 text-[10px] text-muted-foreground uppercase">
                                                            <span>
                                                                {formatSize(
                                                                    file.file_size,
                                                                )}
                                                            </span>
                                                            <span>•</span>
                                                            <span>
                                                                {new Date(
                                                                    file.created_at,
                                                                ).toLocaleDateString()}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    ) : (
                                        <div className="col-span-full py-12 text-center text-muted-foreground">
                                            <Paperclip className="mx-auto mb-4 size-12 opacity-10" />
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
