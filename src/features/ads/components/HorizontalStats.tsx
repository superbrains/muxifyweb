import React from 'react';
import { Box, VStack, Text, Flex } from '@chakra-ui/react';
import { motion } from 'framer-motion';

interface StatItem {
    label: string;
    value: number;
}

interface HorizontalStatsProps {
    data: StatItem[];
    barColor?: string;
    maxValue?: number;
}

const MotionBox = motion(Box);

export const HorizontalStats: React.FC<HorizontalStatsProps> = ({
    data,
    barColor = '#f94444',
    maxValue,
}) => {
    // Calculate max value from data if not provided
    // Use the highest number in the data array as 100% baseline
    const calculatedMaxValue = maxValue || Math.max(...data.map(item => item.value));

    return (
        <Box w="full">
            {data.map((item, index) => {
                // Calculate percentage: item value / highest value * 100
                // The highest value will always be 100%, others will be proportional
                const percentage = calculatedMaxValue > 0
                    ? (item.value / calculatedMaxValue) * 100
                    : 0;

                return (
                    <Box key={index} w="full" mb={3}>
                        <VStack align="stretch" gap={1}>
                            {/* Label */}
                            <Text
                                fontSize="10px"
                                fontWeight="medium"
                                color="#000"
                                textAlign="left"
                            >
                                {item.label}
                            </Text>

                            {/* Bar and Value */}
                            <Flex align="center" gap={3} w="full">
                                {/* Animated Bar */}
                                <MotionBox
                                    w={`${percentage}%`}
                                    h="19px"
                                    bg={barColor}
                                    borderRadius="1px"
                                    initial={{ scaleX: 0, transformOrigin: 'left' }}
                                    animate={{ scaleX: 1 }}
                                    transition={{
                                        duration: 0.8,
                                        delay: index * 0.1,
                                        ease: "easeOut"
                                    }}
                                />

                                {/* Value */}
                                <Text
                                    fontSize="10px"
                                    fontWeight="medium"
                                    color="#000"
                                    minW="fit-content"
                                    flexShrink={0}
                                >
                                    {item.value.toLocaleString()}
                                </Text>
                            </Flex>
                        </VStack>
                    </Box>
                );
            })}
        </Box>
    );
};

