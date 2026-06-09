import React from 'react';
import { Box, VStack } from '@chakra-ui/react';
import { AnimatedTabs } from '@shared/components';

export interface DetailTab {
    id: string;
    label: string;
    icon?: React.ElementType;
    disabled?: boolean;
    content: React.ReactNode;
}

interface DetailTabsProps {
    tabs: DetailTab[];
    /** Controlled active tab id; falls back to internal state when omitted. */
    activeTab?: string;
    onTabChange?: (id: string) => void;
    size?: 'sm' | 'md' | 'lg';
}

/**
 * Tabbed detail body used by every "view X" surface. Wraps the shared
 * {@link AnimatedTabs} and renders the active tab's content beneath, so all
 * profile/content/campaign detail screens share one tab treatment.
 */
export const DetailTabs: React.FC<DetailTabsProps> = ({
    tabs,
    activeTab,
    onTabChange,
    size = 'sm',
}) => {
    const [internal, setInternal] = React.useState(tabs[0]?.id ?? '');
    const active = activeTab ?? internal;
    const change = (id: string) => {
        if (onTabChange) onTabChange(id);
        else setInternal(id);
    };

    const current = tabs.find((t) => t.id === active) ?? tabs[0];

    return (
        <VStack align="stretch" gap={4}>
            <Box overflowX="auto">
                <AnimatedTabs
                    tabs={tabs.map(({ id, label, icon, disabled }) => ({
                        id,
                        label,
                        icon,
                        disabled,
                    }))}
                    activeTab={active}
                    onTabChange={change}
                    size={size}
                />
            </Box>
            <Box>{current?.content}</Box>
        </VStack>
    );
};
