import React from 'react';
import { Box, VStack } from '@chakra-ui/react';
import type { IconType } from 'react-icons';
import { AdminError, BulkActionBar, DataTable, KpiStrip } from '@shared/console';
import type { DataColumn } from '@shared/console';
import type { AdminTrendingItemDto, AdminTrendingPageDto, CurationAction } from '../../types/discovery';
import { CurateActions } from './discoveryShared';
import { buildSurfaceKpis } from './discoveryUtils';
import { CurationOverrideModal } from './CurationOverrideModal';
import { DiscoveryDetailDrawer } from './DiscoveryDetailDrawer';
import type { DiscoveryItemsController } from './useDiscoveryItems';

interface TrendingSurfaceViewProps {
    controller: DiscoveryItemsController;
    data?: AdminTrendingPageDto;
    isLoading: boolean;
    error: unknown;
    /** The page-specific FilterBar (period / contentType / genre). */
    filterBar: React.ReactNode;
    emptyIcon: IconType;
    emptyTitle: string;
    emptyDescription: string;
    errorMessage: string;
}

/**
 * Shared render layer for the four trending-family Discovery pages. Given the
 * page's list query result + the shared {@link DiscoveryItemsController}, it
 * draws the KPI strip, the filter bar, the ranked table (cover art + metrics +
 * curation badge), bulk multi-select, the rich single/batch promote-demote
 * modals and the row detail drawer. Pages only differ by their filters + copy.
 */
export const TrendingSurfaceView: React.FC<TrendingSurfaceViewProps> = ({
    controller: c,
    data,
    isLoading,
    error,
    filterBar,
    emptyIcon,
    emptyTitle,
    emptyDescription,
    errorMessage,
}) => {
    const items = data?.items ?? [];

    const columns: DataColumn<AdminTrendingItemDto>[] = c.canManage
        ? [
              ...c.columns,
              {
                  key: 'actions',
                  header: '',
                  align: 'right',
                  render: (it) => (
                      <Box onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                          <CurateActions onAction={(action) => c.openAction(it, action)} />
                      </Box>
                  ),
              },
          ]
        : c.columns;

    const target = c.actionTarget;

    return (
        <VStack align="stretch" gap={4}>
            <KpiStrip items={buildSurfaceKpis(items, data?.total ?? items.length, c.activeOverridesCount)} />

            {filterBar}

            {error ? (
                <AdminError error={error} message={errorMessage} />
            ) : (
                <DataTable
                    columns={columns}
                    rows={items}
                    rowKey={c.rowKey}
                    loading={isLoading && !data}
                    onRowClick={c.openDetail}
                    emptyIcon={emptyIcon}
                    emptyTitle={emptyTitle}
                    emptyDescription={emptyDescription}
                    selectable={c.canManage}
                    selectedKeys={c.selectedKeys}
                    onToggleRow={c.toggleRow}
                    onToggleAll={c.toggleAll}
                    pagination={
                        data
                            ? {
                                  page: data.page,
                                  pageSize: data.pageSize,
                                  total: data.total,
                                  onPageChange: (page) => c.setQuery((q) => ({ ...q, page })),
                              }
                            : undefined
                    }
                />
            )}

            {c.canManage && (
                <BulkActionBar
                    count={c.selectedCount}
                    noun="item"
                    busy={c.bulkPending}
                    onClear={c.clearSelection}
                    actions={(['Pin', 'Boost', 'Suppress', 'Exclude'] as CurationAction[]).map((action) => ({
                        label: action,
                        tone: action === 'Exclude' ? 'danger' : action === 'Pin' ? 'primary' : 'default',
                        onClick: () => c.openBulk(action),
                    }))}
                />
            )}

            {/* Single-row promote/demote */}
            <CurationOverrideModal
                open={target !== null}
                onClose={c.closeAction}
                action={target?.action ?? 'Pin'}
                contextLabel={target?.item.title || target?.item.contentId}
                initial={
                    target?.action === 'Pin' ? { pinnedRank: target.item.rank } : undefined
                }
                confirmText={target ? `${target.action} item` : undefined}
                loading={c.singlePending}
                onConfirm={(draft) => c.dispatchSingle(draft, c.closeAction)}
            />

            {/* Batch promote/demote over the current selection */}
            <CurationOverrideModal
                open={c.bulkAction !== null}
                onClose={c.closeBulk}
                action={c.bulkAction ?? 'Pin'}
                title={c.bulkAction ? `${c.bulkAction} ${c.selectedCount} items` : undefined}
                contextLabel={`${c.selectedCount} selected item${c.selectedCount === 1 ? '' : 's'}`}
                confirmText={c.bulkAction ? `${c.bulkAction} ${c.selectedCount}` : undefined}
                loading={c.bulkPending}
                onConfirm={(draft) => c.dispatchBulk(draft, c.closeBulk)}
            />

            <DiscoveryDetailDrawer
                row={c.detailRow}
                surface={c.surface}
                canManage={c.canManage}
                onClose={c.closeDetail}
                onCurate={(item, action) => {
                    c.closeDetail();
                    c.openAction(item, action);
                }}
            />
        </VStack>
    );
};
