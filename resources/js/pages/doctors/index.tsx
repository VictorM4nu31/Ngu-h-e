import { Head, Link, router } from '@inertiajs/react';
import { Plus, Trash2, UserCog, Stethoscope, Pencil } from 'lucide-react';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { __ } from '@/lib/i18n';
import type { BreadcrumbItem, PaginationLink } from '@/types';

interface StaffMember {
    id: number;
    name: string;
    email: string;
    roles: { name: string }[];
}

interface Props {
    staff: {
        data: StaffMember[];
        links: PaginationLink[];
        current_page?: number;
        last_page?: number;
    };
}

const decodeLabel = (label: string) =>
    label
        .replace(/&laquo;/g, '«')
        .replace(/&raquo;/g, '»')
        .replace(/&lsaquo;/g, '‹')
        .replace(/&rsaquo;/g, '›');

export default function Index({ staff }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: __('Dashboard'), href: '/dashboard' },
        { title: __('Staff Management'), href: '/staff' },
    ];

    const handleDelete = (id: number) => {
        router.delete(`/staff/${id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={__('Staff Management')} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between gap-4">
                    <h1 className="text-2xl font-bold">
                        {__('Staff Management')}
                    </h1>
                    <Link href="/staff/create">
                        <Button className="flex items-center gap-2">
                            <Plus className="size-4" />
                            {__('New Member')}
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">
                            {__('Doctors and Administrative Staff')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-muted/50 text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">
                                            {__('Name')}
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            {__('Email')}
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            {__('Role')}
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            {__('Actions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {staff.data.length > 0 ? (
                                        staff.data.map((member) => (
                                            <tr
                                                key={member.id}
                                                className="transition-colors hover:bg-muted/50"
                                            >
                                                <td className="px-4 py-3 font-medium">
                                                    {member.name}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {member.email}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1.5 capitalize">
                                                        {member.roles?.[0]
                                                            ?.name ===
                                                        'doctor' ? (
                                                            <>
                                                                <Stethoscope className="size-3.5 text-blue-500" />
                                                                {__('Doctor')}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <UserCog className="size-3.5 text-orange-500" />
                                                                {__(
                                                                    'Receptionist',
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1">
                                                        <Link
                                                            href={`/staff/${member.id}/edit`}
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                aria-label={__(
                                                                    'Edit',
                                                                )}
                                                                className="text-muted-foreground hover:text-primary"
                                                            >
                                                                <Pencil className="size-4" />
                                                            </Button>
                                                        </Link>
                                                        <ConfirmDialog
                                                            title={__(
                                                                'Delete member',
                                                            )}
                                                            description={__(
                                                                'Are you sure you want to delete this staff member?',
                                                            )}
                                                            confirmLabel={__(
                                                                'Delete',
                                                            )}
                                                            onConfirm={() =>
                                                                handleDelete(
                                                                    member.id,
                                                                )
                                                            }
                                                            trigger={
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    aria-label={__(
                                                                        'Delete',
                                                                    )}
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
                                                {__('No staff registered.')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {staff.last_page && staff.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {staff.links.map((link, i) => (
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
