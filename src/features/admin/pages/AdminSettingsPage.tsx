import React from 'react';
import { VStack } from '@chakra-ui/react';
import { AdminPageHeader } from '../components/AdminPageHeader';
import { ChangePasswordCard } from '../components/ChangePasswordCard';

const AdminSettingsPage: React.FC = () => {
    return (
        <VStack
            gap={{ base: 4, lg: 5 }}
            bg="gray.50"
            minH="100vh"
            align="stretch"
            px={{ base: 3, md: 6 }}
            py={{ base: 4, md: 6 }}
        >
            <AdminPageHeader
                title="Settings"
                subtitle="Manage your admin account"
            />

            <ChangePasswordCard />
        </VStack>
    );
};

export default AdminSettingsPage;
