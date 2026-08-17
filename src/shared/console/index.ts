/**
 * Console UI kit. Every separated tower / role / queue page composes from here
 * so the console stays visually consistent as it grows to 60+ pages. New pages
 * should import layout, table, filters, badges, modals, drawers and nav from
 * this barrel rather than hand-rolling per-page styling.
 *
 * This lives in `shared/` rather than `features/admin/` deliberately: the
 * contributor, disputes, ads and dashboard surfaces compose from it too, and
 * the admin console is built as a separate bundle (see `admin.html`). Anything
 * that imports from here must stay free of admin-only services and route
 * strings, or it would drag the admin surface back into the creator bundle.
 */

// Layout & chrome
export { AdminPageLayout } from './components/AdminPageLayout';
export type { Breadcrumb } from './components/AdminPageLayout';

// Data display
export { DataTable } from './components/DataTable';
export type { DataColumn, SortState, PaginationState } from './components/DataTable';
export { KpiStrip } from './components/KpiStrip';
export type { KpiItem } from './components/KpiStrip';
export { FilterBar } from './components/FilterBar';
export type { SelectFilter } from './components/FilterBar';

// Status
export { StatusBadge, resolveStatusStyle, toneStyle } from './components/statusBadge';
export type { StatusTone, StatusStyle } from './components/statusBadge';

// Detail surfaces
export { DetailDrawer } from './components/DetailDrawer';
export { DetailTabs } from './components/DetailTabs';
export type { DetailTab } from './components/DetailTabs';
export { AuditTimeline } from './components/AuditTimeline';
export type { AuditEntry } from './components/AuditTimeline';

// Actions & states
export { ConfirmActionModal } from './components/ConfirmActionModal';
export type { ActionTone } from './components/ConfirmActionModal';
export { BulkActionBar } from './components/BulkActionBar';
export type { BulkAction } from './components/BulkActionBar';
export { CopyableId } from './components/CopyableId';
export { AdminEmptyState } from './components/EmptyState';

// Navigation
export { SectionNav } from './components/SectionNav';
export type { NavGroup, NavLink } from './components/SectionNav';

// Detail page layout
export { DetailPageLayout } from './components/DetailPageLayout';

// Content-specific display helpers
export { CoverThumb } from './components/CoverThumb';
export { MediaCell } from './components/MediaCell';
export type { MetaField } from './components/MetaGrid';
export { MetaGrid } from './components/MetaGrid';
export { ComparisonCard } from './components/ComparisonCard';
export type { ComparisonSide } from './components/ComparisonCard';

// Re-exported existing primitives (single import surface)
export { IdentityCell } from './components/IdentityCell';
export { AdminLoading, AdminError } from './components/AdminStateBlock';
