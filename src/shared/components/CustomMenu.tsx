
import React from 'react';
import { Button, Icon, Portal } from '@chakra-ui/react';
import { FiMoreHorizontal} from 'react-icons/fi';
import { Menu } from '@chakra-ui/react';

interface MenuOption {
    label: string;
    value: string;
    color?: string;
    onClick?: () => void;
}

interface CustomMenuProps {
    options: MenuOption[];
    size?: 'sm' | 'md' | 'lg';
}

export const CustomMenu: React.FC<CustomMenuProps> = ({ options, size = 'sm' }) => {
    return (
        <Menu.Root>
            <Menu.Trigger asChild>
                <Button
                    variant="ghost"
                    size={size}
                    minW="auto"
                    px={2}
                    _hover={{ bg: 'gray.100' }}
                >
                    <Icon as={FiMoreHorizontal} boxSize={4} />
                </Button>
            </Menu.Trigger>
            <Portal>
                <Menu.Positioner>
                    <Menu.Content>
                        {options.map((option) => (
                            <Menu.Item
                                key={option.value}
                                value={option.value}
                                color={option.color}
                                onClick={option.onClick}
                            >
                                {option.label}
                            </Menu.Item>
                        ))}
                    </Menu.Content>
                </Menu.Positioner>
            </Portal>
        </Menu.Root>
    );
};

