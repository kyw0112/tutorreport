import { users, students, dailyReports, batchQueue, type User, type InsertUser, type Student, type InsertStudent, type DailyReport, type InsertDailyReport, type BatchQueue, type InsertBatchQueue } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Student methods
  getStudents(userId: number): Promise<Student[]>;
  getStudent(id: number): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: number, student: Partial<InsertStudent>): Promise<Student | undefined>;
  deleteStudent(id: number): Promise<boolean>;

  // Daily report methods
  getDailyReports(userId: number): Promise<DailyReport[]>;
  getDailyReportsByStudent(studentId: number): Promise<DailyReport[]>;
  getDailyReport(id: number): Promise<DailyReport | undefined>;
  createDailyReport(report: InsertDailyReport): Promise<DailyReport>;
  updateDailyReport(id: number, report: Partial<DailyReport>): Promise<DailyReport | undefined>;
  deleteDailyReport(id: number): Promise<boolean>;

  // Batch queue methods
  getBatchQueue(): Promise<BatchQueue[]>;
  getPendingBatchTasks(): Promise<BatchQueue[]>;
  createBatchTask(task: InsertBatchQueue): Promise<BatchQueue>;
  updateBatchTask(id: number, task: Partial<BatchQueue>): Promise<BatchQueue | undefined>;
  getBatchStats(): Promise<{ pendingCount: number; processingCount: number; lastProcessed: Date | null }>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Student methods
  async getStudents(userId: number): Promise<Student[]> {
    return await db.select().from(students).where(eq(students.userId, userId)).orderBy(desc(students.createdAt));
  }

  async getStudent(id: number): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student || undefined;
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const [newStudent] = await db.insert(students).values(student).returning();
    return newStudent;
  }

  async updateStudent(id: number, student: Partial<InsertStudent>): Promise<Student | undefined> {
    const [updatedStudent] = await db.update(students).set(student).where(eq(students.id, id)).returning();
    return updatedStudent || undefined;
  }

  async deleteStudent(id: number): Promise<boolean> {
    const result = await db.delete(students).where(eq(students.id, id));
    return result.rowCount > 0;
  }

  // Daily report methods
  async getDailyReports(userId: number): Promise<DailyReport[]> {
    return await db.select().from(dailyReports).where(eq(dailyReports.userId, userId)).orderBy(desc(dailyReports.classDate));
  }

  async getDailyReportsByStudent(studentId: number): Promise<DailyReport[]> {
    return await db.select().from(dailyReports).where(eq(dailyReports.studentId, studentId)).orderBy(desc(dailyReports.classDate));
  }

  async getDailyReport(id: number): Promise<DailyReport | undefined> {
    const [report] = await db.select().from(dailyReports).where(eq(dailyReports.id, id));
    return report || undefined;
  }

  async createDailyReport(report: InsertDailyReport): Promise<DailyReport> {
    const [newReport] = await db.insert(dailyReports).values(report).returning();
    return newReport;
  }

  async updateDailyReport(id: number, report: Partial<DailyReport>): Promise<DailyReport | undefined> {
    const [updatedReport] = await db.update(dailyReports).set(report).where(eq(dailyReports.id, id)).returning();
    return updatedReport || undefined;
  }

  async deleteDailyReport(id: number): Promise<boolean> {
    const result = await db.delete(dailyReports).where(eq(dailyReports.id, id));
    return result.rowCount > 0;
  }

  // Batch queue methods
  async getBatchQueue(): Promise<BatchQueue[]> {
    return await db.select().from(batchQueue).orderBy(desc(batchQueue.createdAt));
  }

  async getPendingBatchTasks(): Promise<BatchQueue[]> {
    return await db.select().from(batchQueue)
      .where(and(
        eq(batchQueue.status, "pending"),
        sql`${batchQueue.attempts} < ${batchQueue.maxAttempts}`
      ))
      .orderBy(batchQueue.priority, batchQueue.createdAt);
  }

  async createBatchTask(task: InsertBatchQueue): Promise<BatchQueue> {
    const [newTask] = await db.insert(batchQueue).values(task).returning();
    return newTask;
  }

  async updateBatchTask(id: number, task: Partial<BatchQueue>): Promise<BatchQueue | undefined> {
    const [updatedTask] = await db.update(batchQueue).set(task).where(eq(batchQueue.id, id)).returning();
    return updatedTask || undefined;
  }

  async getBatchStats(): Promise<{ pendingCount: number; processingCount: number; lastProcessed: Date | null }> {
    const [pendingResult] = await db.select({ count: sql<number>`count(*)` }).from(batchQueue).where(eq(batchQueue.status, "pending"));
    const [processingResult] = await db.select({ count: sql<number>`count(*)` }).from(batchQueue).where(eq(batchQueue.status, "processing"));
    const [lastProcessedResult] = await db.select({ processedAt: batchQueue.processedAt }).from(batchQueue)
      .where(eq(batchQueue.status, "completed"))
      .orderBy(desc(batchQueue.processedAt))
      .limit(1);

    return {
      pendingCount: pendingResult?.count || 0,
      processingCount: processingResult?.count || 0,
      lastProcessed: lastProcessedResult?.processedAt || null,
    };
  }
}

export const storage = new DatabaseStorage();
