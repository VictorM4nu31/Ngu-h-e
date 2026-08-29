import { Head, useForm, Link } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import AppLayout from '@/layouts/app-layout';
import { __ } from '@/lib/i18n';
import type { BreadcrumbItem } from '@/types';

interface Props {
    member: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
}

export default function Edit({ member }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: __('Dashboard'), href: '/dashboard' },
        { title: __('Staff Management'), href: '/staff' },
        { title: __('Edit'), href: `/staff/${member.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: member.name,
        email: member.email,
        password: '',
        password_confirmation: '',
        role: member.role,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/staff/${member.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('Edit Staff')} />

            <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4">
                <div className="flex items-center gap-2">
                    <Link href="/staff">
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label={__('Back')}
                        >
                            <ChevronLeft className="size-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">{__('Edit Staff')}</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{__('Staff Data')}</CardTitle>
                        <CardDescription>
                            {__(
                                'Update the staff member information. Leave the password empty to keep it.',
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">{__('Full Name')}</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    required
                                />
                                <InputError message={errors.name} />
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
                                    required
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="role">
                                    {__('Role in the System')}
                                </Label>
                                <Select
                                    value={data.role}
                                    onValueChange={(val) =>
                                        setData('role', val)
                                    }
                                >
                                    <SelectTrigger id="role">
                                        <SelectValue
                                            placeholder={__('Select...')}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="doctor">
                                            {__('Doctor')}
                                        </SelectItem>
                                        <SelectItem value="receptionist">
                                            {__('Receptionist')}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.role} />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="password">
                                        {__('New Password')}
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) =>
                                            setData('password', e.target.value)
                                        }
                                        placeholder={__(
                                            'Leave empty to keep it',
                                        )}
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">
                                        {__('Confirm New Password')}
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) =>
                                            setData(
                                                'password_confirmation',
                                                e.target.value,
                                            )
                                        }
                                        placeholder={__('Confirm password')}
                                    />
                                    <InputError
                                        message={errors.password_confirmation}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing && <Spinner className="mr-2" />}
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
