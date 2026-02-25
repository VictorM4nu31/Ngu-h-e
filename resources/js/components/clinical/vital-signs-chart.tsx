import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface VitalSignsData {
    date: string;
    weight?: number;
    bp_systolic?: number;
    bp_diastolic?: number;
    heart_rate?: number;
}

interface Props {
    data: VitalSignsData[];
}

export function VitalSignsChart({ data }: Props) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center p-8 bg-muted/30 rounded-lg border border-dashed">
                <p className="text-sm text-muted-foreground">No hay datos suficientes para graficar.</p>
            </div>
        );
    }

    // Format data for chart
    const formattedData = [...data].reverse().map(item => ({
        ...item,
        formattedDate: new Date(item.date).toLocaleDateString(),
    }));

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Peso (kg)</CardTitle>
                </CardHeader>
                <CardContent className="h-[250px] pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={formattedData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="formattedDate" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis fontSize={10} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="weight" 
                                stroke="rgb(var(--primary))" 
                                strokeWidth={2} 
                                dot={{ fill: 'rgb(var(--primary))' }} 
                                activeDot={{ r: 6 }} 
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Presión Arterial (mmHg)</CardTitle>
                </CardHeader>
                <CardContent className="h-[250px] pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={formattedData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="formattedDate" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis fontSize={10} tickLine={false} axisLine={false} domain={[60, 'auto']} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Legend verticalAlign="top" height={36} fontSize={10} />
                            <Line 
                                type="monotone" 
                                dataKey="bp_systolic" 
                                name="Sistólica"
                                stroke="#ef4444" 
                                strokeWidth={2} 
                                dot={{ fill: '#ef4444' }} 
                            />
                            <Line 
                                type="monotone" 
                                dataKey="bp_diastolic" 
                                name="Diastólica"
                                stroke="#3b82f6" 
                                strokeWidth={2} 
                                dot={{ fill: '#3b82f6' }} 
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
