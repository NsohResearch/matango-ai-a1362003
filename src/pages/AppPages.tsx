import ComingSoonPage from "@/components/ComingSoonPage";
import { Video, Megaphone, Eye, Layers, Users, Wand2, Palette, Sparkles, BookOpen, Upload, Plug, TrendingUp, Rocket, BookMarked } from "lucide-react";

// Re-export real pages
export { default as BrandBrain } from "@/pages/BrandBrain";
export { default as InfluencerStudio } from "@/pages/InfluencerStudio";
export { default as VideoStudio } from "@/pages/VideoStudio";
export { default as CampaignFactory } from "@/pages/CampaignFactory";
export { default as Schedule } from "@/pages/Scheduler";
export { default as AnalyticsHub } from "@/pages/AnalyticsHub";
export { default as ABTesting } from "@/pages/ABTesting";
export { default as Leads } from "@/pages/Leads";
export { default as SocialConnections } from "@/pages/SocialConnections";
export { default as Templates } from "@/pages/Templates";
export { default as Team } from "@/pages/Team";
export { default as Notifications } from "@/pages/Notifications";
export { default as AccountSettings } from "@/pages/AccountSettings";
export { default as WhiteLabel } from "@/pages/WhiteLabel";
export { default as Brands } from "@/pages/Brands";
export { default as VideoScripts } from "@/pages/VideoScripts";
export { default as AssetLibrary } from "@/pages/AssetLibrary";
export { default as AdminOverview } from "@/pages/admin/AdminOverview";
export { AdminTenantsPage as AdminTenants, AdminBillingPage as AdminBilling, AdminFeatureFlagsPage as AdminFeatureFlags, AdminAuditLogPage as AdminAuditLog, AdminSystemHealthPage as AdminSystemHealth, AdminModerationPage as AdminModeration, AdminCompliancePage as AdminCompliance, AdminGdprPage as AdminGdprRequests, AdminLeadsPage as AdminLeads } from "@/pages/Admin";

// Coming Soon pages with proper gating, explanations, and alternatives
export const VideoStudioPro = () => (
  <ComingSoonPage title="Video Studio Pro" description="Advanced video creation with professional editing tools, lip-sync, and multi-scene composition." icon={Video} tier="Agency" alternatives={[{ label: "Use Video Studio", to: "/video-studio" }]} />
);
export const Campaigns = () => (
  <ComingSoonPage title="Campaign Manager" description="View and manage all your active campaigns with unified metrics." icon={Megaphone} tier="Basic" alternatives={[{ label: "Create in Campaign Factory", to: "/campaign-factory" }]} />
);
export const CampaignDetail = () => (
  <ComingSoonPage title="Campaign Detail" description="Detailed campaign performance view with asset-level analytics." icon={Megaphone} tier="Basic" alternatives={[{ label: "View Analytics Hub", to: "/analytics-hub" }]} />
);
export const Analytics = () => (
  <ComingSoonPage title="Analytics" description="Track campaign performance and audience insights across channels." icon={TrendingUp} tier="Basic" alternatives={[{ label: "Go to Analytics Hub", to: "/analytics-hub" }]} />
);
export const TemplateMarketplace = () => (
  <ComingSoonPage title="Template Marketplace" description="Browse and install community-created templates for campaigns, scripts, and content." icon={Layers} tier="Agency" alternatives={[{ label: "Browse Templates", to: "/templates" }]} />
);
export const CreateInfluencer = () => (
  <ComingSoonPage title="Create Influencer" description="Create a new AI influencer persona with custom traits and visual identity." icon={Users} tier="Basic" alternatives={[{ label: "Go to Influencer Studio", to: "/influencer-studio" }]} />
);
export const CreateInfluencerPro = () => (
  <ComingSoonPage title="Create Influencer Pro" description="Advanced influencer creation with fine-tuned character controls and training data upload." icon={Wand2} tier="Agency" alternatives={[{ label: "Go to Influencer Studio", to: "/influencer-studio" }]} />
);
export const GenerationWorkspace = () => (
  <ComingSoonPage title="Generation Workspace" description="Your dedicated influencer image generation workspace with batch processing." icon={Sparkles} tier="Basic" alternatives={[{ label: "Go to Influencer Studio", to: "/influencer-studio" }, { label: "Asset Gallery", to: "/asset-library" }]} />
);
export const Chat = () => (
  <ComingSoonPage title="Chat" description="Conversational interface for your AI influencer with brand-aware responses." icon={Sparkles} tier="Basic" alternatives={[{ label: "Try K'ah Chat", to: "/meet-kah" }]} />
);
export const Discover = () => (
  <ComingSoonPage title="Discover" description="Explore AI influencer profiles, trending templates, and community creations." icon={Eye} tier="Free" alternatives={[{ label: "Go to Influencer Studio", to: "/influencer-studio" }]} />
);
export const InfluencerDetail = () => (
  <ComingSoonPage title="Influencer Detail" description="View and manage individual influencer profile, content gallery, and performance." icon={Users} tier="Basic" alternatives={[{ label: "Go to Influencer Studio", to: "/influencer-studio" }]} />
);
// Real page implementations (migrated from original repo)
export { default as AAOGlossary } from "@/pages/AAOGlossary";
export { default as AAOStudioPage } from "@/pages/AAOStudioPage";
export { default as AIProvidersPage } from "@/pages/AIProvidersPage";
export { default as UsageAnalyticsPage } from "@/pages/UsageAnalyticsPage";
export const StoryStudio = () => (
  <ComingSoonPage title="Story Studio" description="Create multi-scene narratives and visual stories with AI-generated imagery and consistent characters." icon={BookOpen} tier="Agency" alternatives={[{ label: "Video Scripts", to: "/video-scripts" }, { label: "Video Studio", to: "/video-studio" }]} />
);
export const BulkCreate = () => (
  <ComingSoonPage title="Bulk Create" description="Generate content at scale with batch processing for images, videos, and copy across all your campaigns." icon={Upload} tier="Agency" alternatives={[{ label: "Asset Gallery", to: "/asset-library" }, { label: "Campaign Factory", to: "/campaign-factory" }]} />
);
export { default as AdminTenantDetail } from "@/pages/admin/AdminTenantDetail";
export { default as AdminIntegrations } from "@/pages/admin/AdminIntegrations";
