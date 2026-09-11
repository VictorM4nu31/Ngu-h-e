import { Head, useForm, Link } from '@inertiajs/react';
import { Save, ArrowLeft, User } from 'lucide-react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { __ } from '@/lib/i18n';
import type { BreadcrumbItem } from '@/types';

interface Patient {
    id: number;
    full_name: string;
    document_id: string | null;
    birth_date: string | null;
    gender: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
}

interface Props {
    patient: Patient;
}

export default function Profile({ patient }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: __('Dashboard'), href: '/dashboard' },
        { title: __('My Profile'), href: '/my-profile' },
    ];

    const { data, setData, put, processing, errors } = useForm({
        phone: patient.phone || '',
        email: patient.email || '',
        birth_date: patient.birth_date ? patient.birth_date.slice(0, 10) : '',
        gender: patient.gender || '',
        address: patient.address || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/my-profile');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('My Profile')} />

            <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label={__('Back')}
                        >
                            <ArrowLeft className="size-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">{__('My Profile')}</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="size-5" />
                            {patient.full_name}
                        </CardTitle>
                        <CardDescription>
                            {__('Update your contact and personal data.')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="grid gap-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">{__('Phone')}</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) =>
                                            setData('phone', e.target.value)
                                        }
                                    />
                                    {errors.phone && (
                                        <p className="text-xs text-destructive">
                                            {errors.phone}
                                        </p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">{__('Email')}</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                    />
                                    {errors.email && (
                                        <p className="text-xs text-destructive">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="birth_date">
                                        {__('Birth Date')}
                                    </Label>
                                    <Input
                                        id="birth_date"
                                        type="date"
                                        value={data.birth_date}
                                        onChange={(e) =>
                                            setData(
                                                'birth_date',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    {errors.birth_date && (
                                        <p className="text-xs text-destructive">
                                            {errors.birth_date}
                                        </p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="gender">
                                        {__('Gender')}
                                    </Label>
                                    <Select
                                        value={data.gender}
                                        onValueChange={(val) =>
                                            setData('gender', val)
                                        }
                                    >
                                        <SelectTrigger id="gender">
                                            <SelectValue
                                                placeholder={__('Select...')}
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">
                                                {__('Male')}
                                            </SelectItem>
                                            <SelectItem value="female">
                                                {__('Female')}
                                            </SelectItem>
                                            <SelectItem value="other">
                                                {__('Other')}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.gender && (
                                        <p className="text-xs text-destructive">
                                            {errors.gender}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="address">{__('Address')}</Label>
                                <Input
                                    id="address"
                                    value={data.address}
                                    onChange={(e) =>
                                        setData('address', e.target.value)
                                    }
                                />
                                {errors.address && (
                                    <p className="text-xs text-destructive">
                                        {errors.address}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="flex items-center gap-2"
                                >
                                    <Save className="size-4" />
                                    {__('Save Changes')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
