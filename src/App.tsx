import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import KahChatWidget from "@/components/KahChatWidget";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import Pricing from "./pages/Pricing";
import MeetKah from "./pages/MeetKah";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
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

const P = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>{children}</ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
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
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />

            {/* Protected — Dashboard */}
            <Route path="/dashboard" element={<P><Dashboard /></P>} />

            {/* Protected — Core */}
            <Route path="/brand-brain" element={<P><BrandBrain /></P>} />
            <Route path="/campaign-factory" element={<P><CampaignFactory /></P>} />

            {/* Protected — Create */}
            <Route path="/influencer-studio" element={<P><InfluencerStudio /></P>} />
            <Route path="/influencer/:id" element={<P><InfluencerDetail /></P>} />
            <Route path="/create-influencer" element={<P><CreateInfluencer /></P>} />
            <Route path="/create-influencer-pro" element={<P><CreateInfluencerPro /></P>} />
            <Route path="/generation-workspace" element={<P><GenerationWorkspace /></P>} />
            <Route path="/generation-workspace/:id" element={<P><GenerationWorkspace /></P>} />
            <Route path="/video-studio" element={<P><VideoStudio /></P>} />
            <Route path="/video-studio-pro" element={<P><VideoStudioPro /></P>} />
            <Route path="/video-scripts" element={<P><VideoScripts /></P>} />
            <Route path="/story-studio" element={<P><StoryStudio /></P>} />
            <Route path="/asset-library" element={<P><AssetLibrary /></P>} />
            <Route path="/templates" element={<P><Templates /></P>} />
            <Route path="/template-marketplace" element={<P><TemplateMarketplace /></P>} />
            <Route path="/bulk-create" element={<P><BulkCreate /></P>} />
            <Route path="/chat/:id" element={<P><Chat /></P>} />

            {/* Protected — Distribute */}
            <Route path="/campaigns" element={<P><Campaigns /></P>} />
            <Route path="/campaigns/:id" element={<P><CampaignDetail /></P>} />
            <Route path="/schedule" element={<P><Schedule /></P>} />
            <Route path="/social-connections" element={<P><SocialConnections /></P>} />

            {/* Redirects */}
            <Route path="/studio" element={<Navigate to="/influencer-studio" replace />} />
            <Route path="/social" element={<Navigate to="/social-connections" replace />} />
            <Route path="/video" element={<Navigate to="/video-studio" replace />} />

            {/* Protected — Analyze */}
            <Route path="/analytics" element={<P><Analytics /></P>} />
            <Route path="/analytics-hub" element={<P><AnalyticsHub /></P>} />
            <Route path="/ab-testing" element={<P><ABTesting /></P>} />
            <Route path="/leads" element={<P><Leads /></P>} />

            {/* Protected — Manage */}
            <Route path="/brands" element={<P><Brands /></P>} />
            <Route path="/brands/new" element={<P><Brands /></P>} />
            <Route path="/white-label" element={<P><WhiteLabel /></P>} />
            <Route path="/team" element={<P><Team /></P>} />
            <Route path="/notifications" element={<P><Notifications /></P>} />
            <Route path="/account-settings" element={<P><AccountSettings /></P>} />
            <Route path="/settings" element={<P><AccountSettings /></P>} />
            <Route path="/ai-providers" element={<P><AIProvidersPage /></P>} />
            <Route path="/usage-analytics" element={<P><UsageAnalyticsPage /></P>} />

            {/* Protected — AAO */}
            <Route path="/aao-studio" element={<P><AAOStudioPage /></P>} />
            <Route path="/aao-glossary" element={<P><AAOGlossary /></P>} />

            {/* Protected — Admin */}
            <Route path="/admin" element={<P><AdminOverview /></P>} />
            <Route path="/admin/tenants" element={<P><AdminTenants /></P>} />
            <Route path="/admin/tenants/:id" element={<P><AdminTenantDetail /></P>} />
            <Route path="/admin/billing" element={<P><AdminBilling /></P>} />
            <Route path="/admin/feature-flags" element={<P><AdminFeatureFlags /></P>} />
            <Route path="/admin/audit-log" element={<P><AdminAuditLog /></P>} />
            <Route path="/admin/integrations" element={<P><AdminIntegrations /></P>} />
            <Route path="/admin/system-health" element={<P><AdminSystemHealth /></P>} />
            <Route path="/admin/moderation" element={<P><AdminModeration /></P>} />
            <Route path="/admin/compliance" element={<P><AdminCompliance /></P>} />
            <Route path="/admin/gdpr" element={<P><AdminGdprRequests /></P>} />
            <Route path="/admin/leads" element={<P><AdminLeads /></P>} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <KahChatWidget />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
