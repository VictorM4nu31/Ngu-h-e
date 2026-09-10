import { Head, router, useForm } from '@inertiajs/react';
import {
    Search,
    CreditCard,
    Banknote,
    Landmark,
    Clock,
    Plus,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { formatStoredDate } from '@/lib/date';
import { __ } from '@/lib/i18n';
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
    patients: { id: number; full_name: string }[];
}

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

export default function Index({ payments, filters, patients }: Props) {
    const [search, setSearch] = useState(filters.search);
    const [dialogOpen, setDialogOpen] = useState(false);

    const {
        data: paymentData,
        setData: setPaymentData,
        post: postPayment,
        processing: savingPayment,
        errors: paymentErrors,
        reset: resetPayment,
    } = useForm({
        patient_id: '',
        amount: '',
        payment_method: 'cash',
        status: 'paid',
        notes: '',
    });

    const submitPayment = (e: React.FormEvent) => {
        e.preventDefault();
        postPayment('/payments', {
            preserveScroll: true,
            onSuccess: () => {
                resetPayment();
                setDialogOpen(false);
            },
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: __('Dashboard'), href: '/dashboard' },
        { title: __('Payments'), href: '/payments' },
    ];

    const getMethodLabel = (method: string) => {
        switch (method) {
            case 'cash':
                return __('Cash');
            case 'card':
                return __('Card');
            case 'transfer':
                return __('Transfer');
            default:
                return method;
        }
    };

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
            <Head title={__('Payment History')} />

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold">
                            {__('Payment Management')}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {__(
                                'Control of income and transactions of the clinic.',
                            )}
                        </p>
                    </div>
                    <Button
                        onClick={() => setDialogOpen(true)}
                        className="gap-1.5"
                    >
                        <Plus className="size-4" />
                        {__('New Payment')}
                    </Button>
                </div>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{__('Register Payment')}</DialogTitle>
                            <DialogDescription>
                                {__(
                                    'Record a standalone payment for a patient.',
                                )}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={submitPayment} className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="payment_patient">
                                    {__('Patient')}{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={paymentData.patient_id}
                                    onValueChange={(val) =>
                                        setPaymentData('patient_id', val)
                                    }
                                >
                                    <SelectTrigger id="payment_patient">
                                        <SelectValue
                                            placeholder={__(
                                                'Select a patient...',
                                            )}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {patients.map((patient) => (
                                            <SelectItem
                                                key={patient.id}
                                                value={String(patient.id)}
                                            >
                                                {patient.full_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {paymentErrors.patient_id && (
                                    <p className="text-xs text-destructive">
                                        {paymentErrors.patient_id}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="payment_amount">
                                        {__('Amount ($)')}{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="payment_amount"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={paymentData.amount}
                                        onChange={(e) =>
                                            setPaymentData(
                                                'amount',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    {paymentErrors.amount && (
                                        <p className="text-xs text-destructive">
                                            {paymentErrors.amount}
                                        </p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="payment_method">
                                        {__('Method')}
                                    </Label>
                                    <Select
                                        value={paymentData.payment_method}
                                        onValueChange={(val) =>
                                            setPaymentData(
                                                'payment_method',
                                                val,
                                            )
                                        }
                                    >
                                        <SelectTrigger id="payment_method">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cash">
                                                {__('Cash')}
                                            </SelectItem>
                                            <SelectItem value="card">
                                                {__('Card')}
                                            </SelectItem>
                                            <SelectItem value="transfer">
                                                {__('Transfer')}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {paymentErrors.payment_method && (
                                        <p className="text-xs text-destructive">
                                            {paymentErrors.payment_method}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="payment_status">
                                        {__('Status')}
                                    </Label>
                                    <Select
                                        value={paymentData.status}
                                        onValueChange={(val) =>
                                            setPaymentData('status', val)
                                        }
                                    >
                                        <SelectTrigger id="payment_status">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="paid">
                                                {__('Completed')}
                                            </SelectItem>
                                            <SelectItem value="pending">
                                                {__('Pending')}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {paymentErrors.status && (
                                        <p className="text-xs text-destructive">
                                            {paymentErrors.status}
                                        </p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="payment_notes">
                                        {__('Notes')}
                                    </Label>
                                    <Input
                                        id="payment_notes"
                                        value={paymentData.notes}
                                        onChange={(e) =>
                                            setPaymentData(
                                                'notes',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setDialogOpen(false)}
                                >
                                    {__('Cancel')}
                                </Button>
                                <Button type="submit" disabled={savingPayment}>
                                    {__('Save Payment')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">
                                {__('Recent Transactions')}
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
                                    placeholder={__('Search by patient...')}
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
                                            {__('Patient')}
                                        </th>
                                        <th className="px-4 py-3 font-bold">
                                            {__('Date')}
                                        </th>
                                        <th className="px-4 py-3 font-bold">
                                            {__('Method')}
                                        </th>
                                        <th className="px-4 py-3 text-right font-bold">
                                            {__('Amount')}
                                        </th>
                                        <th className="px-4 py-3 font-bold">
                                            {__('Status')}
                                        </th>
                                        <th className="px-4 py-3 font-bold">
                                            {__('Notes')}
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
                                                        ? __('Completed')
                                                        : __('Pending')}
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
                                                {__('No payments recorded.')}
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
