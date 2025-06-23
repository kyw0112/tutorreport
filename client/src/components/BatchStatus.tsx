import { useQuery } from "@tanstack/react-query";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BatchStatus() {
  const { data: batchStats, isLoading } = useQuery({
    queryKey: ["/api/batch/status"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  if (isLoading || !batchStats) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
        <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" />
        <span className="text-sm text-slate-700 font-medium">로딩 중...</span>
      </div>
    );
  }

  const { pendingCount, processingCount } = batchStats;
  const isProcessing = processingCount > 0;
  const hasPending = pendingCount > 0;

  let statusColor = "slate";
  let StatusIcon = CheckCircle;
  let statusText = "모든 작업 완료";

  if (isProcessing) {
    statusColor = "amber";
    StatusIcon = Clock;
    statusText = "AI 처리 중";
  } else if (hasPending) {
    statusColor = "blue";
    StatusIcon = AlertCircle;
    statusText = "처리 대기 중";
  }

  return (
    <div 
      className={cn(
        "flex items-center space-x-2 px-3 py-2 rounded-lg border",
        statusColor === "amber" && "bg-amber-50 border-amber-200",
        statusColor === "blue" && "bg-blue-50 border-blue-200",
        statusColor === "slate" && "bg-slate-50 border-slate-200"
      )}
    >
      <StatusIcon 
        className={cn(
          "w-4 h-4",
          statusColor === "amber" && "text-amber-600",
          statusColor === "blue" && "text-blue-600",
          statusColor === "slate" && "text-slate-600"
        )}
      />
      <span 
        className={cn(
          "text-sm font-medium",
          statusColor === "amber" && "text-amber-700",
          statusColor === "blue" && "text-blue-700",
          statusColor === "slate" && "text-slate-700"
        )}
      >
        {statusText}
      </span>
      {(hasPending || isProcessing) && (
        <span 
          className={cn(
            "text-xs",
            statusColor === "amber" && "text-amber-600",
            statusColor === "blue" && "text-blue-600",
            statusColor === "slate" && "text-slate-600"
          )}
        >
          {pendingCount + processingCount}개
        </span>
      )}
    </div>
  );
}
