"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/database/supabase";

export default function PendingDealsPage() {
  const { company } = useAuth();
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingDeals();
  }, [company]);

  const loadPendingDeals = async () => {
    if (!company) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("deals")
        .select(
          `
          *,
          seller_company:seller_company_id (name),
          buyer_company:buyer_company_id (name)
        `,
        )
        .or(
          `seller_company_id.eq.${company.id},buyer_company_id.eq.${company.id}`,
        )
        .in("status", ["pending_seller_approval", "pending_buyer_approval"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDeals(data || []);
    } catch (error) {
      console.error("Error loading deals:", error);
    } finally {
      setLoading(false);
    }
  };

  // Replace the approveDeal and rejectDeal functions with:

  const approveDeal = async (dealId: string) => {
    if (!confirm("Approve this deal?")) return;

    try {
      const res = await fetch("/api/deals/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deal_id: dealId, action: "approve" }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to approve deal");
      }

      alert(data.message);
      loadPendingDeals();
    } catch (error: any) {
      console.error("Error approving deal:", error);
      alert(error.message || "Failed to approve deal");
    }
  };

  const rejectDeal = async (dealId: string) => {
    if (!confirm("Reject this deal? This cannot be undone.")) return;

    try {
      const res = await fetch("/api/deals/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deal_id: dealId, action: "reject" }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to reject deal");
      }

      alert(data.message);
      loadPendingDeals();
    } catch (error: any) {
      console.error("Error rejecting deal:", error);
      alert(error.message || "Failed to reject deal");
    }
  };
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Pending Deal Approvals
        </h1>
        <p className="mt-2 text-gray-600">
          Review and approve deals negotiated by your agent
        </p>
      </div>

      {deals.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <p className="text-gray-500">No pending deals</p>
        </div>
      ) : (
        <div className="space-y-4">
          {deals.map((deal) => (
            <div key={deal.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        deal.status === "pending_seller_approval"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {deal.status === "pending_seller_approval"
                        ? "Awaiting Your Approval (Seller)"
                        : "Awaiting Buyer Approval"}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {deal.volume} tons {deal.material_category}
                  </h3>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-600">Seller:</span>
                      <span className="ml-2 font-medium">
                        {deal.seller_company?.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Buyer:</span>
                      <span className="ml-2 font-medium">
                        {deal.buyer_company?.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Price:</span>
                      <span className="ml-2 font-bold text-green-600">
                        €{deal.price_per_unit}/{deal.unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Value:</span>
                      <span className="ml-2 font-bold">
                        €{deal.total_value.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Quality:</span>
                      <span className="ml-2 font-medium">
                        Tier {deal.quality_tier}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Payment Terms:</span>
                      <span className="ml-2 font-medium">
                        {deal.payment_terms}
                      </span>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-blue-900 mb-1">
                      Agent Recommendation:
                    </p>
                    <p className="text-sm text-blue-800">
                      {deal.agent_reasoning}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {((deal.status === "pending_seller_approval" &&
                deal.seller_company_id === company?.id) ||
                (deal.status === "pending_buyer_approval" &&
                  deal.buyer_company_id === company?.id)) && (
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => approveDeal(deal.id)}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                  >
                    ✅ Approve Deal
                  </button>
                  <button
                    onClick={() => rejectDeal(deal.id)}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                  >
                    ❌ Reject Deal
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
