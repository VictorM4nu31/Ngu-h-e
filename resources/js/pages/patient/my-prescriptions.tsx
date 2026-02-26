import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Eye } from 'lucide-react';

interface Prescription {
    id: number;
    instructions: string;
    created_at: string;
    consultation: {
        id: number;
        diagnosis: string;
        doctor: { id: number; name: string };
    };
}

interface Props {
    prescriptions: {
        data: Prescription[];
        links: any[];
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Mis Recetas', href: '/my-prescriptions' },
];

export default function MyPrescriptions({ prescriptions }: Props) {
    const data = Array.isArray(prescriptions) ? prescriptions : (prescriptions?.data || []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mis Recetas" />

            <div className="flex flex-col gap-6 p-4 max-w-4xl mx-auto w-full">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <FileText className="size-6" />
                    Mis Recetas
                </h1>

                <div className="grid gap-4">
                    {data.length > 0 ? (
                        data.map((rx) => (
                            <Card key={rx.id} className="overflow-hidden">
                                <CardContent className="p-4">
                                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                                        <div className="flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg">
                                            <FileText className="size-6 text-emerald-600" />
                                        </div>

                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-bold">
                                                {rx.consultation?.diagnosis || 'Receta médica'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Dr. {rx.consultation?.doctor?.name} — {new Date(rx.created_at).toLocaleDateString()}
                                            </p>
                                            {rx.instructions && (
                                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{rx.instructions}</p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Link href={`/prescriptions/${rx.id}/preview`} target="_blank">
                                                <Button variant="outline" size="sm" className="gap-1.5">
                                                    <Eye className="size-3.5" />
                                                    Ver
                                                </Button>
                                            </Link>
                                            <Link href={`/prescriptions/${rx.id}/download`}>
                                                <Button size="sm" className="gap-1.5">
                                                    <Download className="size-3.5" />
                                                    Descargar
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center p-12 bg-muted/30 rounded-xl border border-dashed">
                            <FileText className="size-12 text-muted-foreground/30 mb-4" />
                            <h3 className="text-lg font-medium text-muted-foreground">No tienes recetas registradas</h3>
                            <p className="text-sm text-muted-foreground/60">Tus recetas médicas aparecerán aquí cuando el doctor las emita.</p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
