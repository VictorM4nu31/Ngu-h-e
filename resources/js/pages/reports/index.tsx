import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, DollarSign, Calendar, CreditCard, Banknote, Landmark } from 'lucide-react';

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
    { title: 'Reportes Financieros', href: '/reports' },
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

const getMethodLabel = (method: string) => {
    switch (method) {
        case 'cash': return 'Efectivo';
        case 'card': return 'Tarjeta';
        case 'transfer': return 'Transferencia';
        default: return method;
    }
};

export default function Reports({ dailyRevenue, stats, paymentMethods }: Props) {
    const pieData = paymentMethods.map(m => ({
        name: getMethodLabel(m.payment_method),
        value: Number(m.total)
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reportes Financieros" />
            
            <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full pb-10">
                <div>
                    <h1 className="text-2xl font-bold">Análisis Financiero</h1>
                    <p className="text-muted-foreground text-sm">Resumen de ingresos y rendimiento económico del consultorio.</p>
                </div>

                {/* Tarjetas de Estadísticas */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-emerald-500 text-white border-none shadow-lg shadow-emerald-500/20">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-emerald-100 flex items-center gap-2">
                                <DollarSign className="size-4" /> Ingresos Hoy
                            </CardDescription>
                            <CardTitle className="text-3xl font-bold">
                                ${Number(stats.revenue_today).toLocaleString('es-MX')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-emerald-100">{stats.total_payments_today} transacciones hoy</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2">
                                <TrendingUp className="size-4" /> Este Mes
                            </CardDescription>
                            <CardTitle className="text-3xl font-bold text-primary">
                                ${Number(stats.total_revenue_month).toLocaleString('es-MX')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs font-medium text-emerald-600">Acumulado mensual</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2">
                                <Calendar className="size-4" /> Pendiente
                            </CardDescription>
                            <CardTitle className="text-3xl font-bold text-amber-500">
                                ${Number(stats.pending_amount).toLocaleString('es-MX')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">Por cobrar</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2">
                                <Users className="size-4" /> Eficiencia
                            </CardDescription>
                            <CardTitle className="text-3xl font-bold">100%</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">Tasa de recuperación</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Gráfica de Ingresos Diarios */}
                    <Card className="md:col-span-2 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Flujo de Ingresos (Últimos 30 días)</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dailyRevenue}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis 
                                        dataKey="date" 
                                        tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
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
                                        formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Ingreso']}
                                        labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Distribución por Método de Pago */}
                    <Card className="md:col-span-1 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Métodos de Pago</CardTitle>
                            <CardDescription>Distribución de ingresos por tipo.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[250px] flex flex-col items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
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
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="grid grid-cols-2 gap-4 mt-4 w-full text-xs">
                                {pieData.map((d, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="size-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                        <span className="text-muted-foreground whitespace-nowrap">{d.name}</span>
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
