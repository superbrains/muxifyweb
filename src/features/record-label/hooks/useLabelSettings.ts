import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getApiErrorMessage } from '@shared/lib/errorUtils';
import { useChakraToast } from '@shared/hooks/useChakraToast';
import { userService } from '@shared/services/userService';
import { useUserManagementStore } from '@/features/auth/store/useUserManagementStore';
import { useUserStore } from '@app/store/useUserStore';
import type { UserRole } from '@shared/types/user';
import { labelSettingsService } from '../services/labelSettingsService';
import { labelKeys } from './useLabelSummary';
import type {
    AddLabelDirectorRequest,
    LabelSettingsDto,
    UpdateLabelDirectorRequest,
    UpdateLabelProfileRequest,
} from '../types';

export const labelSettingsKeys = {
    settings: ['label', 'settings'] as const,
};

const invalidate = (qc: ReturnType<typeof useQueryClient>) => {
    qc.invalidateQueries({ queryKey: labelSettingsKeys.settings });
    qc.invalidateQueries({ queryKey: labelKeys.summary });
};

export const useLabelSettings = () =>
    useQuery<LabelSettingsDto>({
        queryKey: labelSettingsKeys.settings,
        queryFn: () => labelSettingsService.getSettings(),
        staleTime: 60_000,
    });

export const useUpdateLabelProfile = () => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: (req: UpdateLabelProfileRequest) =>
            labelSettingsService.updateProfile(req),
        onSuccess: (data) => {
            qc.setQueryData(labelSettingsKeys.settings, data);
            invalidate(qc);
            toast.success('Profile updated', 'Your label profile has been saved.');
        },
        onError: (err) => {
            toast.error(
                'Could not save profile',
                getApiErrorMessage(err, 'Please try again.'),
            );
        },
    });
};

export const useUploadLabelLogo = () => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: (file: File) => labelSettingsService.uploadLogo(file),
        onSuccess: async () => {
            invalidate(qc);
            // Re-fetch /users/me so the header avatar (which reads from
            // useUserManagementStore.labelLogo, hydrated from profile.avatar)
            // updates immediately. Mirrors AuthBootstrap's hydration flow.
            try {
                const profile = await userService.getCurrentUser();
                useUserManagementStore.getState().hydrateFromProfile(profile);
                useUserStore.getState().setUser({
                    id: profile.id,
                    email: profile.email,
                    name: profile.name,
                    role: profile.role as UserRole,
                    avatar: profile.avatar,
                    isVerified: profile.isVerified,
                    createdAt: profile.createdAt,
                    updatedAt: profile.updatedAt ?? profile.createdAt,
                });
            } catch {
                // Silent — next page load will hydrate fresh state.
            }
            toast.success('Logo updated', 'Your new logo is live.');
        },
        onError: (err) => {
            toast.error(
                'Logo upload failed',
                getApiErrorMessage(err, 'Please try a different file.'),
            );
        },
    });
};

export const useAddLabelDirector = () => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: (req: AddLabelDirectorRequest) =>
            labelSettingsService.addDirector(req),
        onSuccess: () => {
            invalidate(qc);
            toast.success('Director added');
        },
        onError: (err) => {
            toast.error(
                'Could not add director',
                getApiErrorMessage(err, 'Please check the fields and try again.'),
            );
        },
    });
};

export const useUpdateLabelDirector = () => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: ({
            directorId,
            req,
        }: {
            directorId: string;
            req: UpdateLabelDirectorRequest;
        }) => labelSettingsService.updateDirector(directorId, req),
        onSuccess: () => {
            invalidate(qc);
            toast.success('Director updated');
        },
        onError: (err) => {
            toast.error(
                'Could not update director',
                getApiErrorMessage(err, 'Please try again.'),
            );
        },
    });
};

export const useRemoveLabelDirector = () => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: (directorId: string) =>
            labelSettingsService.removeDirector(directorId),
        onSuccess: () => {
            invalidate(qc);
            toast.success('Director removed');
        },
        onError: (err) => {
            toast.error(
                'Could not remove director',
                getApiErrorMessage(err, 'Please try again.'),
            );
        },
    });
};

export const useUploadDirectorIdentity = () => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: ({ directorId, file }: { directorId: string; file: File }) =>
            labelSettingsService.uploadDirectorIdentity(directorId, file),
        onSuccess: () => {
            invalidate(qc);
            toast.success('Identity document uploaded');
        },
        onError: (err) => {
            toast.error(
                'Upload failed',
                getApiErrorMessage(err, 'Please try a different file.'),
            );
        },
    });
};

export const useSubmitLabelVerification = () => {
    const qc = useQueryClient();
    const toast = useChakraToast();
    return useMutation({
        mutationFn: (file: File) => labelSettingsService.submitVerification(file),
        onSuccess: () => {
            invalidate(qc);
            toast.success(
                'Verification submitted',
                'Our team will review your documents shortly.',
            );
        },
        onError: (err) => {
            toast.error(
                'Submission failed',
                getApiErrorMessage(err, 'Please try a different file.'),
            );
        },
    });
};
