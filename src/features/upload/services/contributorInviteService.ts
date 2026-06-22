import { axiosInstance } from '@app/lib/axiosInstance';
import type { SplitRecipientRole } from '@/features/record-label/types';

export interface ContributorInviteRequest {
    email: string;
    displayName: string;
    role: SplitRecipientRole;
}

export interface ContributorInviteResponse {
    contributorUserId: string;
    displayName: string;
    role: SplitRecipientRole;
    /** A brand-new claimable account was created for this email. */
    accountProvisioned: boolean;
    /** The email already belonged to a Muxify account that was reused. */
    alreadyOnMuxify: boolean;
}

export const contributorInviteService = {
    /**
     * Invite an external (non-Muxify) person as a contributor. Provisions or
     * reuses a claimable contributor account, emails a claim link, and returns
     * the contributor's userId for use as a split recipient.
     */
    invite: async (
        payload: ContributorInviteRequest,
    ): Promise<ContributorInviteResponse> => {
        const response = await axiosInstance.post<ContributorInviteResponse>(
            '/contributor-invites',
            {
                email: payload.email.trim(),
                displayName: payload.displayName.trim(),
                role: payload.role,
            },
        );
        return response.data;
    },
};
