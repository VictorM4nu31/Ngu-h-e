import { Head, useForm, Link } from '@inertiajs/react';
import {
    Save,
    ArrowLeft,
    User,
    Stethoscope,
    FileText,
    ChevronRight,
    ChevronLeft,
} from 'lucide-react';
import { useState } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { __ } from '@/lib/i18n';
import type { BreadcrumbItem } from '@/types';

export default function Create() {
    const [activeTab, setActiveTab] = useState('personal');
    const breadcrumbs: BreadcrumbItem[] = [
        { title: __('Dashboard'), href: '/dashboard' },
        { title: __('Patients'), href: '/patients' },
        { title: __('New'), href: '/patients/create' },
    ];

    const { data, setData, post, processing, errors } = useForm({
        full_name: '',
        document_id: '',
        birth_date: '',
        gender: null as string | null,
        phone: '',
        email: '',
        address: '',
        medical_antecedents: '',
        allergies: '',
        chronic_diseases: '',
        current_medication: '',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/patients');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('New Patient')} />

            <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4">
                <div className="flex items-center gap-4">
                    <Link href="/patients">
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label={__('Back')}
                        >
                            <ArrowLeft className="size-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">
                        {__('Register New Patient')}
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-6">
                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="w-full"
                    >
                        <TabsList className="mb-6 grid h-auto w-full grid-cols-3 rounded-lg border border-border bg-cloud p-1">
                            <TabsTrigger
                                value="personal"
                                className="rounded-md py-3 transition-all data-[state=active]:bg-navy data-[state=active]:text-white data-[state=active]:shadow-sm"
                            >
                                <User className="mr-2 size-4" />
                                <span className="hidden sm:inline">
                                    {__('1. Personal Info')}
                                </span>
                                <span className="sm:hidden">1</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="medical"
                                className="rounded-md py-3 transition-all data-[state=active]:bg-navy data-[state=active]:text-white data-[state=active]:shadow-sm"
                            >
                                <Stethoscope className="mr-2 size-4" />
                                <span className="hidden sm:inline">
                                    {__('2. Medical History')}
                                </span>
                                <span className="sm:hidden">2</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="notes"
                                className="rounded-md py-3 transition-all data-[state=active]:bg-navy data-[state=active]:text-white data-[state=active]:shadow-sm"
                            >
                                <FileText className="mr-2 size-4" />
                                <span className="hidden sm:inline">
                                    {__('3. Additional')}
                                </span>
                                <span className="sm:hidden">3</span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent
                            value="personal"
                            className="focus-visible:ring-0 focus-visible:outline-none"
                        >
                            <Card className="border-border bg-card shadow-sm">
                                <CardHeader className="border-b bg-muted/30 pb-4">
                                    <CardTitle className="flex items-center gap-2 text-navy">
                                        <User className="size-5 text-blue-digital" />
                                        {__('Personal Information')}
                                    </CardTitle>
                                    <CardDescription>
                                        {__(
                                            'Basic data and contact info of the patient.',
                                        )}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-6 pt-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="full_name">
                                            {__('Full Name')}{' '}
                                            <span className="text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="full_name"
                                            value={data.full_name}
                                            onChange={(e) =>
                                                setData(
                                                    'full_name',
                                                    e.target.value,
                                                )
                                            }
                                            className="focus-visible:ring-blue-digital"
                                        />
                                        {errors.full_name && (
                                            <p className="text-xs text-destructive">
                                                {errors.full_name}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="document_id">
                                                {__('Document / ID')}
                                            </Label>
                                            <Input
                                                id="document_id"
                                                value={data.document_id}
                                                onChange={(e) =>
                                                    setData(
                                                        'document_id',
                                                        e.target.value,
                                                    )
                                                }
                                                className="focus-visible:ring-blue-digital"
                                            />
                                            {errors.document_id && (
                                                <p className="text-xs text-destructive">
                                                    {errors.document_id}
                                                </p>
                                            )}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="gender">
                                                {__('Gender')}
                                            </Label>
                                            <Select
                                                onValueChange={(val) =>
                                                    setData('gender', val)
                                                }
                                                value={data.gender ?? undefined}
                                            >
                                                <SelectTrigger className="focus-visible:ring-blue-digital">
                                                    <SelectValue
                                                        placeholder={__(
                                                            'Select...',
                                                        )}
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

                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                                                className="focus-visible:ring-blue-digital"
                                            />
                                            {errors.birth_date && (
                                                <p className="text-xs text-destructive">
                                                    {errors.birth_date}
                                                </p>
                                            )}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="phone">
                                                {__('Phone')}
                                            </Label>
                                            <Input
                                                id="phone"
                                                value={data.phone}
                                                onChange={(e) =>
                                                    setData(
                                                        'phone',
                                                        e.target.value,
                                                    )
                                                }
                                                className="focus-visible:ring-blue-digital"
                                            />
                                            {errors.phone && (
                                                <p className="text-xs text-destructive">
                                                    {errors.phone}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="email">
                                                {__('Email')}
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) =>
                                                    setData(
                                                        'email',
                                                        e.target.value,
                                                    )
                                                }
                                                className="focus-visible:ring-blue-digital"
                                            />
                                            {errors.email && (
                                                <p className="text-xs text-destructive">
                                                    {errors.email}
                                                </p>
                                            )}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="address">
                                                {__('Address')}
                                            </Label>
                                            <Input
                                                id="address"
                                                value={data.address}
                                                onChange={(e) =>
                                                    setData(
                                                        'address',
                                                        e.target.value,
                                                    )
                                                }
                                                className="focus-visible:ring-blue-digital"
                                            />
                                            {errors.address && (
                                                <p className="text-xs text-destructive">
                                                    {errors.address}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="mt-6 flex justify-end">
                                <Button
                                    type="button"
                                    onClick={() => setActiveTab('medical')}
                                    className="flex items-center gap-2 bg-blue-digital text-white hover:bg-blue-digital/90"
                                >
                                    {__('Next')}{' '}
                                    <ChevronRight className="size-4" />
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent
                            value="medical"
                            className="focus-visible:ring-0 focus-visible:outline-none"
                        >
                            <Card className="border-border bg-card shadow-sm">
                                <CardHeader className="border-b bg-muted/30 pb-4">
                                    <CardTitle className="flex items-center gap-2 text-navy">
                                        <Stethoscope className="size-5 text-mint" />
                                        {__('Basic Medical Information')}
                                    </CardTitle>
                                    <CardDescription>
                                        {__(
                                            'Background and critical relevant conditions.',
                                        )}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-6 pt-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="allergies">
                                            {__('Known Allergies')}
                                        </Label>
                                        <Textarea
                                            id="allergies"
                                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-blue-digital focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                            value={data.allergies}
                                            onChange={(e) =>
                                                setData(
                                                    'allergies',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder={__(
                                                'E.g. Penicillin, Pollen... (Leave blank if none)',
                                            )}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="chronic_diseases">
                                            {__('Chronic Diseases')}
                                        </Label>
                                        <Textarea
                                            id="chronic_diseases"
                                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-blue-digital focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                            value={data.chronic_diseases}
                                            onChange={(e) =>
                                                setData(
                                                    'chronic_diseases',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder={__(
                                                'E.g. Diabetes, Hypertension...',
                                            )}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="medical_antecedents">
                                            {__('Family / Personal History')}
                                        </Label>
                                        <Textarea
                                            id="medical_antecedents"
                                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-blue-digital focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                            value={data.medical_antecedents}
                                            onChange={(e) =>
                                                setData(
                                                    'medical_antecedents',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder={__(
                                                'Details about important family history...',
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="mt-6 flex justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setActiveTab('personal')}
                                    className="flex items-center gap-2 border-border text-foreground hover:bg-muted"
                                >
                                    <ChevronLeft className="size-4" />{' '}
                                    {__('Previous')}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => setActiveTab('notes')}
                                    className="flex items-center gap-2 bg-blue-digital text-white hover:bg-blue-digital/90"
                                >
                                    {__('Next')}{' '}
                                    <ChevronRight className="size-4" />
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent
                            value="notes"
                            className="focus-visible:ring-0 focus-visible:outline-none"
                        >
                            <Card className="border-border bg-card shadow-sm">
                                <CardHeader className="border-b bg-muted/30 pb-4">
                                    <CardTitle className="flex items-center gap-2 text-navy">
                                        <FileText className="size-5 text-warning" />
                                        {__('Additional Notes')}
                                    </CardTitle>
                                    <CardDescription>
                                        {__(
                                            'Current treatments and internal observations.',
                                        )}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-6 pt-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="current_medication">
                                            {__('Current Medication')}
                                        </Label>
                                        <Input
                                            id="current_medication"
                                            value={data.current_medication}
                                            onChange={(e) =>
                                                setData(
                                                    'current_medication',
                                                    e.target.value,
                                                )
                                            }
                                            className="focus-visible:ring-blue-digital"
                                            placeholder={__(
                                                'E.g. Losartan 50mg daily',
                                            )}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="notes">
                                            {__(
                                                'Internal Clinical Notes (Private)',
                                            )}
                                        </Label>
                                        <Textarea
                                            id="notes"
                                            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-blue-digital focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                            value={data.notes}
                                            onChange={(e) =>
                                                setData('notes', e.target.value)
                                            }
                                            placeholder={__(
                                                'Any relevant information for the reception or medical team...',
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="mt-6 flex items-center justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setActiveTab('medical')}
                                    className="flex items-center gap-2 border-border text-foreground hover:bg-muted"
                                >
                                    <ChevronLeft className="size-4" />{' '}
                                    {__('Previous')}
                                </Button>
                                <div className="flex items-center gap-3">
                                    <Link href="/patients">
                                        <Button
                                            variant="ghost"
                                            type="button"
                                            className="text-slate-500 hover:text-slate-700"
                                        >
                                            {__('Cancel')}
                                        </Button>
                                    </Link>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="flex items-center gap-2 bg-success font-medium text-white shadow-md hover:bg-success/90"
                                    >
                                        <Save className="size-4" />
                                        {__('Finish and Save')}
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </form>
            </div>
        </AppLayout>
    );
}
