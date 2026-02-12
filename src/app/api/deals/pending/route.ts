import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database/supabase";
import { supabaseAdmin } from "@/lib/database/supabase-admin";

export async function GET(request: NextRequest) {
  try {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's company
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (companyError || !company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Get pending deals where user's company is involved
    // Use admin client to bypass RLS issues
    const { data: deals, error: dealsError } = await supabaseAdmin
      .from("deals")
      .select(
        `
        *,
        seller_agent:agents!seller_agent_id(id, name, company_id),
        buyer_agent:agents!buyer_agent_id(id, name, company_id),
        passport:material_passports(id, material_category, material_subtype, volume, unit, quality_tier)
      `,
      )
      .or(
        `seller_company_id.eq.${company.id},buyer_company_id.eq.${company.id}`,
      )
      .in("status", ["pending_seller_approval", "pending_buyer_approval"])
      .order("created_at", { ascending: false });

    if (dealsError) {
      console.error("Deals fetch error:", dealsError);
      return NextResponse.json(
        { error: "Failed to fetch deals" },
        { status: 500 },
      );
    }

    // Filter to only deals that need THIS user's approval
    const pendingDeals = (deals || []).filter((deal) => {
      const isSeller = deal.seller_company_id === company.id;
      const isBuyer = deal.buyer_company_id === company.id;

      if (isSeller && deal.status === "pending_seller_approval") {
        return true;
      }
      if (isBuyer && deal.status === "pending_buyer_approval") {
        return true;
      }
      return false;
    });

    return NextResponse.json({
      success: true,
      deals: pendingDeals,
      count: pendingDeals.length,
    });
  } catch (error: any) {
    console.error("Pending deals error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch pending deals" },
      { status: 500 },
    );
  }
}