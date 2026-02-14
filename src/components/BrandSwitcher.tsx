/**
 * BrandSwitcher — Dropdown to switch active brand context.
 * Adapted from original trpc version to use Supabase.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { useBrandBrains } from "@/hooks/useData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Building2, ChevronDown, Plus, Check } from "lucide-react";

export function BrandSwitcher() {
  const { data: brands, isLoading } = useBrandBrains();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [activeBrandId, setActiveBrandId] = useState<string | null>(null);

  // Default to first active brand
  const activeBrand = brands?.find((b) => b.id === activeBrandId) || brands?.find((b) => b.is_active) || brands?.[0];

  const switchBrand = async (brandId: string) => {
    setActiveBrandId(brandId);
    // Mark selected brand as active, deactivate others
    if (user) {
      await supabase.from("business_dna").update({ is_active: false }).eq("user_id", user.id);
      await supabase.from("business_dna").update({ is_active: true }).eq("id", brandId);
      qc.invalidateQueries({ queryKey: ["brand-brains"] });
    }
  };

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" disabled>
        <Building2 className="h-4 w-4" />
        <span>Loading...</span>
      </Button>
    );
  }

  if (!brands || brands.length === 0) {
    return (
      <Link to="/brand-brain">
        <Button variant="ghost" size="sm" className="gap-2 text-primary hover:text-primary/80">
          <Plus className="h-4 w-4" />
          <span>Create Brand</span>
        </Button>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 max-w-[200px]">
          <Building2 className="h-4 w-4 text-primary" />
          <span className="truncate text-foreground">{activeBrand?.brand_name || "Select Brand"}</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Your Brands</DropdownMenuLabel>
        {brands.map((brand) => (
          <DropdownMenuItem key={brand.id} onClick={() => switchBrand(brand.id)} className="flex items-center gap-2 cursor-pointer">
            <Building2 className="h-4 w-4 text-primary" />
            <span className="flex-1 truncate">{brand.brand_name || "Untitled"}</span>
            {brand.id === activeBrand?.id && <Check className="h-3 w-3 text-primary" />}
            {brand.status === "draft" && <Badge variant="secondary" className="text-[10px]">Draft</Badge>}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/brand-brain" className="flex items-center gap-2 cursor-pointer">
            <Plus className="h-4 w-4" />
            <span>New Brand</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default BrandSwitcher;
