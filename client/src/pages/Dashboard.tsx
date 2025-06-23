import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, FileText, TrendingUp, Clock, CheckCircle, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/analytics/stats"],
  });

  const { data: batchStats } = useQuery({
    queryKey: ["/api/batch/status"],
    refetchInterval: 5000,
  });

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-slate-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const mockRecentActivities = [
    {
      id: 1,
      type: "student_added",
      message: "김민수 학생 등록",
      detail: "고등학교 2학년 • 수학",
      time: "2시간 전",
      icon: UserPlus,
      color: "blue"
    },
    {
      id: 2,
      type: "report_completed",
      message: "박지원 보고서 생성 완료",
      detail: "AI 보고서 자동 생성",
      time: "4시간 전",
      icon: CheckCircle,
      color: "green"
    },
    {
      id: 3,
      type: "class_completed",
      message: "이수진 수업 완료",
      detail: "영어 • 문법 집중 학습",
      time: "6시간 전",
      icon: Calendar,
      color: "purple"
    },
    {
      id: 4,
      type: "batch_started",
      message: "배치 처리 시작",
      detail: "3개 보고서 AI 생성 중",
      time: "10분 전",
      icon: Clock,
      color: "amber"
    }
  ];

  const mockStudentOverview = [
    { id: 1, name: "김민수", grade: "고2", subject: "수학", progress: 85, color: "blue" },
    { id: 2, name: "박지원", grade: "중3", subject: "영어", progress: 92, color: "purple" },
    { id: 3, name: "이수진", grade: "고1", subject: "국어", progress: 78, color: "green" },
    { id: 4, name: "최동욱", grade: "중2", subject: "과학", progress: 65, color: "red" }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">전체 학생</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats?.totalStudents || 0}명
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="text-blue-600 text-xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">+12%</span>
              <span className="text-slate-500 ml-2">지난 달 대비</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">이번 주 수업</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats?.weeklyClasses || 0}회
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="text-green-600 text-xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">+5%</span>
              <span className="text-slate-500 ml-2">지난 주 대비</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">생성된 보고서</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats?.generatedReports || 0}개
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="text-purple-600 text-xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">+18%</span>
              <span className="text-slate-500 ml-2">지난 달 대비</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">평균 성취도</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats?.averageScore || 0}점
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-amber-600 text-xl" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">+3%</span>
              <span className="text-slate-500 ml-2">지난 달 대비</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Progress Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>주간 수업 진행 현황</CardTitle>
              <Select defaultValue="4weeks">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4weeks">최근 4주</SelectItem>
                  <SelectItem value="8weeks">최근 8주</SelectItem>
                  <SelectItem value="12weeks">최근 12주</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">주간 진도 차트</p>
                <p className="text-sm text-slate-500">Chart.js 라이브러리로 구현 예정</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRecentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    activity.color === 'blue' ? 'bg-blue-100' :
                    activity.color === 'green' ? 'bg-green-100' :
                    activity.color === 'purple' ? 'bg-purple-100' :
                    'bg-amber-100'
                  }`}>
                    <activity.icon className={`text-xs ${
                      activity.color === 'blue' ? 'text-blue-600' :
                      activity.color === 'green' ? 'text-green-600' :
                      activity.color === 'purple' ? 'text-purple-600' :
                      'text-amber-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{activity.message}</p>
                    <p className="text-xs text-slate-500">{activity.detail}</p>
                    <p className="text-xs text-slate-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-sm font-medium">
              모든 활동 보기
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Students Quick Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>학생 현황 요약</CardTitle>
            <Button variant="ghost" className="text-sm font-medium">
              전체 보기
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockStudentOverview.map((student) => (
              <div key={student.id} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    student.color === 'blue' ? 'bg-blue-100' :
                    student.color === 'purple' ? 'bg-purple-100' :
                    student.color === 'green' ? 'bg-green-100' :
                    'bg-red-100'
                  }`}>
                    <span className={`text-sm font-medium ${
                      student.color === 'blue' ? 'text-blue-600' :
                      student.color === 'purple' ? 'text-purple-600' :
                      student.color === 'green' ? 'text-green-600' :
                      'text-red-600'
                    }`}>
                      {student.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{student.name}</p>
                    <p className="text-xs text-slate-500">{student.grade} • {student.subject}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">이번 주 진도</span>
                    <span className="font-medium text-slate-900">{student.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        student.progress >= 85 ? 'bg-green-500' :
                        student.progress >= 70 ? 'bg-amber-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${student.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
