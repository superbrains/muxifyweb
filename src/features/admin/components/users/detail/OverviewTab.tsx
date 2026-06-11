import React from 'react';
import { SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { StatusBadge } from '../../StatusBadge';
import { verificationStatusStyle } from '../../../lib/statusColor';
import { adminDateTime } from '../../../lib/format';
import { Field, Panel } from './Panel';
import type { AdminUserDetailDto, AdminUserProfileDto } from '../../../types';

const YesNo: React.FC<{ value?: boolean }> = ({ value }) => (
    <Text as="span" fontSize="xs" color={value ? 'green.600' : 'gray.400'}>
        {value ? 'Yes' : 'No'}
    </Text>
);

/** Account + verification panels — the role-agnostic facts about the account. */
export const OverviewTab: React.FC<{
    user: AdminUserDetailDto;
    profile?: AdminUserProfileDto;
}> = ({ user, profile }) => (
    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
        <Panel title="Account">
            <Stack gap={0}>
                <Field label="User ID" value={user.id} />
                <Field label="Email" value={user.email} />
                <Field label="Email verified" value={<YesNo value={profile?.account.isEmailVerified} />} />
                <Field label="Phone" value={user.phoneNumber} />
                <Field label="Phone verified" value={<YesNo value={profile?.account.phoneVerified} />} />
                <Field label="Country" value={user.country} />
                <Field label="Onboarding completed" value={<YesNo value={profile?.account.onboardingCompleted} />} />
                <Field label="Last login" value={adminDateTime(profile?.account.lastLoginAt)} />
            </Stack>
        </Panel>
        <Panel title="Verification">
            <Stack gap={0}>
                <Field
                    label="Status"
                    value={<StatusBadge style={verificationStatusStyle(user.verificationStatus)} />}
                />
                {user.verificationRejectionReason && (
                    <Field label="Rejection reason" value={user.verificationRejectionReason} />
                )}
                {user.suspendedAt && (
                    <Field label="Suspended" value={adminDateTime(user.suspendedAt)} />
                )}
                {user.suspendedReason && (
                    <Field label="Suspension reason" value={user.suspendedReason} />
                )}
            </Stack>
        </Panel>
    </SimpleGrid>
);
