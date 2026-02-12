/**
 * NEXAAPEX - SUPER AGENT (UPDATED WITH FULL COORDINATION)
 * Gap #1: Multi-Party Deal Structuring - IMPLEMENTED
 * Gap #5: Cross-Locality Coordination - IMPLEMENTED
 */

import { supabase } from "@/lib/database/supabase";
import {
  MultiPartyCoordinator,
  SymbiosisOpportunity,
} from "./multi-party-coordinator";
import { CrossLocalityCoordinator } from "./cross-locality-coordinator";

const supabaseAdmin = supabase;

export class SuperAgent {
  private agentId: string;
  private locality: string;
  private constraints: any;

  constructor(agent: any) {
    this.agentId = agent.id;
    this.locality = agent.locality;
    this.constraints = agent.constraints || {};
  }

  async runCycle(): Promise<{ actions: number; errors: string[] }> {
    const actions: string[] = [];
    const errors: string[] = [];

    try {
      // Step 1: Analyze material flows in locality
      const flows = await this.analyzeMaterialFlows();
      actions.push(`Analyzed ${flows.length} material flows`);

      // Step 2: Detect circular patterns (symbiosis)
      const symbioses = await this.detectSymbiosis(flows);
      actions.push(`Detected ${symbioses.length} symbiosis patterns`);

      // Step 3: Announce AND STRUCTURE high-value opportunities (GAP #1)
      const structured = await this.structureSymbioses(symbioses);
      actions.push(`Structured ${structured} multi-party deals`);

      // Step 4: Cross-locality coordination (GAP #5)
      const crossLocalityDeals = await this.coordinateCrossLocality();
      actions.push(`Coordinated ${crossLocalityDeals} cross-locality deals`);
    } catch (error: any) {
      errors.push(error.message);
    }

    return { actions: actions.length, errors };
  }

  /**
   * Analyze material flows in locality
   */
  private async analyzeMaterialFlows(): Promise<any[]> {
    // Get all companies in locality
    const { data: companies } = await supabaseAdmin
      .from("companies")
      .select("id, name")
      .ilike("location->>city", `%${this.locality}%`);

    if (!companies) return [];

    const flows: any[] = [];

    for (const company of companies) {
      // Get their waste streams (outputs)
      const { data: outputs } = await supabaseAdmin
        .from("waste_streams")
        .select("material_type, material_category, monthly_volume")
        .eq("company_id", company.id);

      // Get their material requirements (inputs)
      const { data: inputs } = await supabaseAdmin
        .from("materials")
        .select("material_type, material_category, monthly_volume")
        .eq("company_id", company.id)
        .eq("source_type", "requirement");

      flows.push({
        company_id: company.id,
        company_name: company.name,
        outputs: outputs || [],
        inputs: inputs || [],
      });
    }

    return flows;
  }

