import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, LayoutGrid, LogIn, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import { __ } from '@/lib/i18n';
import { dashboard, login } from '@/routes';
import type { BreadcrumbItem, PageProps } from '@/types';

interface ErrorPageProps {
    code: string;
    title: string;
    message: string;
}

/**
 * Shared error page for HTTP errors that can happen to guests and
 * authenticated users alike (401, 404, 419, 429, 500, 503...).
 * Authenticated users get the app sidebar; guests get the auth layout.
 */
export default function ErrorPage({ code, title, message }: ErrorPageProps) {
    const { auth } = usePage<PageProps>().props;
    // NOTE: error responses (e.g. 404 on unknown URLs) may not pass through
    // the Inertia middleware, so shared props can be missing entirely.
    const isGuest = auth?.user == null;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: __('Dashboard'), href: '/dashboard' },
        { title: code, href: '#' },
    ];

    const content = (
        <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 p-4 py-16 text-center">
            <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4">
                <ShieldAlert className="size-10 text-destructive" />
            </div>
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">{code}</CardTitle>
                    <CardDescription className="text-base">
                        {__(message)}
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
                    {isGuest ? (
                        <Link href={login()}>
                            <Button className="gap-1.5">
                                <LogIn className="size-4" />
                                {__('Log in')}
                            </Button>
                        </Link>
                    ) : (
                        <Link href={dashboard()}>
                            <Button className="gap-1.5">
                                <LayoutGrid className="size-4" />
                                {__('Back to dashboard')}
                            </Button>
                        </Link>
                    )}
                </CardContent>
            </Card>
        </div>
    );

    if (isGuest) {
        return (
            <AuthLayout title={__(title)} description={__(message)}>
                <Head title={code} />
                {content}
            </AuthLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={code} />
            {content}
        </AppLayout>
    );
}
