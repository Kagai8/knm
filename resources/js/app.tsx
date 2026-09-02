/* eslint-disable import/order */
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import type { ReactNode } from 'react';
import { Toaster } from '@/knm/shared/ui';
import { TooltipProvider } from '@/components/ui/tooltip';

// KNM Layouts
import PrivateLayout from '@/knm/private/layouts/PrivateLayout';
import PublicLayout from '@/knm/public/layouts/PublicLayout';

// Starter kit layouts (used by /settings/* routes)
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';

const appName = import.meta.env.VITE_APP_NAME || 'K&A Advocates';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,

    resolve: (name) => {
        const pages = import.meta.glob('./knm/**/*.tsx');

        return resolvePageComponent(`./knm/${name}.tsx`, pages).then((module: any) => {
            const page = module.default;

            if (page && page.layout === undefined) {
                if (name.startsWith('private/auth/')) {
                    page.layout = null;
                } else if (name.startsWith('private/')) {
                    page.layout = (children: ReactNode) => <PrivateLayout>{children}</PrivateLayout>;
                } else if (name.startsWith('public/auth/')) {
                    page.layout = null;
                } else if (name.startsWith('public/')) {
                    page.layout = (children: ReactNode) => <PublicLayout>{children}</PublicLayout>;
                } else if (name.startsWith('auth/')) {
                    page.layout = (children: ReactNode) => <AuthLayout>{children}</AuthLayout>;
                } else if (name.startsWith('settings/')) {
                    page.layout = (children: ReactNode) => (
                        <AppLayout>
                            <SettingsLayout>{children}</SettingsLayout>
                        </AppLayout>
                    );
                } else {
                    page.layout = (children: ReactNode) => <AppLayout>{children}</AppLayout>;
                }
            }

            return module;
        });
    },

    strictMode: true,

    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <TooltipProvider delayDuration={0}>
                <App {...props} />
                <Toaster />
            </TooltipProvider>,
        );
    },

    progress: {
        color: '#D4AF37',
    },
});
