import { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Save, ArrowLeft, User, Stethoscope, FileText, ChevronRight, ChevronLeft } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Pacientes', href: '/patients' },
    { title: 'Nuevo', href: '/patients/create' },
];

export default function Create() {
    const [activeTab, setActiveTab] = useState('personal');
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
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-6 bg-cloud border border-border h-auto p-1 rounded-lg">
                            <TabsTrigger value="personal" className="data-[state=active]:bg-navy data-[state=active]:text-white data-[state=active]:shadow-sm py-3 transition-all rounded-md">
                                <User className="size-4 mr-2" />
                                <span className="hidden sm:inline">1. Info Personal</span>
                                <span className="sm:hidden">1</span>
                            </TabsTrigger>
                            <TabsTrigger value="medical" className="data-[state=active]:bg-navy data-[state=active]:text-white data-[state=active]:shadow-sm py-3 transition-all rounded-md">
                                <Stethoscope className="size-4 mr-2" />
                                <span className="hidden sm:inline">2. Historial Médico</span>
                                <span className="sm:hidden">2</span>
                            </TabsTrigger>
                            <TabsTrigger value="notes" className="data-[state=active]:bg-navy data-[state=active]:text-white data-[state=active]:shadow-sm py-3 transition-all rounded-md">
                                <FileText className="size-4 mr-2" />
                                <span className="hidden sm:inline">3. Adicional</span>
                                <span className="sm:hidden">3</span>
                            </TabsTrigger>
                        </TabsList>

                        {/* --- TAB 1: PERSONAL --- */}
                        <TabsContent value="personal" className="focus-visible:outline-none focus-visible:ring-0">
                            <Card className="border-border bg-card shadow-sm">
                                <CardHeader className="border-b bg-muted/30 pb-4">
                                    <CardTitle className="text-navy flex items-center gap-2">
                                        <User className="size-5 text-blue-digital" />
                                        Información Personal
                                    </CardTitle>
                                    <CardDescription>Datos básicos y de contacto del paciente.</CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-6 pt-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="full_name">Nombre Completo <span className="text-destructive">*</span></Label>
                                        <Input
                                            id="full_name"
                                            value={data.full_name}
                                            onChange={(e) => setData('full_name', e.target.value)}
                                            className="focus-visible:ring-blue-digital"
                                        />
                                        {errors.full_name && <p className="text-xs text-destructive">{errors.full_name}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="document_id">Cédula / ID</Label>
                                            <Input
                                                id="document_id"
                                                value={data.document_id}
                                                onChange={(e) => setData('document_id', e.target.value)}
                                                className="focus-visible:ring-blue-digital"
                                            />
                                            {errors.document_id && <p className="text-xs text-destructive">{errors.document_id}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="gender">Género</Label>
                                            <Select onValueChange={(val) => setData('gender', val)} value={data.gender}>
                                                <SelectTrigger className="focus-visible:ring-blue-digital">
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

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="birth_date">Fecha de Nacimiento</Label>
                                            <Input
                                                id="birth_date"
                                                type="date"
                                                value={data.birth_date}
                                                onChange={(e) => setData('birth_date', e.target.value)}
                                                className="focus-visible:ring-blue-digital"
                                            />
                                            {errors.birth_date && <p className="text-xs text-destructive">{errors.birth_date}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="phone">Teléfono</Label>
                                            <Input
                                                id="phone"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                className="focus-visible:ring-blue-digital"
                                            />
                                            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Correo Electrónico</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className="focus-visible:ring-blue-digital"
                                            />
                                            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="address">Dirección</Label>
                                            <Input
                                                id="address"
                                                value={data.address}
                                                onChange={(e) => setData('address', e.target.value)}
                                                className="focus-visible:ring-blue-digital"
                                            />
                                            {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex justify-end mt-6">
                                <Button type="button" onClick={() => setActiveTab('medical')} className="flex items-center gap-2 bg-blue-digital hover:bg-blue-digital/90 text-white">
                                    Siguiente <ChevronRight className="size-4" />
                                </Button>
                            </div>
                        </TabsContent>

                        {/* --- TAB 2: MEDICAL --- */}
                        <TabsContent value="medical" className="focus-visible:outline-none focus-visible:ring-0">
                            <Card className="border-border bg-card shadow-sm">
                                <CardHeader className="border-b bg-muted/30 pb-4">
                                    <CardTitle className="text-navy flex items-center gap-2">
                                        <Stethoscope className="size-5 text-mint" />
                                        Información Médica Base
                                    </CardTitle>
                                    <CardDescription>Antecedentes y condiciones críticas relevantes.</CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-6 pt-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="allergies">Alergias Conocidas</Label>
                                        <textarea
                                            id="allergies"
                                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-digital focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-shadow"
                                            value={data.allergies}
                                            onChange={(e) => setData('allergies', e.target.value)}
                                            placeholder="Ej. Penicilina, Polen... (Deje en blanco si no tiene)"
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="chronic_diseases">Enfermedades Crónicas</Label>
                                        <textarea
                                            id="chronic_diseases"
                                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-digital focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-shadow"
                                            value={data.chronic_diseases}
                                            onChange={(e) => setData('chronic_diseases', e.target.value)}
                                            placeholder="Ej. Diabetes, Hipertensión..."
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="medical_antecedents">Antecedentes Familiares / Personales</Label>
                                        <textarea
                                            id="medical_antecedents"
                                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-digital focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-shadow"
                                            value={data.medical_antecedents}
                                            onChange={(e) => setData('medical_antecedents', e.target.value)}
                                            placeholder="Detalles sobre historial familiar importante..."
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex justify-between mt-6">
                                <Button type="button" variant="outline" onClick={() => setActiveTab('personal')} className="flex items-center gap-2 border-border text-foreground hover:bg-muted">
                                    <ChevronLeft className="size-4" /> Anterior
                                </Button>
                                <Button type="button" onClick={() => setActiveTab('notes')} className="flex items-center gap-2 bg-blue-digital hover:bg-blue-digital/90 text-white">
                                    Siguiente <ChevronRight className="size-4" />
                                </Button>
                            </div>
                        </TabsContent>

                        {/* --- TAB 3: NOTES & SUBMIT --- */}
                        <TabsContent value="notes" className="focus-visible:outline-none focus-visible:ring-0">
                            <Card className="border-border bg-card shadow-sm">
                                <CardHeader className="border-b bg-muted/30 pb-4">
                                    <CardTitle className="text-navy flex items-center gap-2">
                                        <FileText className="size-5 text-warning" />
                                        Notas Adicionales
                                    </CardTitle>
                                    <CardDescription>Tratamientos actuales y observaciones internas.</CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-6 pt-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="current_medication">Medicación Actual</Label>
                                        <Input
                                            id="current_medication"
                                            value={data.current_medication}
                                            onChange={(e) => setData('current_medication', e.target.value)}
                                            className="focus-visible:ring-blue-digital"
                                            placeholder="Ej. Losartán 50mg diario"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="notes">Notas Internas de Clínica (Privadas)</Label>
                                        <textarea
                                            id="notes"
                                            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-digital focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-shadow"
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            placeholder="Cualquier información relevante para el equipo de recepción o médicos..."
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex justify-between items-center mt-6">
                                <Button type="button" variant="outline" onClick={() => setActiveTab('medical')} className="flex items-center gap-2 border-border text-foreground hover:bg-muted">
                                    <ChevronLeft className="size-4" /> Anterior
                                </Button>
                                <div className="flex items-center gap-3">
                                    <Link href="/patients">
                                        <Button variant="ghost" type="button" className="text-slate-500 hover:text-slate-700">Cancelar</Button>
                                    </Link>
                                    <Button type="submit" disabled={processing} className="flex items-center gap-2 bg-success hover:bg-success/90 text-white font-medium shadow-md">
                                        <Save className="size-4" />
                                        Finalizar y Guardar
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
