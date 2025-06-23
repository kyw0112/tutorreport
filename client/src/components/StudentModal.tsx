import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertStudentSchema, type InsertStudent, type Student } from "@shared/schema";
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
import { Button } from "@/components/ui/button";

interface StudentModalProps {
  open: boolean;
  onClose: () => void;
  student?: Student | null;
}

const gradeOptions = [
  "초등학교 1학년", "초등학교 2학년", "초등학교 3학년", "초등학교 4학년", "초등학교 5학년", "초등학교 6학년",
  "중학교 1학년", "중학교 2학년", "중학교 3학년",
  "고등학교 1학년", "고등학교 2학년", "고등학교 3학년"
];

const subjectOptions = [
  "수학", "영어", "국어", "과학", "사회", "한국사", "물리", "화학", "생물", "지구과학"
];

export default function StudentModal({ open, onClose, student }: StudentModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!student;

  const form = useForm<InsertStudent>({
    resolver: zodResolver(insertStudentSchema.omit({ userId: true })),
    defaultValues: {
      name: "",
      grade: "",
      subject: "",
      phone: "",
      parentPhone: "",
    },
  });

  useEffect(() => {
    if (student) {
      form.reset({
        name: student.name,
        grade: student.grade || "",
        subject: student.subject || "",
        phone: student.phone || "",
        parentPhone: student.parentPhone || "",
      });
    } else {
      form.reset({
        name: "",
        grade: "",
        subject: "",
        phone: "",
        parentPhone: "",
      });
    }
  }, [student, form]);

  const createStudentMutation = useMutation({
    mutationFn: async (data: InsertStudent) => {
      const response = await apiRequest("POST", "/api/students", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      toast({
        title: "학생 등록 완료",
        description: "새 학생이 성공적으로 등록되었습니다.",
      });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "학생 등록 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateStudentMutation = useMutation({
    mutationFn: async (data: InsertStudent) => {
      const response = await apiRequest("PUT", `/api/students/${student!.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      toast({
        title: "학생 정보 수정 완료",
        description: "학생 정보가 성공적으로 수정되었습니다.",
      });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "학생 정보 수정 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = (data: InsertStudent) => {
    if (isEditing) {
      updateStudentMutation.mutate(data);
    } else {
      createStudentMutation.mutate(data);
    }
  };

  const isPending = createStudentMutation.isPending || updateStudentMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "학생 정보 수정" : "새 학생 등록"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "학생의 정보를 수정하세요." 
              : "새로운 학생의 정보를 입력하세요."
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>학생 이름</FormLabel>
                  <FormControl>
                    <Input placeholder="학생 이름을 입력하세요" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="grade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>학년</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="학년을 선택하세요" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {gradeOptions.map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          {grade}
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
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>과목</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="과목을 선택하세요" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjectOptions.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
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
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>학생 연락처</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="010-0000-0000" 
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parentPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>학부모 연락처</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="010-0000-0000" 
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                취소
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending 
                  ? (isEditing ? "수정 중..." : "등록 중...") 
                  : (isEditing ? "수정하기" : "등록하기")
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
