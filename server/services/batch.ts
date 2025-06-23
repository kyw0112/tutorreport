import { storage } from "../storage";
import { generateKoreanReport, analyzeStudentProgress } from "./openai";
import { eq } from "drizzle-orm";

export class BatchQueueService {
  private isProcessing = false;

  async processPendingTasks(): Promise<void> {
    if (this.isProcessing) {
      console.log("배치 처리가 이미 진행 중입니다.");
      return;
    }

    this.isProcessing = true;
    console.log("배치 큐 처리 시작...");

    try {
      const pendingTasks = await storage.getPendingBatchTasks();
      console.log(`처리할 작업 수: ${pendingTasks.length}`);

      for (const task of pendingTasks) {
        try {
          await this.processTask(task);
        } catch (error) {
          console.error(`작업 ${task.id} 처리 실패:`, error);
          await this.handleTaskFailure(task, error as Error);
        }
      }
    } catch (error) {
      console.error("배치 처리 중 오류:", error);
    } finally {
      this.isProcessing = false;
      console.log("배치 큐 처리 완료");
    }
  }

  private async processTask(task: any): Promise<void> {
    console.log(`작업 ${task.id} 처리 시작 (타입: ${task.taskType})`);

    // 작업 상태를 processing으로 변경
    await storage.updateBatchTask(task.id, {
      status: "processing",
      attempts: task.attempts + 1,
    });

    switch (task.taskType) {
      case "report_generation":
        await this.processReportGeneration(task);
        break;
      case "student_analysis":
        await this.processStudentAnalysis(task);
        break;
      default:
        throw new Error(`알 수 없는 작업 타입: ${task.taskType}`);
    }

    // 작업 완료 상태로 변경
    await storage.updateBatchTask(task.id, {
      status: "completed",
      processedAt: new Date(),
    });

    console.log(`작업 ${task.id} 처리 완료`);
  }

  private async processReportGeneration(task: any): Promise<void> {
    const { reportId, studentData, reportData } = task.taskData;

    const aiReport = await generateKoreanReport({
      studentName: studentData.name,
      grade: studentData.grade,
      subject: studentData.subject,
      classDate: reportData.classDate,
      lessonTopics: reportData.lessonTopics,
      homeworkScore: reportData.homeworkScore,
      studentNotes: reportData.studentNotes,
      nextAssignment: reportData.nextAssignment,
    });

    // 생성된 AI 보고서를 데이터베이스에 저장
    await storage.updateDailyReport(reportId, {
      aiReport,
      aiProcessingStatus: "completed",
      aiProcessedAt: new Date(),
    });
  }

  private async processStudentAnalysis(task: any): Promise<void> {
    const { studentId, analysisData } = task.taskData;

    const analysis = await analyzeStudentProgress(analysisData);
    
    console.log(`학생 ${studentId} 분석 완료:`, analysis);
    // 필요시 분석 결과를 별도 테이블에 저장하거나 로그로 기록
  }

  private async handleTaskFailure(task: any, error: Error): Promise<void> {
    const newAttempts = task.attempts + 1;

    if (newAttempts >= task.maxAttempts) {
      // 최대 재시도 횟수 초과 시 실패 처리
      await storage.updateBatchTask(task.id, {
        status: "failed",
        attempts: newAttempts,
        errorMessage: error.message,
        processedAt: new Date(),
      });

      // 관련 보고서 상태도 실패로 변경
      if (task.taskType === "report_generation" && task.taskData.reportId) {
        await storage.updateDailyReport(task.taskData.reportId, {
          aiProcessingStatus: "failed",
        });
      }
    } else {
      // 재시도 가능한 경우 대기 상태로 변경
      await storage.updateBatchTask(task.id, {
        status: "pending",
        attempts: newAttempts,
        errorMessage: error.message,
      });
    }
  }

  async addReportGenerationTask(reportId: number, studentData: any, reportData: any, priority = 1): Promise<void> {
    await storage.createBatchTask({
      taskType: "report_generation",
      taskData: { reportId, studentData, reportData },
      priority,
    });
  }

  async addStudentAnalysisTask(studentId: number, analysisData: any, priority = 2): Promise<void> {
    await storage.createBatchTask({
      taskType: "student_analysis",
      taskData: { studentId, analysisData },
      priority,
    });
  }
}

export const batchService = new BatchQueueService();

// 배치 스케줄러 - 30초마다 실행
export function startBatchScheduler(): void {
  setInterval(async () => {
    try {
      await batchService.processPendingTasks();
    } catch (error) {
      console.error("배치 스케줄러 오류:", error);
    }
  }, 30000); // 30초

  console.log("배치 스케줄러가 시작되었습니다 (30초 간격)");
}
