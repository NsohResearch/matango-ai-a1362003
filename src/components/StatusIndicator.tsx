import { Loader2, CheckCircle, AlertCircle, RefreshCw, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatusType = "idle" | "loading" | "success" | "error" | "retrying" | "pending";

interface StatusIndicatorProps {
  status: StatusType;
  message?: string;
  className?: string;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = { sm: "text-xs gap-1", md: "text-sm gap-2", lg: "text-base gap-2" };
const iconSizes = { sm: "h-3 w-3", md: "h-4 w-4", lg: "h-5 w-5" };

export function StatusIndicator({ status, message, className, showIcon = true, size = "md" }: StatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "loading": return { icon: Loader2, color: "text-blue-500", bgColor: "bg-blue-500/10", animate: "animate-spin", defaultMessage: "Processing..." };
      case "success": return { icon: CheckCircle, color: "text-green-500", bgColor: "bg-green-500/10", animate: "", defaultMessage: "Completed" };
      case "error": return { icon: AlertCircle, color: "text-red-500", bgColor: "bg-red-500/10", animate: "", defaultMessage: "Failed" };
      case "retrying": return { icon: RefreshCw, color: "text-amber-500", bgColor: "bg-amber-500/10", animate: "animate-spin", defaultMessage: "Retrying..." };
      case "pending": return { icon: Clock, color: "text-muted-foreground", bgColor: "bg-muted", animate: "", defaultMessage: "Pending" };
      default: return { icon: Clock, color: "text-muted-foreground", bgColor: "bg-muted", animate: "", defaultMessage: "" };
    }
  };

  if (status === "idle") return null;

  const config = getStatusConfig();
  const Icon = config.icon;
  const displayMessage = message || config.defaultMessage;

  return (
    <div className={cn("flex items-center", sizeClasses[size], className)}>
      {showIcon && (
        <span className={cn("inline-flex items-center justify-center rounded-full p-1", config.bgColor)}>
          <Icon className={cn(iconSizes[size], config.color, config.animate)} />
        </span>
      )}
      {displayMessage && <span className={cn(config.color)}>{displayMessage}</span>}
    </div>
  );
}

export default StatusIndicator;
