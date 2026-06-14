/**
 * Shared admin UI kit. Every separated tower / role / queue page composes from
 * here so the console stays visually consistent as it grows to 60+ pages.
 * New pages should import layout, table, filters, badges, modals, drawers and
 * nav from this barrel rather than hand-rolling per-page styling.
 */

// Layout & chrome
export { AdminPageLayout } from './AdminPageLayout';
export type { Breadcrumb } from './AdminPageLayout';

// Data display
export { DataTable } from './DataTable';
export type { DataColumn, SortState, PaginationState } from './DataTable';
export { KpiStrip } from './KpiStrip';
export type { KpiItem } from './KpiStrip';
export { FilterBar } from './FilterBar';
export type { SelectFilter } from './FilterBar';

// Status
export { StatusBadge, resolveStatusStyle, toneStyle } from './statusBadge';
export type { StatusTone, StatusStyle } from './statusBadge';

// Detail surfaces
export { DetailDrawer } from './DetailDrawer';
export { DetailTabs } from './DetailTabs';
export type { DetailTab } from './DetailTabs';
export { AuditTimeline } from './AuditTimeline';
export type { AuditEntry } from './AuditTimeline';

// Actions & states
export { ConfirmActionModal } from './ConfirmActionModal';
export type { ActionTone } from './ConfirmActionModal';
export { BulkActionBar } from './BulkActionBar';
export type { BulkAction } from './BulkActionBar';
export { CopyableId } from './CopyableId';
export { AdminEmptyState } from './EmptyState';

// Navigation
export { SectionNav } from './SectionNav';
export type { NavGroup, NavLink } from './SectionNav';

// Detail page layout
export { DetailPageLayout } from './DetailPageLayout';

// Content-specific display helpers
export { CoverThumb } from './CoverThumb';
export { MediaCell } from './MediaCell';
export type { MetaField } from './MetaGrid';
export { MetaGrid } from './MetaGrid';
export { ComparisonCard } from './ComparisonCard';
export type { ComparisonSide } from './ComparisonCard';

// Re-exported existing primitives (single import surface)
export { IdentityCell } from '../IdentityCell';
export { AdminLoading, AdminError } from '../AdminStateBlock';
