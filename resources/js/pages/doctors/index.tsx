import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Plus, Trash2, UserCog, ShieldCheck, Stethoscope, Pencil } from 'lucide-react';

interface StaffMember {
    id: number;
    name: string;
    email: string;
    roles: { name: string }[];
}

interface Props {
    staff: StaffMember[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Gestión de Personal', href: '/staff' },
];

export default function Index({ staff }: Props) {
    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de eliminar a este miembro del personal?')) {
            router.delete(`/staff/${id}`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestión de Personal" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between gap-4">
                    <h1 className="text-2xl font-bold">Gestión de Personal</h1>
                    <Link href="/staff/create">
                        <Button className="flex items-center gap-2">
                            <Plus className="size-4" />
                            Nuevo Miembro
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Médicos y Administrativos</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-muted/50 text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Nombre</th>
                                        <th className="px-4 py-3 font-medium">Email</th>
                                        <th className="px-4 py-3 font-medium">Rol</th>
                                        <th className="px-4 py-3 font-medium">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {staff.length > 0 ? (
                                        staff.map((member) => (
                                            <tr key={member.id} className="hover:bg-muted/50 transition-colors">
                                                <td className="px-4 py-3 font-medium">{member.name}</td>
                                                <td className="px-4 py-3">{member.email}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1.5 capitalize">
                                                        {member.roles?.[0]?.name === 'doctor' ? (
                                                            <>
                                                                <Stethoscope className="size-3.5 text-blue-500" />
                                                                Doctor
                                                            </>
                                                        ) : (
                                                            <>
                                                                <UserCog className="size-3.5 text-orange-500" />
                                                                Recepcionista
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1">
                                                        <Link href={`/staff/${member.id}/edit`}>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon"
                                                                className="text-muted-foreground hover:text-primary"
                                                            >
                                                                <Pencil className="size-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="text-destructive hover:text-destructive"
                                                            onClick={() => handleDelete(member.id)}
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                                No hay personal registrado.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
