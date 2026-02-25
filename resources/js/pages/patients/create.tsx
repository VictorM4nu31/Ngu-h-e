import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Save, ArrowLeft } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Pacientes', href: '/patients' },
    { title: 'Nuevo', href: '/patients/create' },
];

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        full_name: '',
        document_id: '',
        birth_date: '',
        gender: '',
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
            <Head title="Nuevo Paciente" />

            <div className="flex flex-col gap-6 p-4 max-w-5xl mx-auto w-full">
                <div className="flex items-center gap-4">
                    <Link href="/patients">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="size-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">Registrar Nuevo Paciente</h1>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Información Personal */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Información Personal</CardTitle>
                                <CardDescription>Datos básicos y de contacto del paciente.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="full_name">Nombre Completo *</Label>
                                    <Input
                                        id="full_name"
                                        value={data.full_name}
                                        onChange={(e) => setData('full_name', e.target.value)}
                                        required
                                    />
                                    {errors.full_name && <p className="text-xs text-destructive">{errors.full_name}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="document_id">Cédula / ID</Label>
                                        <Input
                                            id="document_id"
                                            value={data.document_id}
                                            onChange={(e) => setData('document_id', e.target.value)}
                                        />
                                        {errors.document_id && <p className="text-xs text-destructive">{errors.document_id}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="gender">Género</Label>
                                        <Select onValueChange={(val) => setData('gender', val)} value={data.gender}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="male">Masculino</SelectItem>
                                                <SelectItem value="female">Femenino</SelectItem>
                                                <SelectItem value="other">Otro</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.gender && <p className="text-xs text-destructive">{errors.gender}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="birth_date">Fecha de Nacimiento</Label>
                                        <Input
                                            id="birth_date"
                                            type="date"
                                            value={data.birth_date}
                                            onChange={(e) => setData('birth_date', e.target.value)}
                                        />
                                        {errors.birth_date && <p className="text-xs text-destructive">{errors.birth_date}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="phone">Teléfono</Label>
                                        <Input
                                            id="phone"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                        />
                                        {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Correo Electrónico</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="address">Dirección</Label>
                                    <Input
                                        id="address"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                    />
                                    {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Información Médica */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Información Médica Base</CardTitle>
                                <CardDescription>Antecedentes y condiciones críticas.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="allergies">Alergias</Label>
                                    <textarea
                                        id="allergies"
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={data.allergies}
                                        onChange={(e) => setData('allergies', e.target.value)}
                                        placeholder="Ej. Penicilina, Polem..."
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="chronic_diseases">Enfermedades Crónicas</Label>
                                    <textarea
                                        id="chronic_diseases"
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={data.chronic_diseases}
                                        onChange={(e) => setData('chronic_diseases', e.target.value)}
                                        placeholder="Ej. Diabetes, Hipertensión..."
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="medical_antecedents">Antecedentes Familiares / Personales</Label>
                                    <textarea
                                        id="medical_antecedents"
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={data.medical_antecedents}
                                        onChange={(e) => setData('medical_antecedents', e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Notas Adicionales</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="current_medication">Medicación Actual</Label>
                                <Input
                                    id="current_medication"
                                    value={data.current_medication}
                                    onChange={(e) => setData('current_medication', e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="notes">Notas Internas</Label>
                                <textarea
                                    id="notes"
                                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Link href="/patients">
                            <Button variant="outline" type="button">Cancelar</Button>
                        </Link>
                        <Button type="submit" disabled={processing} className="flex items-center gap-2">
                            <Save className="size-4" />
                            Guardar Paciente
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
