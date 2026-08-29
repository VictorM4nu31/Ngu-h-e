import { Head, useForm } from '@inertiajs/react';
import { Clock } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { __ } from '@/lib/i18n';
import type { BreadcrumbItem } from '@/types';

interface Schedule {
    day_of_week: number;
    is_working: boolean;
    start_time: string;
    end_time: string;
}

interface Props {
    schedules: Schedule[];
}

const DAYS_OF_WEEK = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];

export default function DoctorSchedule({ schedules }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: __('Dashboard'), href: '/dashboard' },
        { title: __('My Schedule'), href: '/my-schedule' },
    ];

    const { data, setData, post, processing, errors } = useForm({
        schedules: schedules.map((s) => ({
            ...s,
            // Format time strings from DB (H:i:s) to input format (H:i)
            start_time: s.start_time?.substring(0, 5) || '09:00',
            end_time: s.end_time?.substring(0, 5) || '18:00',
        })),
    });

    const updateSchedule = (
        index: number,
        field: keyof Schedule,
        value: string | number | boolean,
    ) => {
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
            <Head title={__('Schedule Management')} />

            <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">
                            {__('My Schedule')}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {__(
                                'Set the days and hours you are available to receive appointments.',
                            )}
                        </p>
                    </div>
                    <Clock className="hidden size-8 text-primary/50 sm:block" />
                </div>

                <Card>
                    <form onSubmit={handleSubmit}>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                {__('Days of the Week')}
                            </CardTitle>
                            <CardDescription>
                                {__(
                                    'Activate the days you work and set the start and end time. Appointments will last 30 minutes within these ranges.',
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                {data.schedules.map((schedule, index) => (
                                    <div
                                        key={schedule.day_of_week}
                                        className={`flex flex-col justify-between rounded-lg border p-4 transition-colors sm:flex-row sm:items-center ${
                                            schedule.is_working
                                                ? 'border-primary/20 bg-background'
                                                : 'border-transparent bg-muted/50'
                                        }`}
                                    >
                                        <div className="mb-4 flex w-48 items-center gap-4 sm:mb-0">
                                            <Switch
                                                id={`day-${schedule.day_of_week}`}
                                                checked={schedule.is_working}
                                                onCheckedChange={(
                                                    checked: boolean,
                                                ) =>
                                                    updateSchedule(
                                                        index,
                                                        'is_working',
                                                        checked,
                                                    )
                                                }
                                            />
                                            <Label
                                                htmlFor={`day-${schedule.day_of_week}`}
                                                className={`cursor-pointer text-base font-medium ${
                                                    schedule.is_working
                                                        ? 'text-foreground'
                                                        : 'text-muted-foreground'
                                                }`}
                                            >
                                                {__(
                                                    DAYS_OF_WEEK[
                                                        schedule.day_of_week
                                                    ],
                                                )}
                                            </Label>
                                        </div>

                                        <div
                                            className={`grid flex-1 grid-cols-2 gap-4 ${!schedule.is_working && 'pointer-events-none opacity-50'}`}
                                        >
                                            <div className="grid gap-2">
                                                <Label className="hidden text-xs text-muted-foreground sm:block">
                                                    {__('Start Time')}
                                                </Label>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-8 text-xs text-muted-foreground sm:hidden">
                                                        {__('From:')}
                                                    </span>
                                                    <Input
                                                        type="time"
                                                        value={
                                                            schedule.start_time
                                                        }
                                                        onChange={(e) =>
                                                            updateSchedule(
                                                                index,
                                                                'start_time',
                                                                e.target.value,
                                                            )
                                                        }
                                                        required={
                                                            schedule.is_working
                                                        }
                                                    />
                                                </div>
                                                <InputError
                                                    message={
                                                        errors[
                                                            `schedules.${index}.start_time`
                                                        ]
                                                    }
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label className="hidden text-xs text-muted-foreground sm:block">
                                                    {__('End Time')}
                                                </Label>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-8 text-xs text-muted-foreground sm:hidden">
                                                        {__('To:')}
                                                    </span>
                                                    <Input
                                                        type="time"
                                                        value={
                                                            schedule.end_time
                                                        }
                                                        onChange={(e) =>
                                                            updateSchedule(
                                                                index,
                                                                'end_time',
                                                                e.target.value,
                                                            )
                                                        }
                                                        required={
                                                            schedule.is_working
                                                        }
                                                    />
                                                </div>
                                                <InputError
                                                    message={
                                                        errors[
                                                            `schedules.${index}.end_time`
                                                        ]
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {errors.schedules && (
                                <InputError message={errors.schedules} />
                            )}

                            <div className="flex justify-end border-t pt-4">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="min-w-[150px]"
                                >
                                    {processing && <Spinner className="mr-2" />}
                                    {__('Save Schedules')}
                                </Button>
                            </div>
                        </CardContent>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
