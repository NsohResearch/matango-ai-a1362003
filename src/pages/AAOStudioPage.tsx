import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import WorkflowNav from "@/components/WorkflowNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Rocket, Download, Send, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, Video, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function AAOStudioPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("deploy");
  const [destination, setDestination] = useState("download_only");
  const [caption, setCaption] = useState("");

  const { data: videoJobs } = useQuery({
    queryKey: ["video-jobs", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase.from("video_jobs").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(20);
      return data || [];
    },
  });

  const { data: scripts } = useQuery({
    queryKey: ["video-scripts", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data } = await supabase.from("video_scripts").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(20);
      return data || [];
    },
  });

  const handleDeploy = () => {
    toast.success("Deployment queued! Your AAO will process this shortly.");
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-5xl">
        <WorkflowNav currentStep={5} />
        <h1 className="font-display text-3xl font-bold mb-2">AAO Studio</h1>
        <p className="text-muted-foreground mb-8">Deploy your content through AI-Amplified Operators for autonomous distribution.</p>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="deploy"><Rocket className="h-3.5 w-3.5 mr-1" /> Deploy</TabsTrigger>
            <TabsTrigger value="history"><Clock className="h-3.5 w-3.5 mr-1" /> History</TabsTrigger>
          </TabsList>

          <TabsContent value="deploy">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Select Content</CardTitle><CardDescription>Choose a video or script to deploy.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Video Asset</Label>
                    <Select><SelectTrigger><SelectValue placeholder={videoJobs?.length ? "Select a video..." : "No videos yet"} /></SelectTrigger>
                      <SelectContent>{videoJobs?.map((j) => <SelectItem key={j.id} value={j.id}>{j.job_type || "Video"} — {j.status}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Script</Label>
                    <Select><SelectTrigger><SelectValue placeholder={scripts?.length ? "Select a script..." : "No scripts yet"} /></SelectTrigger>
                      <SelectContent>{scripts?.map((s) => <SelectItem key={s.id} value={s.id}>{s.title || "Untitled"}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Caption / Copy</Label>
                    <Textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Add post caption or copy..." rows={4} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Deployment Settings</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Destination</Label>
                    <Select value={destination} onValueChange={setDestination}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="download_only">Download Only</SelectItem>
                        <SelectItem value="schedule">Schedule Post</SelectItem>
                        <SelectItem value="publish_now">Publish Now</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full" onClick={handleDeploy}><Send className="h-4 w-4 mr-2" /> Deploy Content</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No deployments yet. Deploy your first content above.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
