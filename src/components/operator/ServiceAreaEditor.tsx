import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { MapPin, X } from "lucide-react";

interface Props {
  deployment: any;
  onUpdate: (patch: any) => Promise<void> | void;
}

export default function ServiceAreaEditor({ deployment, onUpdate }: Props) {
  const [zips, setZips] = useState<string[]>(deployment.service_area_zips ?? []);
  const [zipInput, setZipInput] = useState("");
  const [center, setCenter] = useState(deployment.service_area_center ?? "");
  const [radius, setRadius] = useState<number>(deployment.service_area_radius_miles ?? 25);
  const [saving, setSaving] = useState(false);

  const addZip = () => {
    const cleaned = zipInput.split(/[,\s]+/).map(z => z.trim()).filter(z => /^\d{5}$/.test(z));
    if (!cleaned.length) return;
    setZips(Array.from(new Set([...zips, ...cleaned])));
    setZipInput("");
  };
  const removeZip = (z: string) => setZips(zips.filter(x => x !== z));

  const save = async () => {
    setSaving(true);
    try {
      await onUpdate({
        service_area_zips: zips,
        service_area_center: center || null,
        service_area_radius_miles: radius || null,
      });
      toast.success("Service area saved");
    } catch (e: any) { toast.error(e.message); }
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Service area</CardTitle>
        <CardDescription>Ka'h validates every caller address before booking. Use a ZIP list, a radius from a central address, or both.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Covered ZIP codes</Label>
          <div className="flex gap-2 mt-1">
            <Input placeholder="e.g. 75201, 75202" value={zipInput} onChange={e => setZipInput(e.target.value)}
                   onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addZip(); } }} />
            <Button variant="outline" onClick={addZip}>Add</Button>
          </div>
          {zips.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {zips.map(z => (
                <Badge key={z} variant="secondary" className="gap-1">
                  {z}
                  <button onClick={() => removeZip(z)} className="hover:text-destructive"><X className="h-3 w-3" /></button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <Label>Central address (radius fallback)</Label>
            <Input placeholder="123 Main St, Dallas, TX" value={center} onChange={e => setCenter(e.target.value)} />
          </div>
          <div>
            <Label>Radius (miles)</Label>
            <Input type="number" min={1} max={200} value={radius} onChange={e => setRadius(Number(e.target.value))} />
          </div>
        </div>

        <Button onClick={save} disabled={saving}>Save service area</Button>
      </CardContent>
    </Card>
  );
}
