import { AdminSecurityActivityCard } from "@/components/admin/AdminSecurityActivityCard";

export function AdminSecurityPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Security and Sessions</h1>
        <p className="text-sm text-muted-foreground">
          Monitor admin sign-in activity, IP addresses, and session behavior.
        </p>
      </div>
      <AdminSecurityActivityCard />
    </div>
  );
}

export default AdminSecurityPage;
