import React from 'react';
import { Box, Center, Icon, Text, VStack } from '@chakra-ui/react';
import { FiLock } from 'react-icons/fi';
import { AnimatedTabs } from '@shared/components';
import { AdminPageHeader } from '../components/AdminPageHeader';
import { AdminLoading } from '../components/AdminStateBlock';
import { AdminsTab } from '../components/management/AdminsTab';
import { RolesTab } from '../components/management/RolesTab';
import { ActivityTab } from '../components/management/ActivityTab';
import { useMyPermissions } from '../hooks/useAdminManagement';

type TabId = 'admins' | 'roles' | 'activity';

const TABS = [
    { id: 'admins', label: 'Admins' },
    { id: 'roles', label: 'Roles' },
    { id: 'activity', label: 'Activity' },
];

/**
 * Admin Management — the Super Admin surface for inviting admins, building
 * roles, delegating permissions and auditing changes.
 */
const AdminManagementPage: React.FC = () => {
    const [tab, setTab] = React.useState<TabId>('admins');
    const { data: permissions, isLoading } = useMyPermissions();

    const canView =
        !!permissions &&
        (permissions.isSuperAdmin || permissions.permissions.includes('ManagementView'));

    return (
        <VStack
            gap={{ base: 3, lg: 4 }}
            bg="gray.50"
            minH="100vh"
            align="stretch"
            px={{ base: 3, md: 6 }}
            py={{ base: 4, md: 6 }}
        >
            <AdminPageHeader
                title="Admin Management"
                subtitle="Invite admins, create roles, delegate permissions and review activity"
            />

            {isLoading ? (
                <AdminLoading />
            ) : !canView ? (
                <Center minH="40vh">
                    <VStack gap={2} maxW="320px" textAlign="center">
                        <Icon as={FiLock} boxSize={7} color="gray.400" />
                        <Text fontSize="sm" fontWeight="semibold" color="gray.800">
                            You do not have access
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                            Admin Management is restricted to admins with the management
                            permission. Ask a Super Admin for access.
                        </Text>
                    </VStack>
                </Center>
            ) : (
                <>
                    <AnimatedTabs
                        tabs={TABS}
                        activeTab={tab}
                        onTabChange={(id) => setTab(id as TabId)}
                        size="sm"
                    />
                    <Box>
                        {tab === 'admins' && <AdminsTab />}
                        {tab === 'roles' && <RolesTab />}
                        {tab === 'activity' && <ActivityTab />}
                    </Box>
                </>
            )}
        </VStack>
    );
};

export default AdminManagementPage;
