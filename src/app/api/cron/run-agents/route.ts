import { NextResponse } from "next/server";
import { AgentRunner } from "@/lib/agents/agent-runner";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // 60 seconds timeout

export async function GET() {
  console.log("🤖 CRON: Starting agent cycle...");

  try {
    const result = await AgentRunner.runAllAgents();

    console.log("✅ CRON: Agent cycle complete", result.stats);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      stats: result.stats,
    });
  } catch (error: any) {
    console.error("❌ CRON: Agent cycle failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

// Allow POST as well for manual triggers
export async function POST() {
  return GET();
}
