import React from 'react';
import { QueryProvider } from './QueryProvider';
import { StoreProvider } from './StoreProvider';
import { ThemeProvider } from './ThemeProvider';
import { AuthBootstrap } from './AuthBootstrap';
import { Toaster } from '@/components/ui/toaster';

export const AppProviders = ({ children }: { children: React.ReactNode }) => (
    <QueryProvider>
        <StoreProvider>
            <ThemeProvider>
                <AuthBootstrap>
                    {children}
                </AuthBootstrap>
                <Toaster />
            </ThemeProvider>
        </StoreProvider>
    </QueryProvider>
);
