import React from 'react';
import { ConfirmActionModal } from '../../components/ui';
import type { ActionTone } from '../../components/ui';
import type { CurationAction } from '../../types/discovery';
import type { DiscoveryItemsController } from './useDiscoveryItems';

const COPY: Record<
    CurationAction,
    { title: string; message: string; confirmText: string; tone: ActionTone; reasonLabel: string }
> = {
    Pin: {
        title: 'Pin to the top',
        message: 'Pin this item at its current rank so it stays visible regardless of organic score. Recorded in the audit log.',
        confirmText: 'Pin item',
        tone: 'primary',
        reasonLabel: 'Pin reason',
    },
    Boost: {
        title: 'Boost this item',
        message: 'Give this item extra weight so it ranks higher than its organic score would place it. Recorded in the audit log.',
        confirmText: 'Boost item',
        tone: 'info',
        reasonLabel: 'Boost reason',
    },
    Suppress: {
        title: 'Suppress this item',
        message: 'Push this item down the ranking without fully removing it from discovery. Recorded in the audit log.',
        confirmText: 'Suppress item',
        tone: 'warning',
        reasonLabel: 'Suppression reason',
    },
    Exclude: {
        title: 'Exclude this item',
        message: 'Remove this item from this discovery surface entirely. Recorded in the audit log.',
        confirmText: 'Exclude item',
        tone: 'danger',
        reasonLabel: 'Exclusion reason',
    },
};

/**
 * Reason-capture modal driven by the controller's `actionTarget`. Dispatches the
 * matching curation override (Pin/Boost/Suppress/Exclude) and clears the target
 * on success.
 */
export const DiscoveryActionModal: React.FC<{ controller: DiscoveryItemsController }> = ({
    controller,
}) => {
    const target = controller.actionTarget;
    const copy = target ? COPY[target.action] : null;

    const handleConfirm = (reason: string) => {
        if (!target) return;
        controller.dispatchAction(target, reason, () => controller.setActionTarget(null));
    };

    return (
        <ConfirmActionModal
            isOpen={target !== null}
            onClose={() => controller.setActionTarget(null)}
            onConfirm={handleConfirm}
            title={copy?.title ?? ''}
            message={copy?.message}
            reasonLabel={copy?.reasonLabel}
            confirmText={copy?.confirmText}
            tone={copy?.tone ?? 'primary'}
            isLoading={controller.actionPending}
        />
    );
};
