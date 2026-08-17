import React from 'react';
import { ConfirmActionModal } from '@shared/console';
import type { ActionTone } from '@shared/console';
import type { ContentActionKind, useContentItems } from './useContentItems';

type Controller = ReturnType<typeof useContentItems>;

const COPY: Record<
    ContentActionKind,
    { title: string; message: string; confirmText: string; tone: ActionTone; reasonLabel: string }
> = {
    remove: {
        title: 'Remove this content',
        message: 'The content will be taken down and hidden from listeners. This is recorded in the audit log.',
        confirmText: 'Remove content',
        tone: 'danger',
        reasonLabel: 'Removal reason',
    },
    restrict: {
        title: 'Restrict this content',
        message: 'The content stays up but is limited (e.g. hidden from discovery) until the restriction is lifted.',
        confirmText: 'Restrict content',
        tone: 'warning',
        reasonLabel: 'Restriction reason',
    },
    unrestrict: {
        title: 'Lift the restriction',
        message: 'The content returns to its normal distribution.',
        confirmText: 'Lift restriction',
        tone: 'primary',
        reasonLabel: 'Reason',
    },
};

/**
 * Reason-capture modal driven by the controller's `actionTarget`. Dispatches the
 * matching mutation (remove/restrict/unrestrict) and clears the target + the
 * detail drawer selection on success.
 */
export const ContentActionModal: React.FC<{ controller: Controller }> = ({ controller }) => {
    const target = controller.actionTarget;
    const copy = target ? COPY[target.action] : null;

    const handleConfirm = (reason: string) => {
        if (!target) return;
        const args = { kind: target.item.kind, id: target.item.id, reason };
        const onSuccess = () => {
            controller.setActionTarget(null);
            controller.setSelected(null);
        };
        switch (target.action) {
            case 'remove':
                controller.remove.mutate(args, { onSuccess });
                break;
            case 'restrict':
                controller.restrict.mutate(args, { onSuccess });
                break;
            case 'unrestrict':
                controller.unrestrict.mutate(args, { onSuccess });
                break;
        }
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
            tone={copy?.tone ?? 'danger'}
            isLoading={controller.actionPending}
        />
    );
};
