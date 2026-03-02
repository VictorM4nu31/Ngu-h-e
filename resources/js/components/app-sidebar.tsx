import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Users, Calendar, CreditCard, BarChart2, Stethoscope, FileText, UserCog, Clock } from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';
import { dashboard } from '@/routes';
import { __ } from '@/lib/i18n';

export function AppSidebar() {
    const { auth } = usePage().props as any;
    const userRoles = auth.user.roles?.map((r: any) => r.name) || [];

    // Definir los items dentro del componente para poder usar __()
    const mainNavItems: NavItem[] = [
        {
            title: __('Dashboard'),
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: __('Patients'),
            href: '/patients',
            icon: Users,
            roles: ['doctor', 'receptionist'],
        },
        {
            title: __('Appointments'),
            href: '/appointments',
            icon: Calendar,
            roles: ['doctor', 'receptionist'],
        },
        {
            title: __('Payments'),
            href: '/payments',
            icon: CreditCard,
            roles: ['admin', 'receptionist'],
        },
        {
            title: __('Reports'),
            href: '/reports',
            icon: BarChart2,
            roles: ['admin'],
        },
        {
            title: __('Staff Management'),
            href: '/staff',
            icon: UserCog,
            roles: ['admin'],
        },
        {
            title: __('My Schedule'),
            href: '/my-schedule',
            icon: Clock,
            roles: ['doctor'],
        },
        {
            title: __('Book Appointment'),
            href: '/book-appointment',
            icon: Calendar,
            roles: ['patient'],
        },
        {
            title: __('My Appointments'),
            href: '/my-appointments',
            icon: Stethoscope,
            roles: ['patient'],
        },
        {
            title: __('My Prescriptions'),
            href: '/my-prescriptions',
            icon: FileText,
            roles: ['patient'],
        },
    ];

    const filteredNavItems = mainNavItems.filter((item) => {
        if (!item.roles) return true;
        return item.roles.some((role) => userRoles.includes(role));
    });

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={filteredNavItems} />
            </SidebarContent>

            <SidebarFooter>
                
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
