import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface InfoMessageProps {
  type: "success" | "error" | "warning" | "info";
  message: string;
  className?: string;
}

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const styleMap = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
};

const iconStyleMap = {
  success: "text-green-500",
  error: "text-red-500",
  warning: "text-yellow-500",
  info: "text-blue-500",
};

export function InfoMessage({ type, message, className }: InfoMessageProps) {
  const Icon = iconMap[type];

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-4 rounded-lg border",
        styleMap[type],
        className
      )}
    >
      <Icon className={cn("w-5 h-5 flex-shrink-0", iconStyleMap[type])} />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
