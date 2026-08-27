import { Head } from '@inertiajs/react';
import { TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import {
    Card,
    CardContent,
    CardTitle,
    CardDescription,
    CardHeader,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { __ } from '@/lib/i18n';
import type { BreadcrumbItem } from '@/types';

interface Stats {
    total_revenue_month: number;
    total_payments_today: number;
    revenue_today: number;
    pending_amount: number;
}

interface RevenueData {
    date: string;
    total: number;
}

interface PaymentMethod {
    payment_method: string;
    total: number;
}

interface Props {
    dailyRevenue: RevenueData[];
    stats: Stats;
    paymentMethods: PaymentMethod[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Financial Reports', href: '/reports' },
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

export default function Reports({
    dailyRevenue,
    stats,
    paymentMethods,
}: Props) {
    const revenueLabel = __('Revenue');
    const methodLabels = {
        cash: __('Cash'),
        card: __('Card'),
        transfer: __('Bank transfer'),
    };

    const pieData = paymentMethods.map((m) => ({
        name:
            methodLabels[m.payment_method as keyof typeof methodLabels] ??
            m.payment_method,
        value: Number(m.total),
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('Financial Reports')} />

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6 pb-10">
                <div>
                    <h1 className="text-2xl font-bold">
                        {__('Financial Analysis')}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {__(
                            'Revenue and economic performance summary of the clinic.',
                        )}
                    </p>
                </div>

                {/* Tarjetas de Estadísticas */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-none bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2 text-emerald-100">
                                <DollarSign className="size-4" />{' '}
                                {__("Today's Revenue")}
                            </CardDescription>
                            <CardTitle className="text-3xl font-bold">
                                $
                                {Number(stats.revenue_today).toLocaleString(
                                    'es-MX',
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-emerald-100">
                                {stats.total_payments_today}{' '}
                                {__('Transactions today')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2">
                                <TrendingUp className="size-4" />{' '}
                                {__('This Month')}
                            </CardDescription>
                            <CardTitle className="text-3xl font-bold text-primary">
                                $
                                {Number(
                                    stats.total_revenue_month,
                                ).toLocaleString('es-MX')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs font-medium text-emerald-600">
                                {__('Monthly total')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2">
                                <Calendar className="size-4" /> {__('Pending')}
                            </CardDescription>
                            <CardTitle className="text-3xl font-bold text-amber-500">
                                $
                                {Number(stats.pending_amount).toLocaleString(
                                    'es-MX',
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">
                                {__('To collect')}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2">
                                <Users className="size-4" /> {__('Efficiency')}
                            </CardDescription>
                            <CardTitle className="text-3xl font-bold">
                                100%
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">
                                {__('Recovery rate')}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Gráfica de Ingresos Diarios */}
                    <Card className="shadow-sm md:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg">
                                {__('Revenue Flow (Last 30 days)')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[350px]">
                            {dailyRevenue.length > 0 ? (
                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                    minWidth={0}
                                    minHeight={300}
                                >
                                    <BarChart data={dailyRevenue}>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            vertical={false}
                                            stroke="#f0f0f0"
                                        />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(val) =>
                                                new Date(
                                                    val,
                                                ).toLocaleDateString(
                                                    undefined,
                                                    {
                                                        day: '2-digit',
                                                        month: 'short',
                                                    },
                                                )
                                            }
                                            tick={{ fontSize: 11 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            tickFormatter={(val) => `$${val}`}
                                            tick={{ fontSize: 11 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip
                                            formatter={(
                                                value: number | undefined,
                                            ) => [
                                                `$${Number(value).toLocaleString()}`,
                                                revenueLabel,
                                            ]}
                                            labelFormatter={(label) =>
                                                new Date(
                                                    label,
                                                ).toLocaleDateString(
                                                    undefined,
                                                    {
                                                        day: 'numeric',
                                                        month: 'long',
                                                    },
                                                )
                                            }
                                            contentStyle={{
                                                borderRadius: '12px',
                                                border: 'none',
                                                boxShadow:
                                                    '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                            }}
                                        />
                                        <Bar
                                            dataKey="total"
                                            fill="#3b82f6"
                                            radius={[4, 4, 0, 0]}
                                            barSize={20}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                                    {__('No revenue recorded in this period.')}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Distribución por Método de Pago */}
                    <Card className="shadow-sm md:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-lg">
                                {__('Payment Methods')}
                            </CardTitle>
                            <CardDescription>
                                {__('Revenue distribution by type.')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex h-[250px] flex-col items-center justify-center">
                            {pieData.length > 0 ? (
                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                    minWidth={0}
                                    minHeight={200}
                                >
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={
                                                        COLORS[
                                                            index %
                                                                COLORS.length
                                                        ]
                                                    }
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(v) =>
                                                `$${Number(v).toLocaleString()}`
                                            }
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                                    {__('No payments recorded.')}
                                </div>
                            )}
                            <div className="mt-4 grid w-full grid-cols-2 gap-4 text-xs">
                                {pieData.map((d, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-2"
                                    >
                                        <div
                                            className="size-2 rounded-full"
                                            style={{
                                                backgroundColor:
                                                    COLORS[i % COLORS.length],
                                            }}
                                        ></div>
                                        <span className="whitespace-nowrap text-muted-foreground">
                                            {d.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
