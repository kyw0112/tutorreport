import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Student } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Plus, Search, Users } from "lucide-react";
import StudentCard from "@/components/StudentCard";
import StudentModal from "@/components/StudentModal";

export default function Students() {
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<number | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: students = [], isLoading } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const deleteStudentMutation = useMutation({
    mutationFn: async (studentId: number) => {
      const response = await apiRequest("DELETE", `/api/students/${studentId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      toast({
        title: "학생 삭제 완료",
        description: "학생이 성공적으로 삭제되었습니다.",
      });
      setDeleteDialogOpen(false);
      setStudentToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "학생 삭제 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mock progress data - in real app, this would come from reports
  const mockProgressData: Record<number, number> = {
    1: 85,
    2: 92,
    3: 78,
    4: 65,
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = gradeFilter === "all" || 
                        (gradeFilter === "elementary" && student.grade?.includes("초등")) ||
                        (gradeFilter === "middle" && student.grade?.includes("중학")) ||
                        (gradeFilter === "high" && student.grade?.includes("고등"));
    const matchesSubject = subjectFilter === "all" || student.subject === subjectFilter;

    return matchesSearch && matchesGrade && matchesSubject;
  });

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const handleDeleteStudent = (studentId: number) => {
    setStudentToDelete(studentId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (studentToDelete) {
      deleteStudentMutation.mutate(studentToDelete);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-1/3"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-slate-200 p-6 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-2/3"></div>
            </div>
          ))}
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
          새 학생 등록
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="학생 이름 또는 과목으로 검색..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={gradeFilter} onValueChange={setGradeFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="학년 필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 학년</SelectItem>
              <SelectItem value="elementary">초등학교</SelectItem>
              <SelectItem value="middle">중학교</SelectItem>
              <SelectItem value="high">고등학교</SelectItem>
            </SelectContent>
          </Select>
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-full md:w-32">
              <SelectValue placeholder="과목 필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 과목</SelectItem>
              <SelectItem value="수학">수학</SelectItem>
              <SelectItem value="영어">영어</SelectItem>
              <SelectItem value="국어">국어</SelectItem>
              <SelectItem value="과학">과학</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Students Grid */}
      {filteredStudents.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900">학생이 없습니다</h3>
          <p className="mt-1 text-sm text-slate-500">
            {searchTerm || gradeFilter !== "all" || subjectFilter !== "all"
              ? "검색 조건에 맞는 학생을 찾을 수 없습니다."
              : "새 학생을 등록해보세요."
            }
          </p>
          {!searchTerm && gradeFilter === "all" && subjectFilter === "all" && (
            <div className="mt-6">
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                새 학생 등록
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              onEdit={handleEditStudent}
              onDelete={handleDeleteStudent}
              progress={mockProgressData[student.id] || 0}
            />
          ))}
        </div>
      )}

      {/* Student Modal */}
      <StudentModal
        open={isModalOpen}
        onClose={handleCloseModal}
        student={editingStudent}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>학생 삭제 확인</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 이 학생을 삭제하시겠습니까? 
              삭제된 학생의 모든 수업 보고서도 함께 삭제됩니다. 
              이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteStudentMutation.isPending}
            >
              {deleteStudentMutation.isPending ? "삭제 중..." : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
