import StubPage from "@/components/StubPage";

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
export { AdminOverviewPage as AdminOverview, AdminTenantsPage as AdminTenants, AdminBillingPage as AdminBilling, AdminFeatureFlagsPage as AdminFeatureFlags, AdminAuditLogPage as AdminAuditLog, AdminSystemHealthPage as AdminSystemHealth, AdminModerationPage as AdminModeration, AdminCompliancePage as AdminCompliance, AdminGdprPage as AdminGdprRequests, AdminLeadsPage as AdminLeads } from "@/pages/Admin";

// Stub pages for remaining features
export const VideoStudioPro = () => <StubPage title="Video Studio Pro" description="Advanced video creation with professional tools." />;
export const Campaigns = () => <StubPage title="Campaigns" description="View and manage all your campaigns." />;
export const CampaignDetail = () => <StubPage title="Campaign Detail" description="Campaign details and performance." />;
export const Analytics = () => <StubPage title="Analytics" description="Track campaign performance and insights." />;
export const TemplateMarketplace = () => <StubPage title="Template Marketplace" description="Browse and install community templates." />;
export const CreateInfluencer = () => <StubPage title="Create Influencer" description="Create a new AI influencer." />;
export const CreateInfluencerPro = () => <StubPage title="Create Influencer Pro" description="Advanced influencer creation with character controls." />;
export const GenerationWorkspace = () => <StubPage title="Generation Workspace" description="Your influencer image generation workspace." />;
export const Chat = () => <StubPage title="Chat" description="Chat with your AI influencer." />;
export const Discover = () => <StubPage title="Discover" description="Explore AI influencer profiles and templates." />;
export const InfluencerDetail = () => <StubPage title="Influencer Detail" description="View and manage influencer profile." />;
export const AAOGlossary = () => <StubPage title="AAO Glossary" description="Learn about AI-Amplified Operators terminology." />;
export const AAOStudioPage = () => <StubPage title="AAO Studio" description="Create and configure your AI-Amplified Operators." />;
export const AIProvidersPage = () => <StubPage title="AI Providers" description="Configure AI model providers and API keys." />;
export const UsageAnalyticsPage = () => <StubPage title="Usage Analytics" description="Track your platform usage and credits." />;
export const StoryStudio = () => <StubPage title="Story Studio" description="Create multi-scene stories and narratives." />;
export const BulkCreate = () => <StubPage title="Bulk Create" description="Generate content at scale." />;
export const AdminTenantDetail = () => <StubPage title="Tenant Detail" description="Tenant details and configuration." />;
export const AdminIntegrations = () => <StubPage title="Admin Integrations" description="Manage platform integrations." />;
