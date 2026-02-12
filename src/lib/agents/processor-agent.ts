/**
 * NEXAPRIME - PROCESSOR AGENT (UPDATED WITH THREE-WAY COORDINATION)
 * Gap #2: Processor Three-Way Coordination - FULLY IMPLEMENTED
 */

import { supabase } from "@/lib/database/supabase";

export class ProcessorAgent {
  private agentId: string;
  private companyId: string;
  private profile: any;

  constructor(agent: any, profile: any) {
    this.agentId = agent.id;
    this.companyId = agent.company_id;
    this.profile = profile;
  }

  async runCycle(): Promise<{ actions: number; errors: string[] }> {
    const actions: string[] = [];
    const errors: string[] = [];

    try {
      // Step 1: Post service offers
      const servicesPosted = await this.postServiceOffers();
      actions.push(`Posted ${servicesPosted} service offers`);

      // Step 2: Find buyer demand (backwards chaining)
      const buyerDemands = await this.findBuyerDemand();
      actions.push(`Found ${buyerDemands.length} buyer demands`);

      // Step 3: Source matching inputs
      const inputsSourced = await this.sourceMatchingInputs(buyerDemands);
      actions.push(`Sourced ${inputsSourced} inputs`);

      // Step 4: Propose three-way deals (NOW FULLY IMPLEMENTED!)
      const dealsProposed = await this.proposeThreeWayDeals();
      actions.push(`Proposed ${dealsProposed} three-way deals`);
    } catch (error: any) {
      errors.push(error.message);
    }

    return { actions: actions.length, errors };
  }

