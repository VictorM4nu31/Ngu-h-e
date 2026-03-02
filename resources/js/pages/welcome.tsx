import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import { __ } from '@/lib/i18n';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Bienvenido - Ngu hñe" />
            <div className="min-h-screen bg-gradient-to-br from-ice via-cloud to-white dark:from-navy dark:via-gray-900 dark:to-gray-950">
                {/* Header */}
                <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 dark:bg-navy/80 dark:border-gray-800">
                    <div className="container mx-auto px-6 py-4">
                        <nav className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-digital to-mint">
                                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-lg font-semibold text-navy dark:text-white">Ngu hñe</h1>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Casa de la Medicina</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="rounded-lg bg-blue-digital px-5 py-2 text-sm font-medium text-white transition-all hover:bg-blue-600 hover:shadow-lg"
                                    >
                                        {__('Dashboard')}
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={login()}
                                            className="rounded-lg px-5 py-2 text-sm font-medium text-navy transition-all hover:bg-ice dark:text-white dark:hover:bg-gray-800"
                                        >
                                            {__('Log in')}
                                        </Link>
                                        {canRegister && (
                                            <Link
                                                href={register()}
                                                className="rounded-lg bg-blue-digital px-5 py-2 text-sm font-medium text-white transition-all hover:bg-blue-600 hover:shadow-lg"
                                            >
                                                {__('Register')}
                                            </Link>
                                        )}
                                    </>
                                )}
                            </div>
                        </nav>
                    </div>
                </header>

                {/* Hero Section */}
                <main className="container mx-auto px-6 pt-32 pb-20">
                    <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
                        {/* Left Content */}
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 rounded-full bg-mint/10 px-4 py-2 text-sm font-medium text-mint border border-mint/20">
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                {__('Intercultural Clinical Management System')}
                            </div>

                            <div className="space-y-4">
                                <h1 className="text-5xl font-bold text-navy dark:text-white lg:text-6xl">
                                    Ngu hñe
                                </h1>
                                <p className="text-2xl font-medium text-blue-digital">
                                    {__('House of Medicine')}
                                </p>
                                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {__('A restoration space that integrates modern medical knowledge with respect for the language and traditions of the Hñähñu region (Otomí of the Mezquital Valley, Hidalgo).')}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start gap-4 rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800/50">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-digital/10">
                                        <svg className="h-5 w-5 text-blue-digital" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-navy dark:text-white">{__('Comprehensive Management')}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {__('Complete administration of patients, medical appointments and consultations')}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800/50">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-mint/10">
                                        <svg className="h-5 w-5 text-mint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-navy dark:text-white">{__('Intercultural Care')}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {__('Respect and appreciation for the traditions and language of the community')}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800/50">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy/10">
                                        <svg className="h-5 w-5 text-navy dark:text-blue-digital" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-navy dark:text-white">{__('Safe and Reliable')}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {__('Data protection and privacy of medical information')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4">
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="inline-flex items-center gap-2 rounded-lg bg-blue-digital px-8 py-4 text-base font-semibold text-white transition-all hover:bg-blue-600 hover:shadow-xl"
                                    >
                                        {__('Go to system')}
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={login()}
                                            className="inline-flex items-center gap-2 rounded-lg bg-blue-digital px-8 py-4 text-base font-semibold text-white transition-all hover:bg-blue-600 hover:shadow-xl"
                                        >
                                            {__('Start now')}
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </Link>
                                        {canRegister && (
                                            <Link
                                                href={register()}
                                                className="inline-flex items-center gap-2 rounded-lg border-2 border-navy px-8 py-4 text-base font-semibold text-navy transition-all hover:bg-navy hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-navy"
                                            >
                                                {__('Create account')}
                                            </Link>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Right Content - Illustration */}
                        <div className="relative">
                            <div className="absolute -top-4 -left-4 h-72 w-72 rounded-full bg-blue-digital/20 blur-3xl"></div>
                            <div className="absolute -bottom-4 -right-4 h-72 w-72 rounded-full bg-mint/20 blur-3xl"></div>
                            <div className="relative rounded-2xl bg-gradient-to-br from-white to-ice p-12 shadow-2xl dark:from-gray-800 dark:to-gray-900">
                                {/* Medical Icon Illustration */}
                                <div className="flex flex-col items-center justify-center space-y-8">
                                    <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-blue-digital to-mint shadow-lg">
                                        <svg className="h-20 w-20 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </div>
                                    
                                    <div className="text-center space-y-4">
                                        <h3 className="text-2xl font-bold text-navy dark:text-white">
                                            {__('Comprehensive System')}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 max-w-sm">
                                            {__('Complete management of consultations, appointments, patients and medical prescriptions')}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-3 gap-6 w-full">
                                        <div className="flex flex-col items-center space-y-2">
                                            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-blue-digital/10">
                                                <svg className="h-8 w-8 text-blue-digital" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{__('Appointments')}</span>
                                        </div>

                                        <div className="flex flex-col items-center space-y-2">
                                            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-mint/10">
                                                <svg className="h-8 w-8 text-mint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{__('Prescriptions')}</span>
                                        </div>

                                        <div className="flex flex-col items-center space-y-2">
                                            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-navy/10">
                                                <svg className="h-8 w-8 text-navy dark:text-blue-digital" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                </svg>
                                            </div>
                                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{__('Reports')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="container mx-auto px-6 py-8 border-t border-gray-200 dark:border-gray-800">
                    <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                        <p>© 2026 Ngu hñe - {__('House of Medicine')}. {__('Intercultural clinical management system.')}</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
