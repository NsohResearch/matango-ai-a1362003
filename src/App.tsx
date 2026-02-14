import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import Pricing from "./pages/Pricing";
import MeetKah from "./pages/MeetKah";
import {
  BrandBrain, InfluencerStudio, VideoStudio, VideoStudioPro,
  CampaignFactory, Campaigns, CampaignDetail, Schedule,
  Analytics, AnalyticsHub, ABTesting, Templates, TemplateMarketplace,
  Leads, SocialConnections, VideoScripts, Brands, WhiteLabel,
  Team, Notifications, AccountSettings, CreateInfluencer,
  CreateInfluencerPro, GenerationWorkspace, Chat, Discover,
  InfluencerDetail, AAOGlossary, AAOStudioPage, AIProvidersPage,
  UsageAnalyticsPage, AssetLibrary, StoryStudio, BulkCreate,
  AdminOverview, AdminTenants, AdminTenantDetail, AdminBilling,
  AdminFeatureFlags, AdminAuditLog, AdminIntegrations,
  AdminSystemHealth, AdminModeration, AdminCompliance,
  AdminGdprRequests, AdminLeads,
} from "./pages/AppPages";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/about" element={<About />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/meet-kah" element={<MeetKah />} />
          <Route path="/discover" element={<Discover />} />

          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Core */}
          <Route path="/brand-brain" element={<BrandBrain />} />
          <Route path="/campaign-factory" element={<CampaignFactory />} />

          {/* Create */}
          <Route path="/influencer-studio" element={<InfluencerStudio />} />
          <Route path="/influencer/:id" element={<InfluencerDetail />} />
          <Route path="/create-influencer" element={<CreateInfluencer />} />
          <Route path="/create-influencer-pro" element={<CreateInfluencerPro />} />
          <Route path="/generation-workspace" element={<GenerationWorkspace />} />
          <Route path="/generation-workspace/:id" element={<GenerationWorkspace />} />
          <Route path="/video-studio" element={<VideoStudio />} />
          <Route path="/video-studio-pro" element={<VideoStudioPro />} />
          <Route path="/video-scripts" element={<VideoScripts />} />
          <Route path="/story-studio" element={<StoryStudio />} />
          <Route path="/asset-library" element={<AssetLibrary />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/template-marketplace" element={<TemplateMarketplace />} />
          <Route path="/bulk-create" element={<BulkCreate />} />
          <Route path="/chat/:id" element={<Chat />} />

          {/* Distribute */}
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/campaigns/:id" element={<CampaignDetail />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/social-connections" element={<SocialConnections />} />

          {/* Redirects */}
          <Route path="/studio" element={<Navigate to="/influencer-studio" replace />} />
          <Route path="/social" element={<Navigate to="/social-connections" replace />} />
          <Route path="/video" element={<Navigate to="/video-studio" replace />} />

          {/* Analyze */}
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/analytics-hub" element={<AnalyticsHub />} />
          <Route path="/ab-testing" element={<ABTesting />} />
          <Route path="/leads" element={<Leads />} />

          {/* Manage */}
          <Route path="/brands" element={<Brands />} />
          <Route path="/brands/new" element={<Brands />} />
          <Route path="/white-label" element={<WhiteLabel />} />
          <Route path="/team" element={<Team />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/account-settings" element={<AccountSettings />} />
          <Route path="/settings" element={<AccountSettings />} />
          <Route path="/ai-providers" element={<AIProvidersPage />} />
          <Route path="/usage-analytics" element={<UsageAnalyticsPage />} />

          {/* AAO */}
          <Route path="/aao-studio" element={<AAOStudioPage />} />
          <Route path="/aao-glossary" element={<AAOGlossary />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminOverview />} />
          <Route path="/admin/tenants" element={<AdminTenants />} />
          <Route path="/admin/tenants/:id" element={<AdminTenantDetail />} />
          <Route path="/admin/billing" element={<AdminBilling />} />
          <Route path="/admin/feature-flags" element={<AdminFeatureFlags />} />
          <Route path="/admin/audit-log" element={<AdminAuditLog />} />
          <Route path="/admin/integrations" element={<AdminIntegrations />} />
          <Route path="/admin/system-health" element={<AdminSystemHealth />} />
          <Route path="/admin/moderation" element={<AdminModeration />} />
          <Route path="/admin/compliance" element={<AdminCompliance />} />
          <Route path="/admin/gdpr" element={<AdminGdprRequests />} />
          <Route path="/admin/leads" element={<AdminLeads />} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