  /**
   * Post processing service offers
   */
  private async postServiceOffers(): Promise<number> {
    if (!this.profile.processing_services) return 0;

    let posted = 0;

    for (const service of this.profile.processing_services) {
      // Check if offer exists
      const { data: existingOffer } = await supabase
        .from("agent_feed")
        .select("id")
        .eq("agent_id", this.agentId)
        .eq("post_type", "offer")
        .contains("content", { service_type: service })
        .eq("is_active", true)
        .single();

      if (existingOffer) continue;

      const capacityAvailable = Math.round(
        (this.profile.processing_capacity_tons_month || 0) *
          (1 - (this.profile.current_utilization_percentage || 0) / 100),
      );

      if (capacityAvailable < 10) continue; // Skip if low capacity

      const { error } = await supabase.from("agent_feed").insert({
        agent_id: this.agentId,
        post_type: "offer",
        content: {
          service_type: service,
          input_materials: this.profile.input_materials,
          output_materials: this.profile.output_materials,
          capacity_available: capacityAvailable,
          processing_fee: this.profile.processing_fee_per_ton?.[service] || 75,
          turnaround_days: 7,
          quality_guarantee: this.profile.output_quality_guarantee,
        },
        locality: "regional",
        visibility: "public",
        expires_at: new Date(
          Date.now() + 60 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      });

      if (!error) posted++;
    }

    return posted;
  }

  /**
   * BACKWARDS CHAINING: Find what buyers want
   */
  private async findBuyerDemand(): Promise<any[]> {
    // Find buy requests for our output materials
    const { data: buyRequests } = await supabase
      .from("agent_feed")
      .select("*")
      .eq("post_type", "request")
      .eq("is_active", true)
      .in("content->material_category", this.profile.output_materials);

    return buyRequests || [];
  }

  /**
   * Source inputs that match buyer demand
   */
  private async sourceMatchingInputs(buyerDemands: any[]): Promise<number> {
    let sourced = 0;

    for (const demand of buyerDemands) {
      const outputNeeded = demand.content.material_category;

      // Find what input we need to produce this output
      // Simple mapping: assume 1:1 for MVP (e.g., plastic-scrap → recycled-plastic)
      const inputNeeded = this.profile.input_materials.find((input: string) =>
        input.includes(outputNeeded.split("-")[0]),
      );

      if (!inputNeeded) continue;

      // Search for offers of this input
      const { data: inputOffers } = await supabase
        .from("agent_feed")
        .select("*")
        .eq("post_type", "offer")
        .eq("is_active", true)
        .contains("content", { material_category: inputNeeded });

      if (inputOffers && inputOffers.length > 0) {
        // Found matching input! Mark for three-way deal
        sourced++;
      }
    }

    return sourced;
  }

  /**
   * Propose three-way deals (supplier → processor → buyer)
   * Gap #2: Processor Three-Way Coordination - FULLY IMPLEMENTED!
   */
  private async proposeThreeWayDeals(): Promise<number> {
    console.log("🔄 Searching for three-way processing opportunities...");

    let dealsProposed = 0;

    // Find all active buy requests that match our output
    const { data: buyRequests } = await supabase
      .from("agent_feed")
      .select("*")
      .eq("post_type", "request")
      .eq("is_active", true)
      .in("content->material_category", this.profile.output_materials);

    if (!buyRequests || buyRequests.length === 0) {
      console.log("No buyer demand found");
      return 0;
    }

    for (const buyRequest of buyRequests) {
      const buyerContent = buyRequest.content as any;
      const outputNeeded = buyerContent.material_category;
      const volumeNeeded = buyerContent.volume_needed;

      // Determine what input we need to create this output
      const inputMaterial = this.mapOutputToInput(outputNeeded);

      if (!inputMaterial) {
        console.log(`No input mapping for output: ${outputNeeded}`);
        continue;
      }

      // Find suppliers of this input material
      const { data: inputOffers } = await supabase
        .from("agent_feed")
        .select("*, agent:agent_id(company_id)")
        .eq("post_type", "offer")
        .eq("is_active", true)
        .contains("content", { material_category: inputMaterial });

      if (!inputOffers || inputOffers.length === 0) {
        console.log(`No suppliers found for input: ${inputMaterial}`);
        continue;
      }

      // Take best supplier (lowest price)
      const bestSupplier = inputOffers.sort(
        (a, b) => (a.content as any).price - (b.content as any).price,
      )[0];

      const supplierContent = bestSupplier.content as any;
      const inputPrice = supplierContent.price;
      const inputVolume = supplierContent.volume;

      // Check if we have capacity
      const capacityAvailable =
        (this.profile.processing_capacity_tons_month || 0) *
        (1 - (this.profile.current_utilization_percentage || 0) / 100);

      const processableVolume = Math.min(
        volumeNeeded,
        inputVolume,
        capacityAvailable,
      );

      if (processableVolume < 5) {
        console.log("Insufficient volume or capacity");
        continue;
      }

      // Calculate economics
      const processingFee =
        this.profile.processing_fee_per_ton?.[
          this.profile.processing_services?.[0] || "sorting"
        ] || 75;

      const outputPrice = inputPrice + processingFee + processingFee * 0.15; // 15% margin

      // Check if buyer's max price supports this
      if (outputPrice > buyerContent.max_price) {
        console.log(
          `Economics don't work: €${outputPrice}/ton > buyer max €${buyerContent.max_price}/ton`,
        );
        continue;
      }

      // WE HAVE A MATCH! Structure three-way deal
      const threeWayDeal = await this.structureThreeWayDeal({
        supplier: {
          post_id: bestSupplier.id,
          agent_id: bestSupplier.agent_id,
          company_id: bestSupplier.agent.company_id,
          material: inputMaterial,
          volume: processableVolume,
          price: inputPrice,
        },
        processor: {
          company_id: this.companyId,
          agent_id: this.agentId,
          processing_fee: processingFee,
          input_material: inputMaterial,
          output_material: outputNeeded,
          processing_time_days: 7,
        },
        buyer: {
          post_id: buyRequest.id,
          agent_id: buyRequest.agent_id,
          material: outputNeeded,
          volume: processableVolume,
          max_price: buyerContent.max_price,
          final_price: outputPrice,
        },
      });

      if (threeWayDeal) {
        dealsProposed++;
        console.log(`✅ Three-way deal structured: ${threeWayDeal.id}`);
      }
    }

    console.log(`📊 Proposed ${dealsProposed} three-way deals`);
    return dealsProposed;
  }

  /**
   * Map output material to required input material
   */
  private mapOutputToInput(outputMaterial: string): string | null {
    // Simple mapping rules (expand as needed)
    const mappings: Record<string, string> = {
      "recycled-plastic": "plastic-scrap",
      "recycled-metal": "metal-scrap",
      "recycled-steel": "steel-scrap",
      "recycled-aluminum": "aluminum-scrap",
      "recycled-copper": "copper-scrap",
      "recycled-paper": "paper-scrap",
      "recycled-glass": "glass-scrap",
    };

    // Check direct mapping
    if (mappings[outputMaterial]) {
      return mappings[outputMaterial];
    }

    // Check if we can process any input that creates this output
    for (const input of this.profile.input_materials) {
      for (const output of this.profile.output_materials) {
        if (
          output.includes(outputMaterial) ||
          outputMaterial.includes(output)
        ) {
          return input;
        }
      }
    }

    return null;
  }

  /**
   * Structure and create three-way deal
   */
  private async structureThreeWayDeal(params: {
    supplier: {
      post_id: string;
      agent_id: string;
      company_id: string;
      material: string;
      volume: number;
      price: number;
    };
    processor: {
      company_id: string;
      agent_id: string;
      processing_fee: number;
      input_material: string;
      output_material: string;
      processing_time_days: number;
    };
    buyer: {
      post_id: string;
      agent_id: string;
      material: string;
      volume: number;
      max_price: number;
      final_price: number;
    };
  }): Promise<any | null> {
    try {
      // Create three-way deal record
      const { data: threeWayDeal, error } = await supabase
        .from("three_way_deals")
        .insert({
          supplier_company_id: params.supplier.company_id,
          processor_company_id: params.processor.company_id,
          buyer_company_id: await this.getCompanyFromAgent(
            params.buyer.agent_id,
          ),
          material_in: params.supplier.material,
          material_out: params.buyer.material,
          volume_tons_month: params.supplier.volume,
          supplier_price_per_ton: params.supplier.price,
          processing_fee_per_ton: params.processor.processing_fee,
          buyer_price_per_ton: params.buyer.final_price,
          total_value_annual:
            params.buyer.final_price * params.supplier.volume * 12,
          processing_time_days: params.processor.processing_time_days,
          status: "proposed",
          supplier_approved: false,
          processor_approved: true, // We approve our own participation
          buyer_approved: false,
        })
        .select()
        .single();

      if (error) {
        console.error("Failed to create three-way deal:", error);
        return null;
      }

      // Post announcement about three-way opportunity
      await supabase.from("agent_feed").insert({
        agent_id: this.agentId,
        post_type: "announcement",
        content: {
          type: "three_way_processing_deal",
          title: "Three-Way Processing Opportunity",
          description: `Processor coordinating: ${params.supplier.material} (${params.supplier.volume} tons/month) → processing → ${params.buyer.material}`,
          supplier_post_id: params.supplier.post_id,
          buyer_post_id: params.buyer.post_id,
          three_way_deal_id: threeWayDeal.id,
          value_breakdown: {
            supplier_receives: params.supplier.price,
            processing_fee: params.processor.processing_fee,
            buyer_pays: params.buyer.final_price,
          },
          annual_value: threeWayDeal.total_value_annual,
        },
        locality: "regional",
        visibility: "public",
      });

      // Notify supplier
      await this.notifyParty(
        params.supplier.company_id,
        threeWayDeal.id,
        "supplier",
        params.supplier.price * params.supplier.volume * 12,
      );

      // Notify buyer
      await this.notifyParty(
        await this.getCompanyFromAgent(params.buyer.agent_id),
        threeWayDeal.id,
        "buyer",
        (params.buyer.max_price - params.buyer.final_price) *
          params.supplier.volume *
          12,
      );

      return threeWayDeal;
    } catch (error) {
      console.error("Error structuring three-way deal:", error);
      return null;
    }
  }

  /**
   * Get company ID from agent ID
   */
  private async getCompanyFromAgent(agentId: string): Promise<string> {
    const { data } = await supabase
      .from("agents")
      .select("company_id")
      .eq("id", agentId)
      .single();

    return data?.company_id || "";
  }

  /**
   * Notify party about three-way deal
   */
  private async notifyParty(
    companyId: string,
    dealId: string,
    role: "supplier" | "buyer",
    annualValue: number,
  ): Promise<void> {
    const { data: company } = await supabase
      .from("companies")
      .select("user_id")
      .eq("id", companyId)
      .single();

    if (!company?.user_id) return;

    const message =
      role === "supplier"
        ? `A processor wants to buy your material for €${Math.round(annualValue).toLocaleString()}/year. They will process and resell it.`
        : `A processor can supply you with processed material, saving you €${Math.round(annualValue).toLocaleString()}/year vs virgin material.`;

    await supabase.from("notifications").insert({
      user_id: company.user_id,
      company_id: companyId,
      type: "three_way_deal_proposed",
      title: "Three-Way Processing Deal",
      message,
      action_url: `/dashboard/deals/three-way/${dealId}`,
    });
  }
}
