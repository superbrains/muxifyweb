import React from 'react';
import {
    Box,
    Text,
    HStack,
    Icon,
} from '@chakra-ui/react';
import type { IconType } from 'react-icons';
import type { IconProps } from '@chakra-ui/react';
import { MdOutlineArrowForward } from 'react-icons/md';

interface UserTypeCardProps {
    title: string;
    description: string;
    icon: IconType | React.ComponentType<IconProps>;
    onClick: () => void;
}

export const UserTypeCard: React.FC<UserTypeCardProps> = ({
    title,
    description,
    icon,
    onClick,
}) => {
    return (
        <Box
            w="full"
            bg="white"
            borderRadius="lg"
            p={3}
            border={"1px solid"}
            borderColor={"transparent"}
            cursor="pointer"
            shadow="sm"
            _hover={{
                bg: "#FFF9F8",
                borderColor: "primary.500",
                transform: "translateY(-2px)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                "& .icon-container": {
                    bg: "primary.600",
                    h: "40px",
                    w: "40px",
                },
                "& .arrow-icon": {
                    opacity: 1,
                },
                "& .icon": {
                    color: "white",
                    scale: "1.5",
                }
            }}
            transition="all 0.2s ease"
            onClick={onClick}
        >
            <HStack gap={3} alignItems="center">
                <Box h="40px" w="40px" display="flex" alignItems="center" justifyContent="center">
                    <Box
                        className="icon-container"
                        borderRadius="full"
                        h="32px"
                        w="32px"
                        bg="#FFECEC"
                        color="white"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        transition="all 0.2s ease"
                    >

                        <Icon className='icon' color="primary.500" as={icon} />

                    </Box>
                </Box>


                <Box flex={1}>
                    <Text
                        fontSize="11px"
                        fontWeight="semibold"
                        color="black"
                        mb={0.5}
                    >
                        {title}
                    </Text>
                    <Text
                        fontSize="10px"
                        color="black"
                    >
                        {description}
                    </Text>
                </Box>

                <Box
                    className="arrow-icon"
                    opacity={0}
                    transition="opacity 0.2s ease"
                >
                    <Icon
                        as={MdOutlineArrowForward}
                        color="primary.500"
                        boxSize={5}
                    />
                </Box>
            </HStack>
        </Box>
    );
};
