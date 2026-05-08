import React from 'react';
import { HStack, IconButton, Icon } from '@chakra-ui/react';
import { FiGrid, FiList } from 'react-icons/fi';
import { useViewModeStore, type ViewMode } from '../store/useViewModeStore';

const buttonStyle = (active: boolean) => ({
    bg: active ? 'white' : 'transparent',
    color: active ? 'primary.500' : 'gray.blue.700',
    shadow: active ? 'sm' : 'none',
    borderRadius: 'md',
    h: '32px',
    w: '32px',
    minW: '32px',
    transition: 'all 0.15s ease',
});

export const ViewToggle: React.FC = () => {
    const mode = useViewModeStore((s) => s.mode);
    const setMode = useViewModeStore((s) => s.setMode);

    const set = (next: ViewMode) => setMode(next);

    return (
        <HStack
            bg="gray.100"
            borderRadius="lg"
            p={1}
            gap={1}
            h="40px"
            align="center"
        >
            <IconButton
                aria-label="Grid view"
                variant="plain"
                {...buttonStyle(mode === 'grid')}
                onClick={() => set('grid')}
            >
                <Icon as={FiGrid} boxSize={4} />
            </IconButton>
            <IconButton
                aria-label="Table view"
                variant="plain"
                {...buttonStyle(mode === 'table')}
                onClick={() => set('table')}
            >
                <Icon as={FiList} boxSize={4} />
            </IconButton>
        </HStack>
    );
};
