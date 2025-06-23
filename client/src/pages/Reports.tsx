import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DailyReport, Student } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Eye, Edit, Trash2, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import ReportModal from "@/components/ReportModal";
import ReportViewModal from "@/components/ReportViewModal";
import { cn } from "@/lib/utils";

interface ReportWithStudent extends DailyReport {
  student?: Student;
}

export default function Reports() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<number | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reports = [], isLoading: reportsLoading } = useQuery<DailyReport[]>({
    queryKey: ["/api/reports"],
  });

  const { data: students = [], isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const deleteReportMutation = useMutation({
    mutationFn: async (reportId: number) => {
      const response = await apiRequest("DELETE", `/api/reports/${reportId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      toast({
        title: "보고서 삭제 완료",
        description: "보고서가 성공적으로 삭제되었습니다.",
      });
      setDeleteDialogOpen(false);
      setReportToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "보고서 삭제 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create a map of student names for quick lookup
  const studentMap = students.reduce((acc, student) => {
    acc[student.id] = student;
    return acc;
  }, {} as Record<number, Student>);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            완료
          </Badge>
        );
      case "processing":
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            <Clock className="w-3 h-3 mr-1" />
            처리중
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="w-3 h-3 mr-1" />
            실패
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-slate-100 text-slate-800 hover:bg-slate-100">
            <AlertTriangle className="w-3 h-3 mr-1" />
            대기중
          </Badge>
        );
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
      <Badge variant="secondary" className={cn("hover:bg-opacity-100", getScoreColor(score))}>
        {score}점
      </Badge>
    );
  };

  const handleViewReport = (report: DailyReport) => {
    setSelectedReportId(report.id);
    setViewModalOpen(true);
  };

  const handleDeleteReport = (reportId: number) => {
    setReportToDelete(reportId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (reportToDelete) {
      deleteReportMutation.mutate(reportToDelete);
    }
  };

  if (reportsLoading || studentsLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-1/3"></div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex-1">
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          새 보고서 작성
        </Button>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">최근 보고서</h3>
        </div>
        
        {reports.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 bg-slate-200 rounded-full flex items-center justify-center">
              <span className="text-slate-400 text-lg">📄</span>
            </div>
            <h3 className="mt-2 text-sm font-medium text-slate-900">보고서가 없습니다</h3>
            <p className="mt-1 text-sm text-slate-500">첫 번째 수업 보고서를 작성해보세요.</p>
            <div className="mt-6">
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                새 보고서 작성
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>학생</TableHead>
                  <TableHead>수업일</TableHead>
                  <TableHead>과목</TableHead>
                  <TableHead>숙제 점수</TableHead>
                  <TableHead>AI 상태</TableHead>
                  <TableHead>작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => {
                  const student = studentMap[report.studentId];
                  return (
                    <TableRow key={report.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {student?.name.charAt(0) || "?"}
                            </span>
                          </div>
                          <span className="font-medium text-slate-900">
                            {student?.name || "알 수 없음"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {new Date(report.classDate).toLocaleDateString('ko-KR')}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {student?.subject || "-"}
                      </TableCell>
                      <TableCell>
                        {getScoreBadge(report.homeworkScore)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(report.aiProcessingStatus || "pending")}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewReport(report)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-slate-600"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteReport(report.id)}
                            className="text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Report Modal */}
      <ReportModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        students={students}
      />

      {/* View Report Modal */}
      <ReportViewModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        reportId={selectedReportId}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>보고서 삭제 확인</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 이 보고서를 삭제하시겠습니까? 
              이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteReportMutation.isPending}
            >
              {deleteReportMutation.isPending ? "삭제 중..." : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
