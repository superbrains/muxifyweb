import React from 'react';
import { QueryProvider } from './QueryProvider';
import { StoreProvider } from './StoreProvider';
import { ThemeProvider } from './ThemeProvider';

export const AppProviders = ({ children }: { children: React.ReactNode }) => (
    <QueryProvider>
        <StoreProvider>
            <ThemeProvider>{children}</ThemeProvider>
        </StoreProvider>
    </QueryProvider>
);
