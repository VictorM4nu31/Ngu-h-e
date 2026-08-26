import { Head, Link } from '@inertiajs/react';
import { Activity, Calendar, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { formatStoredDate } from '@/lib/date';

interface Consultation {
    id: number;
    diagnosis: string;
    reason_for_visit: string;
    created_at: string;
    patient: { id: number; full_name: string };
    doctor: { id: number; name: string };
}

interface Props {
    consultations: { data: Consultation[] };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Consultas', href: '/consultations' },
];

export default function Index({ consultations }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Consultas" />
            <div className="flex w-full max-w-6xl flex-col gap-6 p-4">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold">
                        <Activity className="size-6" />
                        Consultas
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Historial de atenciones clínicas registradas.
                    </p>
                </div>
                <div className="grid gap-4">
                    {consultations.data.length > 0 ? (
                        consultations.data.map((consultation) => (
                            <Card key={consultation.id}>
                                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-w-0 space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Link
                                                href={`/consultations/${consultation.id}`}
                                                className="font-bold hover:underline"
                                            >
                                                {consultation.patient.full_name}
                                            </Link>
                                            <Badge variant="outline">
                                                {consultation.diagnosis}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {consultation.reason_for_visit}
                                        </p>
                                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <User className="size-3.5" />
                                                {consultation.doctor.name}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="size-3.5" />
                                                {formatStoredDate(
                                                    consultation.created_at,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/consultations/${consultation.id}`}
                                        className="text-sm font-medium text-primary hover:underline"
                                    >
                                        Ver detalles
                                    </Link>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="rounded-xl border border-dashed bg-muted/30 p-12 text-center text-muted-foreground">
                            No hay consultas registradas.
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
