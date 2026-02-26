import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Users, Calendar, CreditCard, BarChart2, Stethoscope, FileText, UserCog } from 'lucide-react';
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

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Pacientes',
        href: '/patients',
        icon: Users,
        roles: ['doctor', 'receptionist'],
    },
    {
        title: 'Agenda de Citas',
        href: '/appointments',
        icon: Calendar,
        roles: ['doctor', 'receptionist', 'patient'],
    },
    {
        title: 'Control de Pagos',
        href: '/payments',
        icon: CreditCard,
        roles: ['admin', 'receptionist'],
    },
    {
        title: 'Reportes',
        href: '/reports',
        icon: BarChart2,
        roles: ['admin'],
    },
    {
        title: 'Gestión de Personal',
        href: '/staff',
        icon: UserCog,
        roles: ['admin'],
    },
    {
        title: 'Mis Citas',
        href: '/my-appointments',
        icon: Stethoscope,
        roles: ['patient'],
    },
    {
        title: 'Mis Recetas',
        href: '/my-prescriptions',
        icon: FileText,
        roles: ['patient'],
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props as any;
    const userRoles = auth.user.roles?.map((r: any) => r.name) || [];

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
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
