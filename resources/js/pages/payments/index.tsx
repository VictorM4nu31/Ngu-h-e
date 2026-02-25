import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, CreditCard, Banknote, Landmark, Clock, FileText } from 'lucide-react';

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
        links: any[];
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
        case 'cash': return <Banknote className="size-4" />;
        case 'card': return <CreditCard className="size-4" />;
        case 'transfer': return <Landmark className="size-4" />;
        default: return <Clock className="size-4" />;
    }
};

const getMethodLabel = (method: string) => {
    switch (method) {
        case 'cash': return 'Efectivo';
        case 'card': return 'Tarjeta';
        case 'transfer': return 'Transferencia';
        default: return method;
    }
};

export default function Index({ payments, filters }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Historial de Pagos" />
            
            <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Gestión de Pagos</h1>
                        <p className="text-muted-foreground text-sm">Control de ingresos y transacciones del consultorio.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Transacciones Recientes</CardTitle>
                            <div className="relative w-72">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Buscar por paciente..."
                                    className="pl-8"
                                    defaultValue={filters.search}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="relative overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 font-bold">Paciente</th>
                                        <th className="px-4 py-3 font-bold">Fecha</th>
                                        <th className="px-4 py-3 font-bold">Método</th>
                                        <th className="px-4 py-3 font-bold text-right">Monto</th>
                                        <th className="px-4 py-3 font-bold">Estado</th>
                                        <th className="px-4 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.data.map((payment) => (
                                        <tr key={payment.id} className="border-b hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-4 font-medium">{payment.patient.full_name}</td>
                                            <td className="px-4 py-4 text-muted-foreground">
                                                {new Date(payment.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    {getMethodIcon(payment.payment_method)}
                                                    <span>{getMethodLabel(payment.payment_method)}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-right font-bold">
                                                ${Number(payment.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-4 py-4">
                                                <Badge variant={payment.status === 'paid' ? 'default' : 'outline'} className={payment.status === 'paid' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>
                                                    {payment.status === 'paid' ? 'Completado' : 'Pendiente'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <Button variant="ghost" size="icon" className="size-8">
                                                    <FileText className="size-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {payments.data.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground italic">
                                                No se encontraron registros de pagos.
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
