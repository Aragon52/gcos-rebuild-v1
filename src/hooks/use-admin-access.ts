import { useMemo } from "react";
import { useAdminAuth } from "@/lib/admin-auth-context-hooks";
import { SUPER_OWNER_EMAILS } from "@/lib/admin-auth-context";
import { useDbSlaStaff, dbStaffToLegacy } from "./use-db-sla";
import { useDbSlaAdmins } from "./use-db-sla";

export const ADMIN_UUID_TO_ACCOUNT: Record<string, string> = {
  "263f859e-2088-444b-b4aa-93a009c9c844": "ga01",
  "53584982-2157-4c20-818f-39e55167160d": "ga01",
  "b9406f46-f7a7-4e66-9b69-a3a897c69c90": "ga01",
  "0abea086-8093-4308-badc-3ee94c285cd6": "ga02",
  "f54eaf72-d60c-40cb-9c49-e91d12247ff1": "ga02",
};

const DEFAULT_KNOWN_STAFF = [
  { id: "stf-101", staffId: "STF-101", referralId: "REF-20551", name: "Sarah Jenkins", createdByAdminId: "GA01" },
  { id: "stf-102", staffId: "STF-102", referralId: "REF-20552", name: "Michael Chang", createdByAdminId: "GA01" },
  { id: "stf-103", staffId: "STF-103", referralId: "REF-20554", name: "David Miller", createdByAdminId: "GA02" },
];

const DEFAULT_KNOWN_ADMINS = [
  { id: "adm-01", account_id: "GA01", name: "Administrator GA01", email: "ga01@example.com" },
  { id: "adm-02", account_id: "GA02", name: "Administrator GA02", email: "ga02@example.com" },
  { id: "263f859e-2088-444b-b4aa-93a009c9c844", account_id: "GA01", name: "Administrator GA01", email: "ga01@example.com" },
  { id: "53584982-2157-4c20-818f-39e55167160d", account_id: "GA01", name: "Administrator GA01", email: "ga01@example.com" },
  { id: "b9406f46-f7a7-4e66-9b69-a3a897c69c90", account_id: "GA01", name: "Administrator GA01", email: "ga01@example.com" },
  { id: "0abea086-8093-4308-badc-3ee94c285cd6", account_id: "GA02", name: "Administrator GA02", email: "ga02@example.com" },
  { id: "f54eaf72-d60c-40cb-9c49-e91d12247ff1", account_id: "GA02", name: "Administrator GA02", email: "ga02@example.com" },
];

export function useAdminAccess() {
  const { session } = useAdminAuth();
  const { data: dbStaff } = useDbSlaStaff();
  const { data: dbAdmins } = useDbSlaAdmins();

  return useMemo(() => {
    // If no session is active or dev preview, default to platform-wide access
    if (!session) {
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

    const emailLower = (session.email || "").toLowerCase().trim();
    const roleLower = (session.role || "").toLowerCase().trim();
    const isOwner = roleLower === "owner" || SUPER_OWNER_EMAILS.has(emailLower);

    // Owner role can see all resellers and transactions across the platform
    if (isOwner) {
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

    const dbStaffMapped = (dbStaff ?? []).map(dbStaffToLegacy);
    const allStaff = dbStaffMapped.length > 0 ? dbStaffMapped : DEFAULT_KNOWN_STAFF;
    const allAdmins = (dbAdmins && dbAdmins.length > 0) ? dbAdmins : DEFAULT_KNOWN_ADMINS;

    // Admin role: Can see their related resellers bound to their Admin ID / Referral codes and their staff
    if (roleLower === "admin") {
      const currentAdmin = allAdmins.find(
        (a: any) =>
          (session.accountId && a.account_id?.toLowerCase() === session.accountId?.toLowerCase()) ||
          (session.uid && a.id === session.uid) ||
          (session.email && a.email?.toLowerCase() === session.email?.toLowerCase())
      );

      const resolvedAccountId = session.accountId || currentAdmin?.account_id || "GA01";

      const adminIdentifiers = new Set<string>(
        [
          resolvedAccountId,
          session.accountId,
          session.uid,
          session.email?.toLowerCase(),
          currentAdmin?.account_id,
          currentAdmin?.id,
        ].filter(Boolean) as string[]
      );

      // Find staff assigned to or created by this admin
      const myStaff = allStaff.filter((s: any) => {
        const staffAdminId = s.createdByAdminId;
        return (
          adminIdentifiers.has(staffAdminId) ||
          (session.accountId && staffAdminId?.toLowerCase() === session.accountId.toLowerCase()) ||
          (resolvedAccountId && staffAdminId?.toLowerCase() === resolvedAccountId.toLowerCase()) ||
          (session.uid && staffAdminId === session.uid) ||
          (currentAdmin?.id && staffAdminId === currentAdmin.id) ||
          (currentAdmin?.account_id && staffAdminId?.toLowerCase() === currentAdmin.account_id.toLowerCase())
        );
      });

      const myStaffIds = myStaff.map((s: any) => s.staffId).filter(Boolean) as string[];
      const myStaffDocIds = myStaff.map((s: any) => s.id).filter(Boolean) as string[];
      const myStaffNames = myStaff.map((s: any) => s.name?.toLowerCase().trim()).filter(Boolean) as string[];

      // All referral codes associated with this Admin and their staff team
      const allowedReferralIds = Array.from(
        new Set([
          ...myStaff.map((s: any) => s.referralId),
          resolvedAccountId,
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

        const resAdminMember = String(
          reseller.adminMember ||
          reseller.memberOfAdminId ||
          reseller.admin_id ||
          reseller.adminId ||
          reseller.adminName ||
          reseller.admin_username ||
          ""
        ).toLowerCase().trim();

        const resReferralId = String(
          reseller.referralId ||
          reseller.referral_id ||
          reseller.referralCode ||
          reseller.referral_code ||
          ""
        ).toLowerCase().trim();

        const resReferredBy = String(
          reseller.referredBy ||
          reseller.referred_by ||
          reseller.staff_id ||
          reseller.staffId ||
          reseller.referred_by_staff_id ||
          ""
        ).toLowerCase().trim();

        const resStaffName = String(
          reseller.staffName ||
          reseller.staff_name ||
          reseller.staffUsername ||
          reseller.staff_username ||
          ""
        ).toLowerCase().trim();

        // 1. Match Admin Identifier (direct or mapped UUID)
        const mappedAccount = ADMIN_UUID_TO_ACCOUNT[resAdminMember];
        if (
          resAdminMember &&
          (allowedAdminIds.some((id) => id.toLowerCase().trim() === resAdminMember) ||
           (mappedAccount && allowedAdminIds.some((id) => id.toLowerCase().trim() === mappedAccount)))
        ) {
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
    if (roleLower === "user" || roleLower === "staff") {
      const me = allStaff.find(
        (s: any) =>
          (session.accountId && s.staffId?.toLowerCase() === session.accountId?.toLowerCase()) ||
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

        const resReferralId = String(
          reseller.referralId ||
          reseller.referral_id ||
          reseller.referralCode ||
          reseller.referral_code ||
          ""
        ).toLowerCase().trim();

        const resReferredBy = String(
          reseller.referredBy ||
          reseller.referred_by ||
          reseller.staff_id ||
          reseller.staffId ||
          reseller.referred_by_staff_id ||
          ""
        ).toLowerCase().trim();

        const resStaffName = String(
          reseller.staffName ||
          reseller.staff_name ||
          reseller.staffUsername ||
          reseller.staff_username ||
          ""
        ).toLowerCase().trim();

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
