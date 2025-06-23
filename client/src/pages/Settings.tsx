import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { User, Bell, Globe, Clock, Zap, RefreshCw } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

const profileSchema = z.object({
  name: z.string().min(1, "이름을 입력하세요"),
  email: z.string().email("올바른 이메일을 입력하세요"),
  phone: z.string().optional(),
});

type ProfileData = z.infer<typeof profileSchema>;

export default function Settings() {
  const [notifications, setNotifications] = useState({
    newReports: true,
    batchCompleted: true,
    weeklyReports: false,
  });

  const [systemSettings, setSystemSettings] = useState({
    language: "ko",
    timezone: "Asia/Seoul",
    batchInterval: "30",
    reportStyle: "formal",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: batchStats, isLoading: batchLoading } = useQuery({
    queryKey: ["/api/batch/status"],
    refetchInterval: 5000,
  });

  const { data: batchQueue = [], isLoading: queueLoading } = useQuery({
    queryKey: ["/api/batch/queue"],
    refetchInterval: 10000,
  });

  const form = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "김선생님",
      email: "teacher@example.com",
      phone: "010-1234-5678",
    },
  });

  const processBatchMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/batch/process");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/batch/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/batch/queue"] });
      toast({
        title: "배치 처리 시작",
        description: "배치 처리가 수동으로 시작되었습니다.",
      });
    },
    onError: (error) => {
      toast({
        title: "배치 처리 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileData) => {
      // In a real app, this would call an API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      return data;
    },
    onSuccess: () => {
      toast({
        title: "프로필 업데이트 완료",
        description: "프로필 정보가 성공적으로 업데이트되었습니다.",
      });
    },
    onError: (error) => {
      toast({
        title: "프로필 업데이트 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmitProfile = (data: ProfileData) => {
    updateProfileMutation.mutate(data);
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    toast({
      title: "알림 설정 변경",
      description: "알림 설정이 저장되었습니다.",
    });
  };

  const handleSystemSettingChange = (key: string, value: string) => {
    setSystemSettings(prev => ({ ...prev, [key]: value }));
    toast({
      title: "시스템 설정 변경",
      description: "설정이 저장되었습니다.",
    });
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

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              프로필 설정
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitProfile)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>사용자명</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>이메일</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>연락처</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  disabled={updateProfileMutation.isPending}
                  className="w-full"
                >
                  {updateProfileMutation.isPending ? "업데이트 중..." : "프로필 업데이트"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              알림 설정
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="newReports" className="text-sm font-medium">새 보고서 생성 알림</Label>
                <p className="text-xs text-slate-500">AI 보고서가 생성될 때 알림을 받습니다</p>
              </div>
              <Checkbox
                id="newReports"
                checked={notifications.newReports}
                onCheckedChange={(checked) => handleNotificationChange('newReports', checked as boolean)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="batchCompleted" className="text-sm font-medium">배치 처리 완료 알림</Label>
                <p className="text-xs text-slate-500">배치 작업이 완료될 때 알림을 받습니다</p>
              </div>
              <Checkbox
                id="batchCompleted"
                checked={notifications.batchCompleted}
                onCheckedChange={(checked) => handleNotificationChange('batchCompleted', checked as boolean)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="weeklyReports" className="text-sm font-medium">주간 요약 보고서</Label>
                <p className="text-xs text-slate-500">매주 학습 진도 요약을 받습니다</p>
              </div>
              <Checkbox
                id="weeklyReports"
                checked={notifications.weeklyReports}
                onCheckedChange={(checked) => handleNotificationChange('weeklyReports', checked as boolean)}
              />
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              시스템 설정
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">언어 설정</Label>
              <Select 
                value={systemSettings.language} 
                onValueChange={(value) => handleSystemSettingChange('language', value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ko">한국어</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">시간대</Label>
              <Select 
                value={systemSettings.timezone} 
                onValueChange={(value) => handleSystemSettingChange('timezone', value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Seoul">서울 (UTC+9)</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">배치 처리 주기</Label>
              <Select 
                value={systemSettings.batchInterval} 
                onValueChange={(value) => handleSystemSettingChange('batchInterval', value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30초</SelectItem>
                  <SelectItem value="60">1분</SelectItem>
                  <SelectItem value="300">5분</SelectItem>
                  <SelectItem value="900">15분</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">보고서 생성 스타일</Label>
              <Select 
                value={systemSettings.reportStyle} 
                onValueChange={(value) => handleSystemSettingChange('reportStyle', value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="formal">정식</SelectItem>
                  <SelectItem value="friendly">친근한</SelectItem>
                  <SelectItem value="detailed">상세한</SelectItem>
                  <SelectItem value="concise">간결한</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* AI & Batch Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              AI 및 배치 설정
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {batchLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            ) : (
              <>
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">대기 중인 작업</span>
                    <span className="text-sm font-medium text-slate-900">
                      {batchStats?.pendingCount || 0}개
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">처리 중인 작업</span>
                    <span className="text-sm font-medium text-slate-900">
                      {batchStats?.processingCount || 0}개
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">마지막 처리 시간</span>
                    <span className="text-sm font-medium text-slate-900">
                      {batchStats?.lastProcessed 
                        ? formatDateTime(batchStats.lastProcessed)
                        : "없음"
                      }
                    </span>
                  </div>
                </div>

                <Button 
                  onClick={() => processBatchMutation.mutate()}
                  disabled={processBatchMutation.isPending}
                  className="w-full"
                  variant="outline"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${processBatchMutation.isPending ? 'animate-spin' : ''}`} />
                  {processBatchMutation.isPending ? "처리 중..." : "수동 배치 처리 실행"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Batch Queue Status */}
      {!queueLoading && batchQueue.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              배치 큐 현황
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {batchQueue.slice(0, 10).map((task: any) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-slate-900">
                        {task.taskType === 'report_generation' ? '보고서 생성' : '학생 분석'}
                      </span>
                      {getStatusBadge(task.status)}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      생성: {formatDateTime(task.createdAt)}
                      {task.attempts > 0 && ` • 시도: ${task.attempts}/${task.maxAttempts}`}
                    </p>
                    {task.errorMessage && (
                      <p className="text-xs text-red-600 mt-1">
                        오류: {task.errorMessage}
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">
                    우선순위: {task.priority}
                  </div>
                </div>
              ))}
              {batchQueue.length > 10 && (
                <p className="text-sm text-slate-500 text-center py-2">
                  {batchQueue.length - 10}개 항목 더 있음...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
