import { useEffect, useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: "Pending" | "Ongoing" | "Completed" | "Cancelled" | "Shipped";
  createdAt: string;
  items: number; 
  products: number; 
  resellerId: string;
  staffUsername: string;
  adminUsername: string;
  totalCost: number;
  serviceCost: number;
  profits: number;
  referralId?: string;
  memberOfAdminId?: string;
}

// Helper to resolve the correct Reseller UID
async function resolveResellerId(maybeId: string): Promise<string | null> {
  if (!maybeId) return null;
  const targetId = String(maybeId).trim();
  
  // 1. Check if it's the actual ID
  const { data: direct } = await supabase.from('reseller_profiles').select('id').eq('id', targetId).single();
  if (direct) return direct.id;

  // 2. Extract numeric digits
  const digitsMatch = targetId.match(/\d+/);
  if (digitsMatch) {
    const numId = parseInt(digitsMatch[0]);
    const { data: byNumId } = await supabase.from('reseller_profiles').select('id').eq('reseller_id', numId).single();
    if (byNumId) return byNumId.id;
  }

  return null;
}

export function useOrders(pageSize: number = 20) {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const mapDataToOrder = (orderDataRaw: Record<string, unknown>): Order => {
    const orderData = orderDataRaw as Record<string, any>;
    const customerName = orderData.profileName || orderData.customerName || "Unknown";
    const customerEmail = orderData.customerEmail || "";
    
    let status = "Pending";
    const dbStatus = String(orderData.status || "").toLowerCase();
    if (dbStatus === "ongoing" || dbStatus === "shipped") status = "Ongoing";
    else if (dbStatus === "completed" || dbStatus === "delivered") status = "Completed";
    else if (dbStatus === "cancelled") status = "Cancelled";

    const resellerId = orderData.resellerId || orderData.reseller_id || 'N/A';

    return {
      id: orderData.id,
      customerName,
      customerEmail,
      total: Number(orderData.totalAmount || orderData.total_amount || 0),
      status: status as Order["status"],
      createdAt: orderData.created_at || orderData.createdAt || '',
      items: Number(orderData.items_count || 0),
      products: Number(orderData.products_count || 0),
      resellerId: String(resellerId).startsWith('GRS') ? resellerId : `GRS${resellerId}`,
      staffUsername: orderData.staff_username || orderData.staffUsername || 'N/A',
      adminUsername: orderData.admin_username || orderData.adminUsername || 'N/A',
      totalCost: Number(orderData.total_cost || orderData.totalCost || 0),
      serviceCost: Number(orderData.service_cost || orderData.serviceCost || 0),
      profits: Number(orderData.profits || orderData.profit || 0),
      referralId: orderData.referralId || orderData.referred_by_staff_id,
      memberOfAdminId: orderData.memberOfAdminId || orderData.member_of_admin_id,
    };
  };

  useEffect(() => {
    const channel = supabase
      .channel('public:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        queryClient.invalidateQueries({ queryKey: ["orders"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return;
    
    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const from = nextPage * pageSize;
      const to = from + pageSize - 1;

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to);
      
      if (error) throw error;

      const nextOrders = (data || []).map(mapDataToOrder);
      
      queryClient.setQueryData(["orders", pageSize], (old: Order[] | undefined) => {
        return [...(old || []), ...nextOrders];
      });

      setCurrentPage(nextPage);
      setHasMore((data || []).length === pageSize);
    } catch (error) {
      console.error("Error loading more orders:", error);
      toast.error("Failed to load more orders");
    } finally {
      setLoadingMore(false);
    }
  }, [currentPage, hasMore, loadingMore, pageSize, queryClient]);

  const queryResult = useQuery({
    queryKey: ["orders", pageSize],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(pageSize);
      
      if (error) throw error;
      
      const orders = (data || []).map(mapDataToOrder);
      setHasMore(orders.length === pageSize);
      setCurrentPage(0);
      return orders;
    },
    staleTime: 30000,
  });

  return {
    ...queryResult,
    loadMore,
    hasMore,
    loadingMore
  };
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: Order["status"] }) => {
      // 1. First attempt to update via admin API endpoint (runs server-side with service-role permissions)
      try {
        const response = await fetch("/api/admin/update-order-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, status }),
        });

        if (response.ok) {
          const resData = await response.json();
          if (resData.success) {
            return;
          }
        }
      } catch (apiErr) {
        console.warn("[USE_ORDERS] API endpoint update failed, falling back to direct Supabase:", apiErr);
      }

      // 2. Direct fallback
      const { data: orderData, error: orderError } = await supabase.from("orders").select("*").eq("id", orderId).single();
      if (orderError || !orderData) throw new Error("Order not found");
      
      const previousStatus = String(orderData.status || "").toLowerCase();
      const newStatus = status;

      const updateData: Record<string, unknown> = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if ((newStatus === "Ongoing") && (previousStatus === "pending" || previousStatus === "processing")) {
        updateData.picked_up_at = new Date().toISOString();
      } else if (newStatus === "Completed" && previousStatus !== "completed") {
        updateData.completed_at = new Date().toISOString();
      }

      const { error: updateError } = await supabase.from("orders").update(updateData).eq("id", orderId);
      if (updateError) throw updateError;
      
      const resellerId = orderData.reseller_id || orderData.resellerId;
      const totalAmount = Number(orderData.total_amount || orderData.total_cost || 0);
      const profit = Number(orderData.profits || orderData.profit || 0);
      const serviceCost = Number(orderData.service_cost || 0);

      if (resellerId) {
        const resolvedId = await resolveResellerId(resellerId);
        if (resolvedId) {
          const { data: profile } = await supabase.from('reseller_profiles').select('*').eq('id', resolvedId).single();
          if (profile) {
             const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
             
             if (newStatus === "Completed" && previousStatus !== "completed") {
                updates.total_earnings = (profile.total_earnings || 0) + profit;
                if (previousStatus === "ongoing" || previousStatus === "shipped") {
                   updates.pending_balance = Math.max(0, (profile.pending_balance || 0) - totalAmount);
                   updates.balance = (profile.balance || 0) + totalAmount;
                } else if (previousStatus === "pending" || previousStatus === "processing") {
                   updates.unpicked_balance = Math.max(0, (profile.unpicked_balance || 0) - totalAmount);
                   updates.balance = (profile.balance || 0) + profit;
                }
             } else if (newStatus === "Cancelled" && previousStatus !== "cancelled") {
                if (previousStatus === "pending" || previousStatus === "processing") {
                   updates.unpicked_balance = Math.max(0, (profile.unpicked_balance || 0) - totalAmount);
                } else if (previousStatus === "ongoing" || previousStatus === "shipped") {
                   updates.pending_balance = Math.max(0, (profile.pending_balance || 0) - totalAmount);
                   updates.balance = (profile.balance || 0) + serviceCost;
                }
             } else if (newStatus === "Ongoing" && (previousStatus === "pending" || previousStatus === "processing")) {
                updates.unpicked_balance = Math.max(0, (profile.unpicked_balance || 0) - totalAmount);
                updates.pending_balance = (profile.pending_balance || 0) + totalAmount;
                updates.balance = (profile.balance || 0) - serviceCost;
             }

             if (Object.keys(updates).length > 1) {
                await supabase.from('reseller_profiles').update(updates).eq('id', resolvedId);
             }
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["resellers"] });
      queryClient.invalidateQueries({ queryKey: ["unified-resellers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-resellers-financial-data"] });
      toast.success("Order status updated successfully");
    },
    onError: (error: Error) => {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    }
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderId: string) => {
      const { data: orderData, error: orderError } = await supabase.from("orders").select("*").eq("id", orderId).single();
      if (orderError || !orderData) throw new Error("Order not found");
      
      const previousStatus = String(orderData.status || "").toLowerCase();
      const resellerId = orderData.reseller_id || orderData.resellerId;
      const totalAmount = Number(orderData.total_amount || orderData.total_cost || 0);
      const serviceCost = Number(orderData.service_cost || 0);

      await supabase.from("orders").update({
        status: "Cancelled",
        updated_at: new Date().toISOString()
      }).eq("id", orderId);

      if (resellerId) {
        const resolvedId = await resolveResellerId(resellerId);
        if (resolvedId) {
          const { data: profile } = await supabase.from('reseller_profiles').select('*').eq('id', resolvedId).single();
          if (profile) {
            const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
            if (previousStatus === "pending" || previousStatus === "processing") {
              updates.unpicked_balance = Math.max(0, (profile.unpicked_balance || 0) - totalAmount);
            } else if (previousStatus === "ongoing") {
              updates.pending_balance = Math.max(0, (profile.pending_balance || 0) - totalAmount);
              updates.balance = (profile.balance || 0) + serviceCost;
            }

            if (Object.keys(updates).length > 1) {
              await supabase.from('reseller_profiles').update(updates).eq('id', resolvedId);
            }
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order cancelled successfully");
    },
    onError: (error: Error) => {
      console.error("Error cancelling order:", error);
      toast.error("Failed to cancel order");
    }
  });
}
