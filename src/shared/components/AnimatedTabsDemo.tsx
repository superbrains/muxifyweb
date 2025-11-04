import React, { useState } from 'react';
import { VStack, Text } from '@chakra-ui/react';
import { AnimatedTabs } from './AnimatedTabs';

export const AnimatedTabsDemo: React.FC = () => {
    const [activeTab, setActiveTab] = useState('tab1');

    const tabs = [
        { id: 'tab1', label: 'Tab 1' },
        { id: 'tab2', label: 'Tab 2' },
        { id: 'tab3', label: 'Tab 3' },
    ];

    return (
        <VStack gap={8} p={8} align="start">
            <Text fontSize="lg" fontWeight="bold">AnimatedTabs Demo with Different Colors</Text>

            <VStack gap={4} align="start">
                <Text fontSize="md" fontWeight="semibold">Red Color (Default for filters)</Text>
                <AnimatedTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    selectedColor="red.500"
                />
            </VStack>

            <VStack gap={4} align="start">
                <Text fontSize="md" fontWeight="semibold">Blue Color</Text>
                <AnimatedTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    selectedColor="blue.500"
                />
            </VStack>

            <VStack gap={4} align="start">
                <Text fontSize="md" fontWeight="semibold">Green Color</Text>
                <AnimatedTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    selectedColor="green.500"
                />
            </VStack>

            <VStack gap={4} align="start">
                <Text fontSize="md" fontWeight="semibold">Purple Color</Text>
                <AnimatedTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    selectedColor="purple.500"
                />
            </VStack>

            <VStack gap={4} align="start">
                <Text fontSize="md" fontWeight="semibold">Custom Hex Color</Text>
                <AnimatedTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    selectedColor="#FF6B35"
                />
            </VStack>

            <VStack gap={4} align="start">
                <Text fontSize="md" fontWeight="semibold">Custom Background Color</Text>
                <AnimatedTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    selectedColor="blue.500"
                    backgroundColor="blue.50"
                />
            </VStack>

            <VStack gap={4} align="start">
                <Text fontSize="md" fontWeight="semibold">Dark Theme</Text>
                <AnimatedTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    selectedColor="purple.400"
                    backgroundColor="gray.800"
                />
            </VStack>

            <VStack gap={4} align="start">
                <Text fontSize="md" fontWeight="semibold">Custom Text & Icon Colors</Text>
                <AnimatedTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    selectedColor="green.500"
                    backgroundColor="green.50"
                    textColor="green.700"
                    iconColor="green.600"
                />
            </VStack>

            <VStack gap={4} align="start">
                <Text fontSize="md" fontWeight="semibold">Orange Theme</Text>
                <AnimatedTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    selectedColor="orange.500"
                    backgroundColor="orange.100"
                    textColor="orange.800"
                    iconColor="orange.600"
                />
            </VStack>

            <VStack gap={4} align="start">
                <Text fontSize="md" fontWeight="semibold">Custom Selected Colors</Text>
                <AnimatedTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    selectedColor="purple.600"
                    backgroundColor="purple.50"
                    textColor="purple.700"
                    iconColor="purple.500"
                    selectedTextColor="purple.900"
                    selectedIconColor="purple.800"
                />
            </VStack>

            <VStack gap={4} align="start">
                <Text fontSize="md" fontWeight="semibold">Dark Selected Theme</Text>
                <AnimatedTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    selectedColor="gray.800"
                    backgroundColor="gray.200"
                    textColor="gray.600"
                    iconColor="gray.500"
                    selectedTextColor="yellow.300"
                    selectedIconColor="yellow.400"
                />
            </VStack>

            <VStack gap={4} align="start">
                <Text fontSize="md" fontWeight="semibold">Style 1 - Rounded Background (Default)</Text>
                <AnimatedTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    selectedColor="blue.500"
                    backgroundColor="blue.50"
                    tabStyle={1}
                />
            </VStack>

            <VStack gap={4} align="start">
                <Text fontSize="md" fontWeight="semibold">Style 2 - Rounded Top Edges</Text>
                <AnimatedTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    selectedColor="green.500"
                    backgroundColor="green.50"
                    tabStyle={2}
                />
            </VStack>

            <VStack gap={4} align="start">
                <Text fontSize="md" fontWeight="semibold">Style 2 - Dark Theme</Text>
                <AnimatedTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    selectedColor="purple.600"
                    backgroundColor="purple.100"
                    textColor="purple.700"
                    iconColor="purple.500"
                    selectedTextColor="white"
                    selectedIconColor="white"
                    tabStyle={2}
                />
            </VStack>

            <VStack gap={4} align="start">
                <Text fontSize="md" fontWeight="semibold">With Border Color</Text>
                <AnimatedTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    selectedColor="blue.500"
                    backgroundColor="blue.50"
                    borderColor="blue.300"
                    textColor="blue.700"
                    iconColor="blue.500"
                />
            </VStack>

            <VStack gap={4} align="start">
                <Text fontSize="md" fontWeight="semibold">Style 2 with Border</Text>
                <AnimatedTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    selectedColor="green.500"
                    backgroundColor="green.50"
                    borderColor="green.300"
                    textColor="green.700"
                    iconColor="green.500"
                    tabStyle={2}
                />
            </VStack>
        </VStack>
    );
};

export default AnimatedTabsDemo;
