import { Head, Link } from '@inertiajs/react';
import { FileText, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { formatStoredDate } from '@/lib/date';
import { __ } from '@/lib/i18n';
import type { BreadcrumbItem, PaginationLink } from '@/types';

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
        links: PaginationLink[];
    };
}

export default function MyPrescriptions({ prescriptions }: Props) {
    const data = Array.isArray(prescriptions)
        ? prescriptions
        : prescriptions?.data || [];

    const breadcrumbs: BreadcrumbItem[] = [
        { title: __('Dashboard'), href: '/dashboard' },
        { title: __('My Prescriptions'), href: '/my-prescriptions' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('My Prescriptions')} />

            <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4">
                <h1 className="flex items-center gap-2 text-2xl font-bold">
                    <FileText className="size-6" />
                    {__('My Prescriptions')}
                </h1>

                <div className="grid gap-4">
                    {data.length > 0 ? (
                        data.map((rx) => (
                            <Card key={rx.id} className="overflow-hidden">
                                <CardContent className="p-4">
                                    <div className="flex flex-col items-start gap-4 md:flex-row md:items-center">
                                        <div className="flex items-center justify-center rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
                                            <FileText className="size-6 text-emerald-600" />
                                        </div>

                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-bold">
                                                {rx.consultation?.diagnosis ||
                                                    __('Medical prescription')}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {__('Dr.')}{' '}
                                                {rx.consultation?.doctor?.name}{' '}
                                                —{' '}
                                                {formatStoredDate(
                                                    rx.created_at,
                                                )}
                                            </p>
                                            {rx.instructions && (
                                                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                                    {rx.instructions}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/prescriptions/${rx.id}/preview`}
                                                target="_blank"
                                            >
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="gap-1.5"
                                                >
                                                    <Eye className="size-3.5" />
                                                    {__('View')}
                                                </Button>
                                            </Link>
                                            <Link
                                                href={`/prescriptions/${rx.id}/download`}
                                            >
                                                <Button
                                                    size="sm"
                                                    className="gap-1.5"
                                                >
                                                    <Download className="size-3.5" />
                                                    {__('Download')}
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/30 p-12">
                            <FileText className="mb-4 size-12 text-muted-foreground/30" />
                            <h3 className="text-lg font-medium text-muted-foreground">
                                {__('You have no prescriptions registered')}
                            </h3>
                            <p className="text-sm text-muted-foreground/60">
                                {__(
                                    'Your medical prescriptions will appear here when the doctor issues them.',
                                )}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