  /**
   * Detect circular symbiosis patterns (3+ companies)
   */
  private async detectSymbiosis(flows: any[]): Promise<SymbiosisOpportunity[]> {
    const symbioses: SymbiosisOpportunity[] = [];

    // Simple 3-way pattern detection: A produces X, B needs X and produces Y, C needs Y
    for (let i = 0; i < flows.length; i++) {
      const companyA = flows[i];

      for (const outputA of companyA.outputs) {
        // Find who needs this output
        for (let j = 0; j < flows.length; j++) {
          if (i === j) continue;
          const companyB = flows[j];

          const matchingInputB = companyB.inputs.find(
            (inp: any) => inp.material_category === outputA.material_category,
          );

          if (!matchingInputB) continue;

          // Found A → B connection
          // Now check if B produces something that someone else needs
          for (const outputB of companyB.outputs) {
            for (let k = 0; k < flows.length; k++) {
              if (k === i || k === j) continue;
              const companyC = flows[k];

              const matchingInputC = companyC.inputs.find(
                (inp: any) =>
                  inp.material_category === outputB.material_category,
              );

              if (!matchingInputC) continue;

              // Found A → B → C symbiosis!
              const annualVolume =
                Math.min(
                  outputA.monthly_volume,
                  matchingInputB.monthly_volume,
                  outputB.monthly_volume,
                  matchingInputC.monthly_volume,
                ) * 12;

              // Estimate value (simplified)
              const estimatedValue = annualVolume * 100; // €100/ton average

              // Estimate carbon savings (simplified)
              const carbonSaved = annualVolume * 0.5; // 0.5 tons CO₂/ton material

              // Check if meets minimum criteria
              const meetsCriteria =
                estimatedValue >= 25000 || // €25k/year
                carbonSaved >= 50; // 50 tons CO₂/year

              if (meetsCriteria) {
                // Build detailed flows for structuring
                const detailedFlows = [
                  {
                    from_company_id: companyA.company_id,
                    to_company_id: companyB.company_id,
                    material_category: outputA.material_category,
                    volume: Math.min(
                      outputA.monthly_volume,
                      matchingInputB.monthly_volume,
                    ),
                    price: 100, // Placeholder
                  },
                  {
                    from_company_id: companyB.company_id,
                    to_company_id: companyC.company_id,
                    material_category: outputB.material_category,
                    volume: Math.min(
                      outputB.monthly_volume,
                      matchingInputC.monthly_volume,
                    ),
                    price: 100,
                  },
                ];

                symbioses.push({
                  companies: [
                    companyA.company_name,
                    companyB.company_name,
                    companyC.company_name,
                  ],
                  company_ids: [
                    companyA.company_id,
                    companyB.company_id,
                    companyC.company_id,
                  ],
                  flow: `${outputA.material_category} → ${outputB.material_category}`,
                  annual_volume: annualVolume,
                  estimated_value: estimatedValue,
                  carbon_saved: carbonSaved,
                  score:
                    estimatedValue * 0.4 +
                    carbonSaved * 300 * 0.3 +
                    3 * 1000 * 0.2 +
                    100 * 0.1,
                  flows: detailedFlows,
                });
              }
            }
          }
        }
      }
    }

    // Sort by score and return top opportunities
    return symbioses.sort((a, b) => b.score - a.score).slice(0, 5);
  }

  /**
   * Structure symbioses into actual multi-party deals (GAP #1 SOLUTION)
   */
  private async structureSymbioses(
    symbioses: SymbiosisOpportunity[],
  ): Promise<number> {
    let structured = 0;

    for (const symbiosis of symbioses) {
      // Check if already structured
      const { data: existingDeal } = await supabaseAdmin
        .from("multi_party_deals")
        .select("id")
        .contains("participating_company_ids", symbiosis.company_ids)
        .in("status", ["proposed", "partial_approval", "all_approved"])
        .single();

      if (existingDeal) continue;

      // USE NEW MULTI-PARTY COORDINATOR!
      const multiPartyDeal = await MultiPartyCoordinator.structureDeal(
        symbiosis,
        this.agentId,
      );

      if (multiPartyDeal) {
        structured++;
        console.log(
          `✅ NexaApex structured ${symbiosis.companies.length}-party deal worth €${Math.round(multiPartyDeal.total_value).toLocaleString()}/year`,
        );
      }
    }

    return structured;
  }

  /**
   * Coordinate with other NexaApex agents (GAP #5 SOLUTION)
   */
  private async coordinateCrossLocality(): Promise<number> {
    console.log(
      `🌐 ${this.locality} NexaApex: Starting cross-locality coordination...`,
    );

    // Use new Cross-Locality Coordinator
    const { surpluses, deficits, matches } =
      await CrossLocalityCoordinator.analyzeCrossLocalityOpportunities();

    let dealsNegotiated = 0;

    // For each match, negotiate deal
    for (const match of matches) {
      // Skip if we're not involved in this match
      if (
        match.surplus.super_agent_id !== this.agentId &&
        match.deficit.super_agent_id !== this.agentId
      ) {
        continue;
      }

      // Check if already negotiated
      const { data: existingDeal } = await supabaseAdmin
        .from("cross_locality_deals")
        .select("id")
        .eq("source_locality", match.surplus.locality)
        .eq("destination_locality", match.deficit.locality)
        .eq("material_category", match.surplus.material_category)
        .in("status", ["proposed", "negotiating", "agreed"])
        .single();

      if (existingDeal) continue;

      // Negotiate cross-locality deal
      const deal = await CrossLocalityCoordinator.negotiateCrossLocalityDeal(
        match.surplus,
        match.deficit,
      );

      if (deal) {
        dealsNegotiated++;
        console.log(
          `✅ Cross-locality deal: ${match.surplus.locality} → ${match.deficit.locality} (${match.surplus.material_category})`,
        );
      }
    }

    console.log(
      `📊 ${this.locality} NexaApex coordinated ${dealsNegotiated} cross-locality deals`,
    );
    return dealsNegotiated;
  }
}
