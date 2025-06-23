import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertDailyReportSchema, type InsertDailyReport, type Student } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  students: Student[];
}

export default function ReportModal({ open, onClose, students }: ReportModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertDailyReport>({
    resolver: zodResolver(insertDailyReportSchema),
    defaultValues: {
      classDate: new Date().toISOString().split('T')[0],
      lessonTopics: "",
      homeworkScore: 0,
      studentNotes: "",
      nextAssignment: "",
    },
  });

  const createReportMutation = useMutation({
    mutationFn: async (data: InsertDailyReport) => {
      const response = await apiRequest("POST", "/api/reports", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      toast({
        title: "보고서 작성 완료",
        description: "AI 보고서 생성이 배치 큐에 추가되었습니다.",
      });
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "보고서 작성 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertDailyReport) => {
    createReportMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>새 수업 보고서 작성</DialogTitle>
          <DialogDescription>
            수업 내용을 기록하면 AI가 자동으로 학부모용 보고서를 생성합니다.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>학생 선택</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="학생을 선택하세요" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id.toString()}>
                          {student.name} ({student.grade} • {student.subject})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="classDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>수업일</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lessonTopics"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>수업 주제</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="오늘 배운 내용을 입력하세요..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="homeworkScore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>숙제 점수</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0" 
                      max="100" 
                      placeholder="점수를 입력하세요 (0-100)"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="studentNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>수업 중 관찰사항</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="학생의 이해도, 참여도, 특이사항 등을 기록하세요..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nextAssignment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>다음 과제</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="다음 수업까지 할 과제를 입력하세요..."
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                취소
              </Button>
              <Button 
                type="submit" 
                disabled={createReportMutation.isPending}
              >
                {createReportMutation.isPending ? "작성 중..." : "보고서 작성"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
