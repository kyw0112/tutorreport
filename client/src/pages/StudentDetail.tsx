import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ArrowLeft, Phone, User, BookOpen, Calendar, Edit, Plus, Eye } from "lucide-react";
import { Student, DailyReport } from "@shared/schema";
import { cn, getInitials, formatDate } from "@/lib/utils";

export default function StudentDetail() {
  const params = useParams();
  const studentId = parseInt(params.id as string);

  const { data: student, isLoading: studentLoading } = useQuery<Student>({
    queryKey: ["/api/students", studentId],
    queryFn: async () => {
      const response = await fetch(`/api/students/${studentId}`);
      if (!response.ok) {
        throw new Error("학생 정보를 가져올 수 없습니다.");
      }
      return response.json();
    },
  });

  const { data: reports = [], isLoading: reportsLoading } = useQuery<DailyReport[]>({
    queryKey: ["/api/reports", { studentId }],
    queryFn: async () => {
      const response = await fetch(`/api/reports?studentId=${studentId}`);
      if (!response.ok) {
        throw new Error("보고서를 가져올 수 없습니다.");
      }
      return response.json();
    },
  });

  if (studentLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-1/3"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-20 w-20 bg-slate-200 rounded-full"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 bg-slate-200 rounded-full flex items-center justify-center mb-4">
          <span className="text-slate-400 text-lg">❓</span>
        </div>
        <h3 className="text-lg font-medium text-slate-900">학생을 찾을 수 없습니다</h3>
        <p className="text-slate-500 mt-2">요청하신 학생 정보가 존재하지 않습니다.</p>
        <Link href="/students">
          <Button className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            학생 목록으로 돌아가기
          </Button>
        </Link>
      </div>
    );
  }

  const getProgressColor = (score: number) => {
    if (score >= 85) return "green";
    if (score >= 70) return "amber";
    return "red";
  };

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
      <Badge variant="secondary" className={cn("hover:bg-opacity-100", getScoreColor(score))}>
        {score}점
      </Badge>
    );
  };

  // Calculate statistics
  const recentReports = reports.filter(report => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 30);
    return new Date(report.classDate) >= weekAgo;
  });

  const averageScore = recentReports.length > 0 
    ? Math.round(recentReports.reduce((sum, r) => sum + (r.homeworkScore || 0), 0) / recentReports.length)
    : 0;

  const attendanceRate = Math.min(100, Math.round((recentReports.length / 4) * 100));
  const completedReports = reports.filter(r => r.aiProcessingStatus === "completed").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/students">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              학생 목록
            </Button>
          </Link>
          <div className="h-6 w-px bg-slate-300"></div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{student.name}</h1>
            <p className="text-slate-600">{student.grade} • {student.subject}</p>
          </div>
        </div>
        <Button>
          <Edit className="w-4 h-4 mr-2" />
          정보 수정
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>학생 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xl font-medium text-blue-600">
                  {getInitials(student.name)}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{student.name}</h3>
                <p className="text-sm text-slate-500">{student.grade}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <BookOpen className="text-slate-400 w-4 h-4 mr-3" />
                <span className="text-slate-600">과목:</span>
                <span className="ml-2 font-medium">{student.subject}</span>
              </div>
              {student.phone && (
                <div className="flex items-center text-sm">
                  <Phone className="text-slate-400 w-4 h-4 mr-3" />
                  <span className="text-slate-600">연락처:</span>
                  <span className="ml-2">{student.phone}</span>
                </div>
              )}
              {student.parentPhone && (
                <div className="flex items-center text-sm">
                  <User className="text-slate-400 w-4 h-4 mr-3" />
                  <span className="text-slate-600">학부모:</span>
                  <span className="ml-2">{student.parentPhone}</span>
                </div>
              )}
              <div className="flex items-center text-sm">
                <Calendar className="text-slate-400 w-4 h-4 mr-3" />
                <span className="text-slate-600">등록일:</span>
                <span className="ml-2">
                  {student.createdAt ? formatDate(student.createdAt) : '-'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Stats */}
        <Card>
          <CardHeader>
            <CardTitle>성과 통계</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600">평균 점수</span>
                  <span className="text-lg font-semibold text-slate-900">{averageScore}점</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      averageScore >= 85 ? "bg-green-500" :
                      averageScore >= 70 ? "bg-amber-500" : "bg-red-500"
                    )}
                    style={{ width: `${averageScore}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600">출석률</span>
                  <span className="text-lg font-semibold text-slate-900">{attendanceRate}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      attendanceRate >= 90 ? "bg-green-500" :
                      attendanceRate >= 80 ? "bg-amber-500" : "bg-red-500"
                    )}
                    style={{ width: `${attendanceRate}%` }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">총 수업</span>
                  <span className="font-medium">{reports.length}회</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-slate-600">완료된 보고서</span>
                  <span className="font-medium">{completedReports}개</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-slate-600">최근 30일 수업</span>
                  <span className="font-medium">{recentReports.length}회</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>빠른 작업</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start">
              <Plus className="w-4 h-4 mr-2" />
              새 보고서 작성
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Edit className="w-4 h-4 mr-2" />
              학생 정보 수정
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="w-4 h-4 mr-2" />
              수업 일정 관리
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>수업 보고서 기록</CardTitle>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              새 보고서 작성
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {reportsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                <span className="text-slate-400 text-lg">📄</span>
              </div>
              <h3 className="text-lg font-medium text-slate-900">보고서가 없습니다</h3>
              <p className="text-slate-500 mt-2">첫 번째 수업 보고서를 작성해보세요.</p>
              <Button className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                새 보고서 작성
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>수업일</TableHead>
                    <TableHead>수업 주제</TableHead>
                    <TableHead>숙제 점수</TableHead>
                    <TableHead>AI 상태</TableHead>
                    <TableHead>작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium">
                        {formatDate(report.classDate)}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {report.lessonTopics || "기록된 내용이 없습니다"}
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
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}