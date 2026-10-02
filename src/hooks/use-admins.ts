import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "User"; // Mapping from db roles
  lastLogin: string;
  status: "Active" | "Inactive" | "Suspended";
  accountId?: string;
}

export function useAdmins() {
  return useQuery({
    queryKey: ["admins"],
    queryFn: async () => {
      try {
        const [usersRes, slaAdminsRes, slaStaffRes] = await Promise.all([
          supabase.from("users").select("*"),
          supabase.from("sla_admins").select("*"),
          supabase.from("sla_staff").select("*")
        ]);

        const adminMap = new Map<string, AdminUser>();

        // 1. SLA Admins
        (slaAdminsRes.data || []).forEach((a: any) => {
          const email = (a.email || "").toLowerCase().trim();
          const key = email || a.id;
          adminMap.set(key, {
            id: a.id,
            name: a.name || a.username || a.account_id || "Admin",
            email: a.email || "",
            role: "Admin",
            lastLogin: a.last_login || a.joined_at || "",
            status: a.status === "Inactive" || a.status === "Suspended" ? a.status : "Active",
            accountId: a.account_id
          });
        });

        // 2. SLA Staff
        (slaStaffRes.data || []).forEach((s: any) => {
          const email = (s.email || "").toLowerCase().trim();
          const key = email || s.id;
          adminMap.set(key, {
            id: s.id,
            name: s.name || s.username || s.staff_id || "Staff Member",
            email: s.email || "",
            role: "User",
            lastLogin: s.last_active || s.joined_at || "",
            status: s.status === "Inactive" || s.status === "Suspended" ? s.status : "Active",
            accountId: s.staff_id
          });
        });

        // 3. Registered Users with roles
        (usersRes.data || []).forEach((u: any) => {
          const email = (u.email || "").toLowerCase().trim();
          const key = email || u.id;
          const role = u.role === "owner" ? "Owner" : u.role === "admin" ? "Admin" : u.role === "staff" ? "User" : null;
          
          if (role) {
            const existing = adminMap.get(key);
            const name = `${u.first_name || ""} ${u.last_name || ""}`.trim() || existing?.name || "Admin User";
            adminMap.set(key, {
              id: u.id,
              name: name,
              email: u.email || "",
              role: role,
              lastLogin: u.created_at || existing?.lastLogin || "",
              status: (u.status as any) || existing?.status || "Active",
              accountId: u.account_id || existing?.accountId
            });
          }
        });

        return Array.from(adminMap.values());
      } catch (error) {
        console.error("Error fetching admins from Supabase:", error);
        return [];
      }
    },
    staleTime: 5000,
  });
}
