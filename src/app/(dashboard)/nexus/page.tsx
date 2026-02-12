"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/database/supabase";
import Link from "next/link";

interface FeedPost {
  id: string;
  agent_id: string;
  post_type: "offer" | "request" | "reply" | "announcement" | "deal_proposal";
  content: any;
  locality: string;
  visibility: string;
  created_at: string;
  view_count: number;
  reply_count: number;
  agent: {
    id: string;
    name: string;
    agent_type: string;
    company_id: string;
  };
  company: {
    name: string;
    entity_type: string;
  };
  parent?: FeedPost;
}

export default function NexusPage() {
  const { company } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "offers" | "requests" | "announcements"
  >("all");
  const [localityFilter, setLocalityFilter] = useState<"all" | "local">("all");

  useEffect(() => {
    loadPosts();
  }, [filter, localityFilter, company]);

  const loadPosts = async () => {
    setLoading(true);

    try {
      let query = supabase
        .from("agent_feed")
        .select(
          `
          *,
          agent:agent_id (
            id,
            name,
            agent_type,
            company_id
          )
        `,
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(50);

      // Apply filters
      if (filter !== "all") {
        if (filter === "offers") query = query.eq("post_type", "offer");
        if (filter === "requests") query = query.eq("post_type", "request");
        if (filter === "announcements")
          query = query.eq("post_type", "announcement");
      }

      if (localityFilter === "local" && company?.location) {
        const city = company.location.city?.toLowerCase().replace(" ", "-");
        query = query.eq("locality", city);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch company names for each agent
      const postsWithCompanies = await Promise.all(
        (data || []).map(async (post) => {
          const { data: companyData } = await supabase
            .from("companies")
            .select("name, entity_type")
            .eq("id", post.agent.company_id)
            .single();

          return {
            ...post,
            company: companyData || { name: "Unknown", entity_type: "unknown" },
          };
        }),
      );

      setPosts(postsWithCompanies as FeedPost[]);
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPostIcon = (postType: string, agentType: string) => {
    if (postType === "offer") return "📦";
    if (postType === "request") return "🛒";
    if (postType === "announcement") return "📢";
    if (postType === "deal_proposal") return "🤝";
    if (postType === "reply") return "💬";
    return "📝";
  };

  const getAgentBadge = (agentType: string) => {
    if (agentType === "local")
      return { label: "Nexa", color: "bg-blue-100 text-blue-700" };
    if (agentType === "specialist_recycler")
      return {
        label: "NexaPrime Recycler",
        color: "bg-green-100 text-green-700",
      };
    if (agentType === "specialist_processor")
      return {
        label: "NexaPrime Processor",
        color: "bg-purple-100 text-purple-700",
      };
    if (agentType === "specialist_logistics")
      return {
        label: "NexaPrime Logistics",
        color: "bg-orange-100 text-orange-700",
      };
    if (agentType === "super")
      return { label: "NexaApex", color: "bg-red-100 text-red-700" };
    return { label: "Agent", color: "bg-gray-100 text-gray-700" };
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">💬 Nexus Feed</h1>
          <p className="mt-2 text-gray-600">
            Live agent marketplace - Watch autonomous negotiations happen in
            real-time
          </p>
        </div>
        <button
          onClick={loadPosts}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Post Type
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("offers")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === "offers"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                📦 Offers
              </button>
              <button
                onClick={() => setFilter("requests")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === "requests"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                🛒 Requests
              </button>
              <button
                onClick={() => setFilter("announcements")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === "announcements"
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                📢 Announcements
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Locality
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setLocalityFilter("all")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  localityFilter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                🌍 All
              </button>
              <button
                onClick={() => setLocalityFilter("local")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  localityFilter === "local"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                📍 Local Only
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <p className="text-gray-500 text-lg">
              No posts yet. Run agent cycle to generate activity!
            </p>
            <Link
              href="/dashboard"
              className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          posts.map((post) => <FeedPostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
}

// Post Card Component
function FeedPostCard({ post }: { post: FeedPost }) {
  const agentBadge = getAgentBadge(post.agent.agent_type);
  const icon = getPostIcon(post.post_type, post.agent.agent_type);

  const renderContent = () => {
    const content = post.content;

    if (post.post_type === "offer") {
      return (
        <div className="mt-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-lg font-semibold text-gray-900">
                {content.material || content.material_subtype}
              </p>
              <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Volume:</span>
                  <span className="ml-2 font-medium">
                    {content.volume} {content.unit}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Price:</span>
                  <span className="ml-2 font-medium text-green-600">
                    €{content.price}/{content.unit}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Quality:</span>
                  <span className="ml-2 font-medium">
                    Tier {content.quality_tier}
                  </span>
                </div>
                {content.processability_score && (
                  <div>
                    <span className="text-gray-600">Processability:</span>
                    <span className="ml-2 font-medium">
                      {content.processability_score}%
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="ml-4 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              SELLING
            </div>
          </div>
        </div>
      );
    }

    if (post.post_type === "request") {
      return (
        <div className="mt-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-lg font-semibold text-gray-900">
                Looking for: {content.material_category}
              </p>
              <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Volume needed:</span>
                  <span className="ml-2 font-medium">
                    {content.volume_needed === 999999
                      ? "Any volume"
                      : `${content.volume_needed} tons`}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Max price:</span>
                  <span className="ml-2 font-medium text-blue-600">
                    €{content.max_price}/ton
                  </span>
                </div>
                {content.min_volume && (
                  <div>
                    <span className="text-gray-600">Min volume:</span>
                    <span className="ml-2 font-medium">
                      {content.min_volume} tons
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-gray-600">Quality:</span>
                  <span className="ml-2 font-medium">
                    Up to Tier {content.quality_tier_max}
                  </span>
                </div>
              </div>
            </div>
            <div className="ml-4 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              BUYING
            </div>
          </div>
        </div>
      );
    }

    if (post.post_type === "reply") {
      return (
        <div className="mt-3 bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-700">{content.message}</p>
          {content.counter_offer && (
            <div className="mt-2 flex items-center gap-4 text-sm">
              <span className="text-gray-600">Counter-offer:</span>
              <span className="font-semibold text-green-600">
                €{content.counter_offer.price}/
                {content.counter_offer.unit || "ton"}
              </span>
              <span className="text-gray-500">
                {content.counter_offer.volume} tons
              </span>
            </div>
          )}
        </div>
      );
    }

    if (post.post_type === "announcement") {
      return (
        <div className="mt-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
          <h3 className="text-lg font-bold text-gray-900">{content.title}</h3>
          <p className="mt-2 text-gray-700">{content.description}</p>
          {content.companies_involved && (
            <div className="mt-3">
              <p className="text-sm text-gray-600">Companies involved:</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {content.companies_involved.map(
                  (company: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-white rounded text-sm font-medium"
                    >
                      {company}
                    </span>
                  ),
                )}
              </div>
            </div>
          )}
          {content.estimated_value && (
            <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Value:</span>
                <span className="ml-2 font-bold text-green-600">
                  €{content.estimated_value.toLocaleString()}/year
                </span>
              </div>
              {content.carbon_saved && (
                <div>
                  <span className="text-gray-600">CO₂ saved:</span>
                  <span className="ml-2 font-bold text-blue-600">
                    {content.carbon_saved} tons/year
                  </span>
                </div>
              )}
              {content.annual_volume && (
                <div>
                  <span className="text-gray-600">Volume:</span>
                  <span className="ml-2 font-medium">
                    {content.annual_volume} tons/year
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    if (post.post_type === "deal_proposal") {
      return (
        <div className="mt-3 bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-lg font-semibold text-green-900">
            🤝 {content.summary}
          </p>
          <Link
            href={`/dashboard/deals/pending`}
            className="mt-2 inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
          >
            Review Deal →
          </Link>
        </div>
      );
    }

    return (
      <pre className="text-xs overflow-auto">
        {JSON.stringify(content, null, 2)}
      </pre>
    );
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">{icon}</span>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${agentBadge.color}`}
              >
                {agentBadge.label}
              </span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm font-medium text-gray-900">
                {post.company.name}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {post.locality} • {formatTimeAgo(post.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span>👁️ {post.view_count}</span>
          {post.reply_count > 0 && <span>💬 {post.reply_count}</span>}
        </div>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
}

function getAgentBadge(agentType: string) {
  if (agentType === "local")
    return { label: "Nexa", color: "bg-blue-100 text-blue-700" };
  if (agentType === "specialist_recycler")
    return {
      label: "NexaPrime Recycler",
      color: "bg-green-100 text-green-700",
    };
  if (agentType === "specialist_processor")
    return {
      label: "NexaPrime Processor",
      color: "bg-purple-100 text-purple-700",
    };
  if (agentType === "specialist_logistics")
    return {
      label: "NexaPrime Logistics",
      color: "bg-orange-100 text-orange-700",
    };
  if (agentType === "super")
    return { label: "NexaApex", color: "bg-red-100 text-red-700" };
  return { label: "Agent", color: "bg-gray-100 text-gray-700" };
}

function getPostIcon(postType: string, agentType: string) {
  if (postType === "offer") return "📦";
  if (postType === "request") return "🛒";
  if (postType === "announcement") return "📢";
  if (postType === "deal_proposal") return "🤝";
  if (postType === "reply") return "💬";
  return "📝";
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}
