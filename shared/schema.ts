import { pgTable, text, serial, integer, date, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  grade: varchar("grade", { length: 50 }),
  subject: varchar("subject", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  parentPhone: varchar("parent_phone", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dailyReports = pgTable("daily_reports", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  classDate: date("class_date").notNull(),
  lessonTopics: text("lesson_topics"),
  homeworkScore: integer("homework_score"),
  studentNotes: text("student_notes"),
  nextAssignment: text("next_assignment"),
  aiReport: text("ai_report"),
  aiProcessingStatus: varchar("ai_processing_status", { length: 20 }).default("pending"),
  aiProcessedAt: timestamp("ai_processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const batchQueue = pgTable("batch_queue", {
  id: serial("id").primaryKey(),
  taskType: varchar("task_type", { length: 50 }).notNull(),
  taskData: jsonb("task_data").notNull(),
  priority: integer("priority").default(2),
  status: varchar("status", { length: 20 }).default("pending"),
  attempts: integer("attempts").default(0),
  maxAttempts: integer("max_attempts").default(3),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  students: many(students),
  dailyReports: many(dailyReports),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, {
    fields: [students.userId],
    references: [users.id],
  }),
  dailyReports: many(dailyReports),
}));

export const dailyReportsRelations = relations(dailyReports, ({ one }) => ({
  student: one(students, {
    fields: [dailyReports.studentId],
    references: [students.id],
  }),
  user: one(users, {
    fields: [dailyReports.userId],
    references: [users.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true,
});

export const insertDailyReportSchema = createInsertSchema(dailyReports).omit({
  id: true,
  aiReport: true,
  aiProcessingStatus: true,
  aiProcessedAt: true,
  createdAt: true,
});

export const insertBatchQueueSchema = createInsertSchema(batchQueue).omit({
  id: true,
  status: true,
  attempts: true,
  errorMessage: true,
  createdAt: true,
  processedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type DailyReport = typeof dailyReports.$inferSelect;
export type InsertDailyReport = z.infer<typeof insertDailyReportSchema>;
export type BatchQueue = typeof batchQueue.$inferSelect;
export type InsertBatchQueue = z.infer<typeof insertBatchQueueSchema>;
