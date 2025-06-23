import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, User, BookOpen, FileText, Star } from "lucide-react";
import { DailyReport, Student } from "@shared/schema";
import { formatDate } from "@/lib/utils";

interface ReportViewModalProps {
  open: boolean;
  onClose: () => void;
  reportId: number | null;
}

export default function ReportViewModal({ open, onClose, reportId }: ReportViewModalProps) {
  const { data: report, isLoading } = useQuery<DailyReport & { student?: Student }>({
    queryKey: ["/api/reports", reportId],
    queryFn: async () => {
      const response = await fetch(`/api/reports/${reportId}`);
      if (!response.ok) {
        throw new Error("보고서를 가져올 수 없습니다.");
      }
      return response.json();
    },
    enabled: !!reportId && open,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">완료</Badge>;
      case "processing":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">처리중</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">실패</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100">대기중</Badge>;
    }
  };

  const getScoreBadge = (score: number | null) => {
    if (score === null) return null;
    
    const getScoreColor = (score: number) => {
      if (score >= 90) return "bg-green-100 text-green-800";
      if (score >= 80) return "bg-blue-100 text-blue-800";
      if (score >= 70) return "bg-amber-100 text-amber-800";
      return "bg-red-100 text-red-800";
    };

    return (
      <Badge variant="secondary" className={getScoreColor(score)}>
        {score}점
      </Badge>
    );
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>수업 보고서</span>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded animate-pulse"></div>
            <div className="h-32 bg-slate-200 rounded animate-pulse"></div>
            <div className="h-64 bg-slate-200 rounded animate-pulse"></div>
          </div>
        ) : !report ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-lg font-medium text-slate-900">보고서를 찾을 수 없습니다</h3>
            <p className="mt-1 text-sm text-slate-500">요청하신 보고서가 존재하지 않습니다.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Report Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">수업 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm">
                    <User className="text-slate-400 w-4 h-4 mr-3" />
                    <span className="text-slate-600">학생:</span>
                    <span className="ml-2 font-medium">{report.student?.name || "알 수 없음"}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="text-slate-400 w-4 h-4 mr-3" />
                    <span className="text-slate-600">수업일:</span>
                    <span className="ml-2">{formatDate(report.classDate)}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <BookOpen className="text-slate-400 w-4 h-4 mr-3" />
                    <span className="text-slate-600">과목:</span>
                    <span className="ml-2">{report.student?.subject || "미지정"}</span>
                  </div>
                  {report.createdAt && (
                    <div className="flex items-center text-sm">
                      <Clock className="text-slate-400 w-4 h-4 mr-3" />
                      <span className="text-slate-600">작성일:</span>
                      <span className="ml-2">{formatDate(report.createdAt)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">평가 및 상태</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">숙제 점수:</span>
                    {getScoreBadge(report.homeworkScore)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">AI 처리 상태:</span>
                    {getStatusBadge(report.aiProcessingStatus || "pending")}
                  </div>
                  {report.aiProcessedAt && (
                    <div className="flex items-center text-sm">
                      <Star className="text-slate-400 w-4 h-4 mr-3" />
                      <span className="text-slate-600">AI 처리 완료:</span>
                      <span className="ml-2">{formatDate(report.aiProcessedAt)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Separator />

            {/* Lesson Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>수업 내용</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">수업 주제</label>
                    <div className="mt-1 p-3 bg-slate-50 rounded-md">
                      <p className="text-sm text-slate-900">
                        {report.lessonTopics || "기록된 내용이 없습니다."}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">학생 특이사항</label>
                    <div className="mt-1 p-3 bg-slate-50 rounded-md">
                      <p className="text-sm text-slate-900">
                        {report.studentNotes || "특이사항 없음"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">다음 과제</label>
                    <div className="mt-1 p-3 bg-slate-50 rounded-md">
                      <p className="text-sm text-slate-900">
                        {report.nextAssignment || "과제가 지정되지 않았습니다."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-amber-500" />
                    <span>AI 생성 보고서</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {report.aiProcessingStatus === "completed" && report.aiReport ? (
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                          {report.aiReport}
                        </div>
                      </div>
                    </div>
                  ) : report.aiProcessingStatus === "processing" ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-sm text-slate-600">AI 보고서를 생성하고 있습니다...</p>
                    </div>
                  ) : report.aiProcessingStatus === "failed" ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-red-600 text-lg">⚠️</span>
                      </div>
                      <p className="mt-2 text-sm text-red-600">AI 보고서 생성에 실패했습니다.</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        다시 시도
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                        <Clock className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="mt-2 text-sm text-slate-600">AI 보고서 생성 대기중입니다.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
              <Button variant="outline" onClick={onClose}>
                닫기
              </Button>
              {report.aiProcessingStatus === "completed" && report.aiReport && (
                <Button>
                  보고서 다운로드
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}