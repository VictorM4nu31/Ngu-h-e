import { Head, Link } from '@inertiajs/react';
import { ShieldAlert, ArrowLeft, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { __ } from '@/lib/i18n';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

export default function Forbidden() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: __('Dashboard'), href: '/dashboard' },
        { title: '403', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="403" />

            <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 p-4 py-16 text-center">
                <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4">
                    <ShieldAlert className="size-10 text-destructive" />
                </div>
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold">
                            403
                        </CardTitle>
                        <CardDescription className="text-base">
                            {__(
                                'You do not have permission to access this page.',
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Button
                            variant="outline"
                            onClick={() => window.history.back()}
                            className="gap-1.5"
                        >
                            <ArrowLeft className="size-4" />
                            {__('Go back')}
                        </Button>
                        <Link href={dashboard()}>
                            <Button className="gap-1.5">
                                <LayoutGrid className="size-4" />
                                {__('Back to dashboard')}
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
