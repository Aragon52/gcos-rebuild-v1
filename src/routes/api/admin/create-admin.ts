import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const bodySchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(1),
  role: z.string().min(1),
  creatorId: z.string().optional().nullable(),
});

export const Route = createFileRoute("/api/admin/create-admin")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: z.infer<typeof bodySchema>;
        try {
          body = bodySchema.parse(await request.json());
        } catch {
          return Response.json({ error: "Missing required fields." }, { status: 400 });
        }
        const { firstName, lastName, email, password, role, creatorId } = body;

        const supabaseUrl = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"] ?? "";
        const supabaseServiceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? "";
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        const normalizedEmail = email.toLowerCase().trim();
        let userId: string | undefined;

        try {
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: normalizedEmail,
            password,
            email_confirm: true,
          });
          if (authError) throw authError;
          userId = authData.user.id;

          try {
            const { error: userError } = await supabase.from("users").insert({
              id: userId,
              email: normalizedEmail,
              first_name: firstName.trim(),
              last_name: lastName.trim(),
              role: role.toLowerCase(),
              created_at: new Date().toISOString(),
            });
            if (userError) throw userError;

            const nameCombined = `${firstName.trim()} ${lastName.trim()}`;

            if (role.toLowerCase() === "admin") {
              const accountId = "ADM-" + Math.random().toString(36).substring(2, 8).toUpperCase();
              const { error: adminError } = await supabase.from("sla_admins").insert({
                id: userId,
                name: nameCombined,
                email: normalizedEmail,
                account_id: accountId,
                status: "Active",
                created_at: new Date().toISOString(),
              });
              if (adminError) throw adminError;
            } else if (role.toLowerCase() === "staff" || role.toLowerCase() === "user") {
              let createdByAdminId: string | null = null;
              let adminAccountId: string | null = null;
              if (creatorId) {
                const { data: adminRecord } = await supabase
                  .from("sla_admins")
                  .select("id, account_id")
                  .eq("id", creatorId)
                  .limit(1)
                  .maybeSingle();

                if (adminRecord) {
                  createdByAdminId = adminRecord.id;
                  adminAccountId = adminRecord.account_id;
                } else {
                  const { data: adminRecordAlt } = await supabase
                    .from("sla_admins")
                    .select("id, account_id")
                    .eq("account_id", creatorId)
                    .limit(1)
                    .maybeSingle();
                  if (adminRecordAlt) {
                    createdByAdminId = adminRecordAlt.id;
                    adminAccountId = adminRecordAlt.account_id;
                  }
                }
              }

              if (!createdByAdminId) {
                const { data: adminFallback } = await supabase
                  .from("sla_admins")
                  .select("id, account_id")
                  .limit(1)
                  .maybeSingle();
                createdByAdminId = adminFallback?.id || null;
                adminAccountId = adminFallback?.account_id || null;
              }

              let generatedStaffId: string | null = null;
              if (adminAccountId) {
                const { data: existingStaff } = await supabase
                  .from("sla_staff")
                  .select("id")
                  .eq("created_by_admin_id", createdByAdminId);
                const staffCount = existingStaff ? existingStaff.length : 0;
                generatedStaffId = `${adminAccountId}S${String(staffCount + 1).padStart(2, "0")}`;
              }

              const referralId = generatedStaffId
                ? `${generatedStaffId}${Math.random().toString(36).substring(2, 5).toUpperCase()}`
                : "STF-" + Math.random().toString(36).substring(2, 8).toUpperCase();

              const { error: staffError } = await supabase.from("sla_staff").insert({
                id: userId,
                name: nameCombined,
                email: normalizedEmail,
                username: normalizedEmail.split("@")[0],
                referral_id: referralId,
                created_by_admin_id: createdByAdminId,
                staff_id: generatedStaffId,
                created_at: new Date().toISOString(),
              });
              if (staffError) throw staffError;
            }

            return Response.json({ success: true, userId });
          } catch (dbError) {
            console.error("Database insert failed. Slicing/rolling back Supabase Auth User:", dbError);
            await supabase.auth.admin.deleteUser(userId);
            throw dbError;
          }
        } catch (error) {
          console.error("Create admin account error:", error);
          return Response.json(
            { error: error instanceof Error ? error.message : "Failed to create administrator/staff member." },
            { status: 500 },
          );
        }
      },
    },
  },
});
