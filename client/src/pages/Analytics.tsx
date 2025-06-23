import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, PieChart, BarChart3, Users } from "lucide-react";
import { Student, DailyReport } from "@shared/schema";
import { cn, getInitials, getProgressColor, calculateProgress, formatDate } from "@/lib/utils";

export default function Analytics() {
  const { data: students = [], isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const { data: reports = [], isLoading: reportsLoading } = useQuery<DailyReport[]>({
    queryKey: ["/api/reports"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/analytics/stats"],
  });

  if (studentsLoading || reportsLoading || statsLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-1/3"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-64 bg-slate-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Create a map of reports by student
  const reportsByStudent = reports.reduce((acc, report) => {
    if (!acc[report.studentId]) {
      acc[report.studentId] = [];
    }
    acc[report.studentId].push(report);
    return acc;
  }, {} as Record<number, DailyReport[]>);

  // Calculate analytics for each student
  const studentAnalytics = students.map(student => {
    const studentReports = reportsByStudent[student.id] || [];
    const recentReports = studentReports.filter(report => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 30); // Last 30 days
      return new Date(report.classDate) >= weekAgo;
    });

    const attendanceRate = Math.round((recentReports.length / 4) * 100); // Assume 4 classes per month
    const homeworkCompletion = Math.round(
      (recentReports.filter(r => r.homeworkScore && r.homeworkScore > 0).length / recentReports.length) * 100
    ) || 0;
    const averageScore = recentReports.length > 0 
      ? Math.round(recentReports.reduce((sum, r) => sum + (r.homeworkScore || 0), 0) / recentReports.length)
      : 0;
    const progress = calculateProgress(recentReports);

    let progressStatus = "우수";
    let recommendation = "현재 수준 유지";
    
    if (averageScore < 70) {
      progressStatus = "주의 필요";
      recommendation = "기초 학습 강화";
    } else if (averageScore < 85) {
      progressStatus = "보통";
      recommendation = "꾸준한 복습 필요";
    } else {
      recommendation = "심화 문제 추가";
    }

    return {
      student,
      averageScore,
      attendanceRate,
      homeworkCompletion,
      progressStatus,
      recommendation,
      recentReports: recentReports.length
    };
  });

  // Calculate monthly data for chart
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    const monthReports = reports.filter(report => {
      const reportDate = new Date(report.classDate);
      return reportDate >= monthStart && reportDate <= monthEnd;
    });
    
    const avgScore = monthReports.length > 0 
      ? Math.round(monthReports.reduce((sum, r) => sum + (r.homeworkScore || 0), 0) / monthReports.length)
      : 0;
    
    monthlyData.push({
      month: date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short' }),
      avgScore,
      reportCount: monthReports.length
    });
  }

  // Subject distribution
  const subjectDistribution = students.reduce((acc, student) => {
    const subject = student.subject || '기타';
    acc[subject] = (acc[subject] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Achievement Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              월별 성취도 추이
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.map((data, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 w-16">{data.month}</span>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className={cn(
                          "h-2 rounded-full transition-all duration-300",
                          data.avgScore >= 85 ? "bg-green-500" :
                          data.avgScore >= 70 ? "bg-amber-500" : "bg-red-500"
                        )}
                        style={{ width: `${data.avgScore}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-slate-900 w-12 text-right">
                    {data.avgScore}점
                  </span>
                  <span className="text-xs text-slate-500 w-16 text-right">
                    {data.reportCount}회
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Subject Performance Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              과목별 성과 분포
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(subjectDistribution).map(([subject, count], index) => {
                const percentage = Math.round((count / students.length) * 100);
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500', 'bg-red-500'];
                const color = colors[index % colors.length];
                
                return (
                  <div key={subject} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={cn("w-3 h-3 rounded-full", color)} />
                      <span className="text-sm text-slate-700">{subject}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-500">{count}명</span>
                      <span className="text-sm font-medium text-slate-900">{percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">평균 출석률</p>
                <p className="text-2xl font-bold text-slate-900">
                  {studentAnalytics.length > 0 
                    ? Math.round(studentAnalytics.reduce((sum, s) => sum + s.attendanceRate, 0) / studentAnalytics.length)
                    : 0}%
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">숙제 완성률</p>
                <p className="text-2xl font-bold text-slate-900">
                  {studentAnalytics.length > 0 
                    ? Math.round(studentAnalytics.reduce((sum, s) => sum + s.homeworkCompletion, 0) / studentAnalytics.length)
                    : 0}%
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">우수 학생</p>
                <p className="text-2xl font-bold text-slate-900">
                  {studentAnalytics.filter(s => s.progressStatus === "우수").length}명
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">주의 필요</p>
                <p className="text-2xl font-bold text-slate-900">
                  {studentAnalytics.filter(s => s.progressStatus === "주의 필요").length}명
                </p>
              </div>
              <PieChart className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Table */}
      <Card>
        <CardHeader>
          <CardTitle>학생별 상세 분석</CardTitle>
        </CardHeader>
        <CardContent>
          {studentAnalytics.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-2 text-sm font-medium text-slate-900">분석할 데이터가 없습니다</h3>
              <p className="mt-1 text-sm text-slate-500">학생을 등록하고 수업 보고서를 작성해보세요.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>학생</TableHead>
                    <TableHead>평균 점수</TableHead>
                    <TableHead>출석률</TableHead>
                    <TableHead>과제 완성률</TableHead>
                    <TableHead>진도 상태</TableHead>
                    <TableHead>추천사항</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentAnalytics.map(({ student, averageScore, attendanceRate, homeworkCompletion, progressStatus, recommendation }) => (
                    <TableRow key={student.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {getInitials(student.name)}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-slate-900">{student.name}</span>
                            <div className="text-xs text-slate-500">{student.grade} • {student.subject}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">{averageScore}점</TableCell>
                      <TableCell>
                        <span className={cn(
                          "font-medium",
                          attendanceRate >= 90 ? "text-green-600" :
                          attendanceRate >= 80 ? "text-amber-600" : "text-red-600"
                        )}>
                          {attendanceRate}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          "font-medium",
                          homeworkCompletion >= 90 ? "text-green-600" :
                          homeworkCompletion >= 80 ? "text-amber-600" : "text-red-600"
                        )}>
                          {homeworkCompletion}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={cn(
                          progressStatus === "우수" && "bg-green-100 text-green-800 hover:bg-green-100",
                          progressStatus === "보통" && "bg-amber-100 text-amber-800 hover:bg-amber-100",
                          progressStatus === "주의 필요" && "bg-red-100 text-red-800 hover:bg-red-100"
                        )}>
                          {progressStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-600 max-w-32 truncate">
                        {recommendation}
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
