import { Flex } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const LoadingScreen = () => {
    const bars = [
        { minHeight: 20, maxHeight: 40, width: 10, delay: 0, duration: 0.6 },
        { minHeight: 30, maxHeight: 60, width: 10, delay: 0.1, duration: 0.7 },
        { minHeight: 50, maxHeight: 90, width: 12, delay: 0.05, duration: 0.65 },
        { minHeight: 60, maxHeight: 110, width: 12, delay: 0.15, duration: 0.8 },
        { minHeight: 50, maxHeight: 90, width: 12, delay: 0.1, duration: 0.7 },
        { minHeight: 30, maxHeight: 60, width: 10, delay: 0.2, duration: 0.65 },
        { minHeight: 20, maxHeight: 40, width: 10, delay: 0.05, duration: 0.75 },
    ];

    return (
        <Flex
            justify="center"
            align="center"
            h="100vh"
            w="100vw"
            bgColor="rgba(249, 68, 68, 0.05)"
            position="fixed"
            top={0}
            left={0}
            zIndex={9999}
        >
            <Flex gap={2} align="center">
                {bars.map((bar, index) => (
                    <motion.div
                        key={index}
                        initial={{
                            height: `${bar.minHeight}px`,
                            width: `${bar.width}px`,
                            background: '#f94444',
                            borderRadius: '8px',
                        }}
                        animate={{
                            height: [
                                `${bar.minHeight}px`,
                                `${bar.maxHeight}px`,
                                `${bar.minHeight}px`,
                                `${bar.maxHeight * 0.7}px`,
                                `${bar.minHeight}px`,
                            ],
                        }}
                        transition={{
                            duration: bar.duration,
                            repeat: Infinity,
                            delay: bar.delay,
                            ease: 'easeInOut',
                            times: [0, 0.3, 0.5, 0.7, 1],
                        }}
                    />
                ))}
            </Flex>
        </Flex>
    );
};

export default LoadingScreen;

