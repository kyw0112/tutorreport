import { Student } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Phone, User, BookOpen, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentCardProps {
  student: Student;
  onEdit: (student: Student) => void;
  onDelete: (studentId: number) => void;
  progress?: number;
}

export default function StudentCard({ student, onEdit, onDelete, progress = 0 }: StudentCardProps) {
  const getInitials = (name: string) => {
    return name.charAt(0);
  };

  const getProgressColor = (score: number) => {
    if (score >= 85) return "green";
    if (score >= 70) return "amber";
    return "red";
  };

  const progressColor = getProgressColor(progress);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-lg font-medium text-blue-600">
                {getInitials(student.name)}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{student.name}</h3>
              <p className="text-sm text-slate-500">{student.grade}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(student)}
              className="text-slate-400 hover:text-slate-600"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(student.id)}
              className="text-slate-400 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
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
              {student.createdAt ? new Date(student.createdAt).toLocaleDateString('ko-KR') : '-'}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">이번 주 진도</span>
            <span className="text-sm font-medium text-slate-900">{progress}%</span>
          </div>
          <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
            <div 
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                progressColor === "green" && "bg-green-500",
                progressColor === "amber" && "bg-amber-500",
                progressColor === "red" && "bg-red-500"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <Button 
          variant="secondary" 
          className="w-full mt-4"
          onClick={() => {/* Navigate to student detail */}}
        >
          상세 정보 보기
        </Button>
      </CardContent>
    </Card>
  );
}
