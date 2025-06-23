import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { batchService, startBatchScheduler } from "./services/batch";
import { insertStudentSchema, insertDailyReportSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Mock authentication middleware
  app.use("/api", (req, res, next) => {
    // Simple mock user for development
    (req as any).user = { id: 1, username: "김선생님" };
    next();
  });

  // Student management routes
  app.get("/api/students", async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const students = await storage.getStudents(userId);
      res.json(students);
    } catch (error) {
      res.status(500).json({ error: "학생 목록 조회에 실패했습니다." });
    }
  });

  app.post("/api/students", async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const studentData = insertStudentSchema.parse({ ...req.body, userId });
      const student = await storage.createStudent(studentData);
      res.json(student);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "입력 데이터가 올바르지 않습니다.", details: error.errors });
      } else {
        res.status(500).json({ error: "학생 등록에 실패했습니다." });
      }
    }
  });

  app.put("/api/students/:id", async (req, res) => {
    try {
      const studentId = parseInt(req.params.id);
      const updateData = req.body;
      const student = await storage.updateStudent(studentId, updateData);
      
      if (!student) {
        return res.status(404).json({ error: "학생을 찾을 수 없습니다." });
      }
      
      res.json(student);
    } catch (error) {
      res.status(500).json({ error: "학생 정보 수정에 실패했습니다." });
    }
  });

  app.delete("/api/students/:id", async (req, res) => {
    try {
      const studentId = parseInt(req.params.id);
      const success = await storage.deleteStudent(studentId);
      
      if (!success) {
        return res.status(404).json({ error: "학생을 찾을 수 없습니다." });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "학생 삭제에 실패했습니다." });
    }
  });

  // Daily reports routes
  app.get("/api/reports", async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const studentId = req.query.studentId ? parseInt(req.query.studentId as string) : undefined;
      
      let reports;
      if (studentId) {
        reports = await storage.getDailyReportsByStudent(studentId);
      } else {
        reports = await storage.getDailyReports(userId);
      }
      
      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: "보고서 목록 조회에 실패했습니다." });
    }
  });

  app.get("/api/reports/:id", async (req, res) => {
    try {
      const reportId = parseInt(req.params.id);
      const report = await storage.getDailyReport(reportId);
      
      if (!report) {
        return res.status(404).json({ error: "보고서를 찾을 수 없습니다." });
      }
      
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: "보고서 조회에 실패했습니다." });
    }
  });

  app.post("/api/reports", async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const reportData = insertDailyReportSchema.parse({ ...req.body, userId });
      
      // 보고서 생성
      const report = await storage.createDailyReport(reportData);
      
      // 학생 정보 조회
      const student = await storage.getStudent(reportData.studentId);
      if (!student) {
        return res.status(404).json({ error: "학생을 찾을 수 없습니다." });
      }
      
      // AI 보고서 생성을 위한 배치 작업 추가
      await batchService.addReportGenerationTask(report.id, student, reportData);
      
      res.json(report);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "입력 데이터가 올바르지 않습니다.", details: error.errors });
      } else {
        res.status(500).json({ error: "보고서 작성에 실패했습니다." });
      }
    }
  });

  // Batch system routes
  app.get("/api/batch/status", async (req, res) => {
    try {
      const stats = await storage.getBatchStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "배치 상태 조회에 실패했습니다." });
    }
  });

  app.post("/api/batch/process", async (req, res) => {
    try {
      await batchService.processPendingTasks();
      res.json({ message: "배치 처리가 시작되었습니다." });
    } catch (error) {
      res.status(500).json({ error: "배치 처리 실행에 실패했습니다." });
    }
  });

  app.get("/api/batch/queue", async (req, res) => {
    try {
      const queue = await storage.getBatchQueue();
      res.json(queue);
    } catch (error) {
      res.status(500).json({ error: "배치 큐 조회에 실패했습니다." });
    }
  });

  // Analytics routes
  app.get("/api/analytics/stats", async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const students = await storage.getStudents(userId);
      const reports = await storage.getDailyReports(userId);
      
      const stats = {
        totalStudents: students.length,
        weeklyClasses: reports.filter(r => {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return new Date(r.classDate) >= weekAgo;
        }).length,
        generatedReports: reports.filter(r => r.aiProcessingStatus === "completed").length,
        averageScore: Math.round(
          reports.reduce((sum, r) => sum + (r.homeworkScore || 0), 0) / 
          (reports.filter(r => r.homeworkScore).length || 1)
        ),
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "통계 조회에 실패했습니다." });
    }
  });

  // Start batch scheduler
  startBatchScheduler();

  const httpServer = createServer(app);
  return httpServer;
}
