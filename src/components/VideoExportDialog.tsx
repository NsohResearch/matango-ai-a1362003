/**
 * VideoExportDialog — Export video with presets.
 * Adapted from trpc version — UI-only for now.
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Download, Film, Loader2, Sparkles } from "lucide-react";

const EXPORT_PRESETS = [
  { id: "social_vertical", name: "Social (Vertical)", desc: "9:16 for TikTok, Reels, Shorts", resolution: "1080x1920" },
  { id: "social_square", name: "Social (Square)", desc: "1:1 for Instagram Feed", resolution: "1080x1080" },
  { id: "youtube", name: "YouTube", desc: "16:9 Full HD", resolution: "1920x1080" },
  { id: "presentation", name: "Presentation", desc: "16:9 for slides", resolution: "1920x1080" },
];

interface VideoExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoJobId?: string;
  videoTitle?: string;
}

export default function VideoExportDialog({ open, onOpenChange, videoJobId, videoTitle }: VideoExportDialogProps) {
  const [selectedPreset, setSelectedPreset] = useState("social_vertical");
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    // Simulate export — real implementation would call edge function
    setTimeout(() => {
      setExporting(false);
      toast.success("Video export started! You'll be notified when ready.");
      onOpenChange(false);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Film className="h-5 w-5 text-primary" />
            Export Video
          </DialogTitle>
        </DialogHeader>

        {videoTitle && <p className="text-sm text-muted-foreground">Exporting: <strong>{videoTitle}</strong></p>}

        <div className="space-y-3">
          <Label className="text-sm font-medium">Choose Format</Label>
          <RadioGroup value={selectedPreset} onValueChange={setSelectedPreset}>
            {EXPORT_PRESETS.map((preset) => (
              <div key={preset.id} className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value={preset.id} id={preset.id} />
                <Label htmlFor={preset.id} className="flex-1 cursor-pointer">
                  <div className="font-medium text-sm">{preset.name}</div>
                  <div className="text-[11px] text-muted-foreground">{preset.desc}</div>
                </Label>
                <Badge variant="secondary" className="text-[10px]">{preset.resolution}</Badge>
              </div>
            ))}
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleExport} disabled={exporting}>
            {exporting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Download className="h-4 w-4 mr-1" />}
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
