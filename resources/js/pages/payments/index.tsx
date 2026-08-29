import { Head, router } from '@inertiajs/react';
import { Search, CreditCard, Banknote, Landmark, Clock } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { formatStoredDate } from '@/lib/date';
import type { BreadcrumbItem, PaginationLink } from '@/types';

interface Payment {
    id: number;
    patient: { full_name: string };
    amount: number;
    payment_method: string;
    status: string;
    created_at: string;
    notes: string | null;
}

interface Props {
    payments: {
        data: Payment[];
        links: PaginationLink[];
    };
    filters: {
        search: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Pagos', href: '/payments' },
];

const getMethodIcon = (method: string) => {
    switch (method) {
        case 'cash':
            return <Banknote className="size-4" />;
        case 'card':
            return <CreditCard className="size-4" />;
        case 'transfer':
            return <Landmark className="size-4" />;
        default:
            return <Clock className="size-4" />;
    }
};

const getMethodLabel = (method: string) => {
    switch (method) {
        case 'cash':
            return 'Efectivo';
        case 'card':
            return 'Tarjeta';
        case 'transfer':
            return 'Transferencia';
        default:
            return method;
    }
};

export default function Index({ payments, filters }: Props) {
    const [search, setSearch] = useState(filters.search);

    const submitSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/payments',
            { search: search || undefined },
            { preserveState: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Historial de Pagos" />

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Gestión de Pagos</h1>
                        <p className="text-sm text-muted-foreground">
                            Control de ingresos y transacciones del consultorio.
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">
                                Transacciones Recientes
                            </CardTitle>
                            <form
                                onSubmit={submitSearch}
                                className="relative w-72"
                            >
                                <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    name="search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Buscar por paciente..."
                                    className="pl-8"
                                />
                            </form>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="relative overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-muted/50 text-xs text-muted-foreground uppercase">
                                    <tr>
                                        <th className="px-4 py-3 font-bold">
                                            Paciente
                                        </th>
                                        <th className="px-4 py-3 font-bold">
                                            Fecha
                                        </th>
                                        <th className="px-4 py-3 font-bold">
                                            Método
                                        </th>
                                        <th className="px-4 py-3 text-right font-bold">
                                            Monto
                                        </th>
                                        <th className="px-4 py-3 font-bold">
                                            Estado
                                        </th>
                                        <th className="px-4 py-3 font-bold">
                                            Notas
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.data.map((payment) => (
                                        <tr
                                            key={payment.id}
                                            className="border-b transition-colors hover:bg-muted/30"
                                        >
                                            <td className="px-4 py-4 font-medium">
                                                {payment.patient.full_name}
                                            </td>
                                            <td className="px-4 py-4 text-muted-foreground">
                                                {formatStoredDate(
                                                    payment.created_at,
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    {getMethodIcon(
                                                        payment.payment_method,
                                                    )}
                                                    <span>
                                                        {getMethodLabel(
                                                            payment.payment_method,
                                                        )}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-right font-bold">
                                                $
                                                {Number(
                                                    payment.amount,
                                                ).toLocaleString('es-MX', {
                                                    minimumFractionDigits: 2,
                                                })}
                                            </td>
                                            <td className="px-4 py-4">
                                                <Badge
                                                    variant={
                                                        payment.status ===
                                                        'paid'
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                    className={
                                                        payment.status ===
                                                        'paid'
                                                            ? 'bg-emerald-500 hover:bg-emerald-600'
                                                            : ''
                                                    }
                                                >
                                                    {payment.status === 'paid'
                                                        ? 'Completado'
                                                        : 'Pendiente'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-4">
                                                {payment.notes ? (
                                                    <span className="text-xs text-muted-foreground">
                                                        {payment.notes}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground/50">
                                                        —
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {payments.data.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-4 py-12 text-center text-muted-foreground italic"
                                            >
                                                No se encontraron registros de
                                                pagos.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
