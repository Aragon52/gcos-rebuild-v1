import { useMemo } from "react";
import { useAdminAuth } from "@/lib/admin-auth-context-hooks";
import { useDbSlaStaff, dbStaffToLegacy } from "./use-db-sla";
import { useDbSlaAdmins } from "./use-db-sla";

export function useAdminAccess() {
  const { session } = useAdminAuth();
  const { data: dbStaff } = useDbSlaStaff();
  const { data: dbAdmins } = useDbSlaAdmins();

  return useMemo(() => {
    if (!session) {
      return {
        isOwner: false,
        isAdmin: false,
        isStaff: false,
        allowedStaffIds: [] as string[],
        allowedStaffDocIds: [] as string[],
        allowedReferralIds: [] as string[],
        allowedAdminIds: [] as string[],
        allowedIds: [] as string[],
        canSeeAll: false,
        hasAccessToReseller: () => false,
      };
    }

    // Owner role can see all resellers across the system
    if (session.role === "Owner") {
      return {
        isOwner: true,
        isAdmin: false,
        isStaff: false,
        allowedStaffIds: [] as string[],
        allowedStaffDocIds: [] as string[],
        allowedReferralIds: [] as string[],
        allowedAdminIds: [] as string[],
        allowedIds: [] as string[],
        canSeeAll: true,
        hasAccessToReseller: () => true,
      };
    }

    const allStaff = (dbStaff ?? []).map(dbStaffToLegacy);
    const allAdmins = dbAdmins ?? [];

    // Admin role: Can see only their related resellers bound to their Admin ID / Referral codes and their staff
    if (session.role === "Admin") {
      const currentAdmin = allAdmins.find(
        (a) =>
          (session.accountId && a.account_id === session.accountId) ||
          (session.uid && a.id === session.uid) ||
          (session.email && a.email?.toLowerCase() === session.email?.toLowerCase())
      );

      const adminIdentifiers = new Set<string>(
        [
          session.accountId,
          session.uid,
          session.email?.toLowerCase(),
          currentAdmin?.account_id,
          currentAdmin?.id,
        ].filter(Boolean) as string[]
      );

      // Find staff assigned to or created by this admin
      const myStaff = allStaff.filter((s) => {
        const staffAdminId = s.createdByAdminId;
        return (
          adminIdentifiers.has(staffAdminId) ||
          (session.accountId && staffAdminId === session.accountId) ||
          (session.uid && staffAdminId === session.uid) ||
          (currentAdmin?.id && staffAdminId === currentAdmin.id) ||
          (currentAdmin?.account_id && staffAdminId === currentAdmin.account_id)
        );
      });

      const myStaffIds = myStaff.map((s) => s.staffId).filter(Boolean) as string[];
      const myStaffDocIds = myStaff.map((s) => s.id).filter(Boolean) as string[];
      const myStaffNames = myStaff.map((s) => s.name?.toLowerCase().trim()).filter(Boolean) as string[];

      // All referral codes associated with this Admin and their staff team
      const allowedReferralIds = Array.from(
        new Set([
          ...myStaff.map((s) => s.referralId),
          session.accountId,
          session.uid,
          currentAdmin?.account_id,
          currentAdmin?.id,
        ].filter(Boolean) as string[])
      );

      const allowedStaffIds = myStaffIds;
      const allowedStaffDocIds = myStaffDocIds;
      const allowedAdminIds = Array.from(adminIdentifiers);
      const allowedIds = Array.from(new Set([...allowedAdminIds, ...allowedStaffIds, ...allowedStaffDocIds]));

      const hasAccessToReseller = (reseller: any) => {
        if (!reseller) return false;

        const resAdminMember = String(reseller.adminMember || reseller.memberOfAdminId || reseller.admin_id || reseller.adminId || "").toLowerCase().trim();
        const resReferralId = String(reseller.referralId || reseller.referral_id || reseller.referralCode || "").toLowerCase().trim();
        const resReferredBy = String(reseller.referredBy || reseller.referred_by || reseller.staff_id || reseller.staffId || "").toLowerCase().trim();
        const resStaffName = String(reseller.staffName || reseller.staff_name || reseller.staffUsername || "").toLowerCase().trim();

        // 1. Match Admin Identifier
        if (resAdminMember && allowedAdminIds.some((id) => id.toLowerCase().trim() === resAdminMember)) {
          return true;
        }

        // 2. Match Referral Code (Admin's or their staff's)
        if (resReferralId && allowedReferralIds.some((id) => id.toLowerCase().trim() === resReferralId)) {
          return true;
        }

        // 3. Match Staff identifier (Staff ID, Doc ID, or referral code)
        if (
          resReferredBy &&
          (allowedStaffIds.some((id) => id.toLowerCase().trim() === resReferredBy) ||
            allowedStaffDocIds.some((id) => id.toLowerCase().trim() === resReferredBy) ||
            allowedReferralIds.some((id) => id.toLowerCase().trim() === resReferredBy) ||
            allowedAdminIds.some((id) => id.toLowerCase().trim() === resReferredBy))
        ) {
          return true;
        }

        // 4. Match Staff Name
        if (resStaffName && myStaffNames.some((name) => name === resStaffName)) {
          return true;
        }

        return false;
      };

      return {
        isOwner: false,
        isAdmin: true,
        isStaff: false,
        allowedStaffIds,
        allowedStaffDocIds,
        allowedReferralIds,
        allowedAdminIds,
        allowedIds,
        canSeeAll: false,
        hasAccessToReseller,
      };
    }

    // Staff role (User): Can see ONLY their own related resellers bound to their Referral Code / Staff ID
    if (session.role === "User") {
      const me = allStaff.find(
        (s) =>
          (session.accountId && s.staffId === session.accountId) ||
          (session.uid && s.id === session.uid) ||
          (session.email && s.email?.toLowerCase() === session.email?.toLowerCase())
      );

      const myStaffId = me?.staffId || session.accountId || "";
      const myStaffDocId = me?.id || session.uid || "";
      const myReferralId = me?.referralId || "";
      const myStaffName = (me?.name || session.name || "").toLowerCase().trim();

      const allowedStaffIds = [myStaffId, myStaffDocId].filter(Boolean);
      const allowedStaffDocIds = [myStaffDocId].filter(Boolean);
      const allowedReferralIds = [myReferralId, myStaffId].filter(Boolean);
      const allowedAdminIds = me?.createdByAdminId ? [me.createdByAdminId] : [];
      const allowedIds = Array.from(new Set([myStaffId, myStaffDocId, myReferralId].filter(Boolean)));

      const hasAccessToReseller = (reseller: any) => {
        if (!reseller) return false;

        const resReferralId = String(reseller.referralId || reseller.referral_id || reseller.referralCode || "").toLowerCase().trim();
        const resReferredBy = String(reseller.referredBy || reseller.referred_by || reseller.staff_id || reseller.staffId || "").toLowerCase().trim();
        const resStaffName = String(reseller.staffName || reseller.staff_name || reseller.staffUsername || "").toLowerCase().trim();

        // 1. Direct referral ID match
        if (myReferralId && resReferralId && resReferralId === myReferralId.toLowerCase().trim()) {
          return true;
        }

        // 2. Direct referredBy match (matches Staff ID or Staff Doc ID or Referral ID)
        if (resReferredBy) {
          if (myStaffId && resReferredBy === myStaffId.toLowerCase().trim()) return true;
          if (myStaffDocId && resReferredBy === myStaffDocId.toLowerCase().trim()) return true;
          if (myReferralId && resReferredBy === myReferralId.toLowerCase().trim()) return true;
        }

        // 3. Staff Name match
        if (myStaffName && resStaffName && resStaffName === myStaffName) {
          return true;
        }

        return false;
      };

      return {
        isOwner: false,
        isAdmin: false,
        isStaff: true,
        allowedStaffIds,
        allowedStaffDocIds,
        allowedReferralIds,
        allowedAdminIds,
        allowedIds,
        canSeeAll: false,
        hasAccessToReseller,
      };
    }

    return {
      isOwner: false,
      isAdmin: false,
      isStaff: false,
      allowedStaffIds: [] as string[],
      allowedStaffDocIds: [] as string[],
      allowedReferralIds: [] as string[],
      allowedAdminIds: [] as string[],
      allowedIds: [] as string[],
      canSeeAll: false,
      hasAccessToReseller: () => false,
    };
  }, [session, dbStaff, dbAdmins]);
}
