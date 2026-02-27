import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';
import { Clock } from 'lucide-react';

interface Schedule {
    day_of_week: number;
    is_working: boolean;
    start_time: string;
    end_time: string;
}

interface Props {
    schedules: Schedule[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Mis Horarios', href: '/my-schedule' },
];

const DAYS_OF_WEEK = [
    'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
];

export default function DoctorSchedule({ schedules }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        schedules: schedules.map(s => ({
            ...s,
            // Format time strings from DB (H:i:s) to input format (H:i)
            start_time: s.start_time?.substring(0, 5) || '09:00',
            end_time: s.end_time?.substring(0, 5) || '18:00',
        }))
    });

    const updateSchedule = (index: number, field: keyof Schedule, value: any) => {
        const newSchedules = [...data.schedules];
        newSchedules[index] = { ...newSchedules[index], [field]: value };
        setData('schedules', newSchedules);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/my-schedule');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Horarios" />

            <div className="flex flex-col gap-6 p-4 max-w-4xl mx-auto w-full">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Mis Horarios de Atención</h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Configura los días y horas en los que estás disponible para recibir citas.
                        </p>
                    </div>
                    <Clock className="size-8 text-primary/50 hidden sm:block" />
                </div>

                <Card>
                    <form onSubmit={handleSubmit}>
                        <CardHeader>
                            <CardTitle className="text-lg">Días de la Semana</CardTitle>
                            <CardDescription>
                                Activa los días que trabajas e indica el horario de inicio y fin. 
                                Las citas tendrán una duración de 30 minutos dentro de estos rangos.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                {data.schedules.map((schedule, index) => (
                                    <div 
                                        key={schedule.day_of_week} 
                                        className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border transition-colors ${
                                            schedule.is_working ? 'bg-background border-primary/20' : 'bg-muted/50 border-transparent'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4 mb-4 sm:mb-0 w-48">
                                            <Switch
                                                id={`day-${schedule.day_of_week}`}
                                                checked={schedule.is_working}
                                                onCheckedChange={(checked: boolean) => updateSchedule(index, 'is_working', checked)}
                                            />
                                            <Label 
                                                htmlFor={`day-${schedule.day_of_week}`} 
                                                className={`text-base font-medium cursor-pointer ${
                                                    schedule.is_working ? 'text-foreground' : 'text-muted-foreground'
                                                }`}
                                            >
                                                {DAYS_OF_WEEK[schedule.day_of_week]}
                                            </Label>
                                        </div>

                                        <div className={`grid grid-cols-2 gap-4 flex-1 ${!schedule.is_working && 'opacity-50 pointer-events-none'}`}>
                                            <div className="grid gap-2">
                                                <Label className="text-xs text-muted-foreground hidden sm:block">Hora de Inicio</Label>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-muted-foreground sm:hidden w-8">De:</span>
                                                    <Input
                                                        type="time"
                                                        value={schedule.start_time}
                                                        onChange={(e) => updateSchedule(index, 'start_time', e.target.value)}
                                                        required={schedule.is_working}
                                                    />
                                                </div>
                                                <InputError message={errors[`schedules.${index}.start_time`]} />
                                            </div>
                                            
                                            <div className="grid gap-2">
                                                <Label className="text-xs text-muted-foreground hidden sm:block">Hora de Fin</Label>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-muted-foreground sm:hidden w-8">A:</span>
                                                    <Input
                                                        type="time"
                                                        value={schedule.end_time}
                                                        onChange={(e) => updateSchedule(index, 'end_time', e.target.value)}
                                                        required={schedule.is_working}
                                                    />
                                                </div>
                                                <InputError message={errors[`schedules.${index}.end_time`]} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {errors.schedules && <InputError message={errors.schedules} />}

                            <div className="flex justify-end pt-4 border-t">
                                <Button type="submit" disabled={processing} className="min-w-[150px]">
                                    {processing && <Spinner className="mr-2" />}
                                    Guardar Horarios
                                </Button>
                            </div>
                        </CardContent>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
