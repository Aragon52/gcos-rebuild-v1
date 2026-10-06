# Implementation Plan: Dedicated Page-Level Permission Control for Admins & Staff

## Objective
Enable granular, page-by-page access control for Administrator and Staff accounts in the GCOS Admin Portal:
1. **System Owner**: Can configure dedicated page permissions for each Administrator account (on the Administrator Page) and for all Staff accounts (on the Staffs Page).
2. **Administrators**: Can configure dedicated page permissions for Staff accounts belonging to their assigned group (on the Staffs Page).
3. **Sidebar & Route Protection**: Automatically hide unauthorized sidebar items and restrict direct URL access to pages outside an account's granted permissions.

---

## User Preferences Incorporated
- **Default Policy**: Standard full role access is granted by default until explicit custom permissions are configured.
- **Authority Hierarchy**: Owner has full control over all Admins and Staff; Admins manage their own group's Staff.
- **UI Design**: Modal dialog with categorized checkboxes organized by sidebar groups (Menu, Customer Care, Management & Financing, Miscellaneous, System), plus quick presets.

---

## Proposed Changes

### 1. Database Schema & API
- Ensure `sla_staff` table has `permissions text[] DEFAULT '{}'` column in PostgreSQL.
- Update `src/hooks/use-db-sla.ts` to include `permissions` in `LegacySlaAdmin`, `LegacySlaStaff`, and mutation functions (`updateAdminPermissions`, `updateStaffPermissions`).
- Update `src/lib/admin-auth-context.tsx` to include `permissions: string[]` in `AdminSession` and refresh permissions on session sync.

### 2. Permissions Definition & Route Guarding
- Create `src/lib/admin-permissions.ts`:
  - Centralized catalog of all admin pages with keys, labels, routes, icons, and categories.
  - Role-based defaults (Owner default pages, Admin default pages, Staff default pages).
  - Helper `isPathAllowed(path, role, userPermissions)` to evaluate permission grants.
  - Preset roles (e.g. *Full Access*, *Customer Care Only*, *Finance Only*, *Catalog Specialist*, *Support Desk*).
- Update `src/components/admin/AppSidebar.tsx`:
  - Filter menu groups and items dynamically according to `session.permissions`.
- Update `src/components/admin/AdminLayout.tsx`:
  - Enforce route protection. If an admin/staff visits a disallowed route directly via URL, display a clean "Access Restricted" alert and redirect to their primary allowed page.

### 3. Reusable Permission Manager Modal Component
- Create `src/components/admin/PermissionManagerModal.tsx`:
  - Header: Target account identity (Name, Email, Role/Department, Group).
  - Presets toolbar: "Grant All", "Clear All", "Reset to Default", plus role presets.
  - Category sections with toggle-all per section:
    1. **MENU**: Overview / Dashboard (`/admin`)
    2. **CUSTOMER CARE SERVICE**: Staffs, Reseller Profile, Virtual Chat, Virtual Order, Retail Shops, Track & Manage Orders.
    3. **MANAGEMENT & FINANCING**: Customer Service, Reseller Customer Service, Payment Info's & Balance, Deposit, Withdrawal, Administrator (Owner only), Ownership (Owner only).
    4. **MISCELLANEOUS GROUP**: Product Catalog, Customers, Financial, Orders.
    5. **SYSTEM**: System Dashboard, Admin Session Logs, Active Alerts, System Logs.
  - Save action: Persists updated permissions array to Supabase and displays success toast.

### 4. Integration in Administrator Page (`SLAAdministratorPage.tsx`)
- Add a "Manage Page Permissions" action button in the action dropdown and row controls for each Administrator.
- Open `PermissionManagerModal` configured for the selected Admin.
- Only visible to the System Owner.

### 5. Integration in Staffs Page (`SLAUserPage.tsx`)
- Add a "Manage Page Permissions" action button in the action dropdown and row controls for each Staff member.
- Open `PermissionManagerModal` configured for the selected Staff member.
- Permissions:
  - System Owner can edit permissions for any Staff member.
  - Administrators can edit permissions for Staff members under their own group (`created_by_admin_id`).

---

## Verification & Testing Plan
1. **Database Verification**: Ensure `permissions` columns in `sla_admins` and `sla_staff` persist and retrieve properly.
2. **Owner to Admin Permissions**:
   - Log in as Owner, open Administrator page (`/admin/sla/administrator`), edit an admin's permissions (e.g., restrict from Financial or System).
   - Log in / simulate that Admin: Verify restricted pages are hidden in sidebar and blocked upon direct navigation.
3. **Admin to Staff Permissions**:
   - Log in as Admin, open Staffs page (`/admin/customer-care/staffs`), edit permissions for a subordinate staff member.
   - Verify non-group staff accounts cannot be modified by that Admin.
   - Verify staff login correctly enforces granted pages.
4. **Applet Compilation & Linting**: Run `compile_applet` and `lint_applet` to ensure clean build.
