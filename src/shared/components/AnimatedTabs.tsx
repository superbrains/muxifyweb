import React, { useRef, useEffect, useState } from 'react';
import { Box, Button, HStack, Icon } from '@chakra-ui/react';
import type { IconType } from 'react-icons';

interface Tab {
    id: string;
    label: string;
    icon?: IconType;
}

interface AnimatedTabsProps {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
    size?: 'sm' | 'md' | 'lg';
    tabWidth?: string | number; // Optional fixed width for each tab button (e.g., "90px", 120)
    isDisabled?: boolean;
    selectedColor?: string; // Optional custom color for the selected tab indicator
    backgroundColor?: string; // Optional custom background color for the tabs container
    iconColor?: string; // Optional custom color for inactive tab icons
    textColor?: string; // Optional custom color for inactive tab text
    selectedTextColor?: string; // Optional custom color for active tab text
    selectedIconColor?: string; // Optional custom color for active tab icons
    tabStyle?: 1 | 2; // Tab style: 1 = rounded background, 2 = rounded top edges
    borderColor?: string; // Optional custom border color for the tabs container
}

export const AnimatedTabs: React.FC<AnimatedTabsProps> = ({
    tabs,
    activeTab,
    onTabChange,
    size = 'md',
    tabWidth,
    isDisabled,
    selectedColor = 'primary.500',
    backgroundColor = 'gray.100',
    iconColor,
    textColor,
    selectedTextColor,
    selectedIconColor,
    tabStyle = 1,
    borderColor,
}) => {
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    // Size configurations
    const sizeConfig = {
        sm: {
            containerPadding: 1,
            containerGap: 1,
            buttonPx: 3,
            buttonPy: 1.5,
            fontSize: '11px',
            iconSize: 3.5,
        },
        md: {
            containerPadding: 1,
            containerGap: 1,
            buttonPx: 5,
            buttonPy: 2,
            fontSize: '12px',
            iconSize: 4,
        },
        lg: {
            containerPadding: 1.5,
            containerGap: 1.5,
            buttonPx: { base: 4, md: 5 },
            buttonPy: 2.5,
            fontSize: '12px',
            iconSize: 4,
        },
    };

    const config = sizeConfig[size];

    // Style configurations
    const styleConfig = {
        1: {
            containerBorderRadius: 'lg',
            containerPadding: config.containerPadding,
            containerGap: config.containerGap,
            indicatorBorderRadius: 'lg',
            indicatorTop: typeof config.containerPadding === 'number' ? config.containerPadding * 4 : 6,
            indicatorHeight: `calc(100% - ${typeof config.containerPadding === 'number' ? config.containerPadding * 2 * 4 : 12}px)`,
        },
        2: {
            containerBorderRadius: 'none',
            containerPadding: 0,
            containerGap: 0,
            indicatorBorderRadius: 'none',
            indicatorTop: 0,
            indicatorHeight: '100%',
        },
    };

    const currentStyle = styleConfig[tabStyle];

    useEffect(() => {
        const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);
        const activeButton = tabRefs.current[activeIndex];
        const container = containerRef.current;

        if (activeButton && container) {
            const containerRect = container.getBoundingClientRect();
            const buttonRect = activeButton.getBoundingClientRect();

            setIndicatorStyle({
                left: buttonRect.left - containerRect.left,
                width: buttonRect.width,
            });
        }
    }, [activeTab, tabs]);

    return (
        <HStack
            ref={containerRef}
            bg={backgroundColor}
            p={currentStyle.containerPadding}
            gap={currentStyle.containerGap}
            borderRadius={currentStyle.containerBorderRadius}
            borderTopRadius={tabStyle === 2 ? 'lg' : undefined}
            borderColor={borderColor}
            borderWidth={borderColor ? '1px' : undefined}
            w="fit-content"
            position="relative"
        >
            {/* Animated sliding indicator */}
            <Box
                position="absolute"
                bg={selectedColor}
                borderRadius={currentStyle.indicatorBorderRadius}
                borderTopRadius={tabStyle === 2 ? 'lg' : undefined}
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                style={{
                    left: `${indicatorStyle.left}px`,
                    width: `${indicatorStyle.width}px`,
                    height: currentStyle.indicatorHeight,
                    top: `${currentStyle.indicatorTop}px`,
                }}
                pointerEvents="none"
                zIndex={0}
            />

            {/* Tab buttons */}
            {tabs.map((tab, index) => {
                const isActive = tab.id === activeTab;

                return (
                    <Button
                        key={tab.id}
                        ref={(el) => {
                            tabRefs.current[index] = el;
                        }}
                        variant="ghost"
                        bg="transparent"
                        color={isActive ? (selectedTextColor || 'white') : (textColor || 'gray.600')}
                        fontSize={config.fontSize}
                        fontWeight="medium"
                        px={config.buttonPx}
                        py={config.buttonPy}
                        h="auto"
                        w={tabWidth}
                        borderRadius="lg"
                        onClick={() => !isDisabled && onTabChange(tab.id)}
                        disabled={!!isDisabled}
                        _hover={{
                            bg: isActive ? 'transparent' : 'gray.200',
                        }}
                        transition="color 0.2s"
                        position="relative"
                        zIndex={1}
                    >
                        {tab.icon && (
                            <Icon
                                as={tab.icon}
                                boxSize={config.iconSize}
                                mr={2}
                                color={isActive ? (selectedIconColor || 'white') : (iconColor || selectedColor)}
                            />
                        )}
                        {tab.label}
                    </Button>
                );
            })}
        </HStack>
    );
};

