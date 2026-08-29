import { Head, Link, router } from '@inertiajs/react';
import { Search, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, PaginationLink } from '@/types';

interface Patient {
    id: number;
    full_name: string;
    document_id: string;
    phone: string;
    email: string;
    birth_date: string;
}

interface Props {
    patients: {
        data: Patient[];
        links: PaginationLink[];
        current_page: number;
        last_page: number;
    };
    filters: {
        search: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Pacientes', href: '/patients' },
];

const decodeLabel = (label: string) =>
    label
        .replace(/&laquo;/g, '«')
        .replace(/&raquo;/g, '»')
        .replace(/&lsaquo;/g, '‹')
        .replace(/&rsaquo;/g, '›')
        .replace(/&nbsp;/g, ' ')
        .replace(/<[^>]*>/g, '');

export default function Index({ patients, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/patients', { search }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pacientes" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between gap-4">
                    <h1 className="text-2xl font-bold">Gestión de Pacientes</h1>
                    <Link href="/patients/create">
                        <Button className="flex items-center gap-2">
                            <Plus className="size-4" />
                            Nuevo Paciente
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader className="p-4 pb-0">
                        <form
                            onSubmit={handleSearch}
                            className="flex max-w-sm items-center gap-2"
                        >
                            <div className="relative flex-1">
                                <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Buscar por nombre, ID o teléfono..."
                                    className="pl-8"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Button type="submit" variant="secondary">
                                Buscar
                            </Button>
                        </form>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-muted/50 text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">
                                            Nombre Completo
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Identificación
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Teléfono
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {patients.data.length > 0 ? (
                                        patients.data.map((patient) => (
                                            <tr
                                                key={patient.id}
                                                className="transition-colors hover:bg-muted/50"
                                            >
                                                <td className="px-4 py-3 font-medium">
                                                    {patient.full_name}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {patient.document_id ||
                                                        'N/A'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {patient.phone || 'N/A'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            href={`/patients/${patient.id}`}
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                title="Ver Expediente"
                                                                aria-label="Ver registro"
                                                            >
                                                                <Eye className="size-4" />
                                                            </Button>
                                                        </Link>
                                                        <Link
                                                            href={`/patients/${patient.id}/edit`}
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                title="Editar"
                                                                aria-label="Editar"
                                                            >
                                                                <Edit className="size-4" />
                                                            </Button>
                                                        </Link>
                                                        <ConfirmDialog
                                                            title="Eliminar paciente"
                                                            description="¿Estás seguro de eliminar este paciente?"
                                                            confirmLabel="Eliminar"
                                                            onConfirm={() =>
                                                                router.delete(
                                                                    `/patients/${patient.id}`,
                                                                )
                                                            }
                                                            trigger={
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    title="Eliminar"
                                                                    aria-label="Eliminar"
                                                                    className="text-destructive hover:text-destructive"
                                                                >
                                                                    <Trash2 className="size-4" />
                                                                </Button>
                                                            }
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="px-4 py-8 text-center text-muted-foreground"
                                            >
                                                No se encontraron pacientes.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Simple Pagination */}
                {patients.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {patients.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url || '#'}
                                className={`rounded-md px-3 py-1 text-sm ${
                                    link.active
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted hover:bg-muted/80'
                                } ${!link.url && 'cursor-not-allowed opacity-50'}`}
                            >
                                {decodeLabel(link.label)}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
