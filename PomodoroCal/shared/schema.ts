import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  title: text("title").notNull(),
  completed: boolean("completed").default(false).notNull(),
  pomodorosCompleted: integer("pomodoros_completed").default(0).notNull(),
  pomodorosRequired: integer("pomodoros_required").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const focusBlocks = pgTable("focus_blocks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  taskId: varchar("task_id").references(() => tasks.id),
  title: text("title").notNull(),
  duration: integer("duration").notNull(), // in minutes
  eventId: text("event_id"), // Google Calendar event ID
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
}).extend({
  userId: z.string().optional(),
});

export const insertFocusBlockSchema = createInsertSchema(focusBlocks).omit({
  id: true,
  createdAt: true,
}).extend({
  userId: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertFocusBlock = z.infer<typeof insertFocusBlockSchema>;
export type FocusBlock = typeof focusBlocks.$inferSelect;

// Calendar event type for Google Calendar integration
export interface CalendarEvent {
  id: string;
  summary: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
}

// Timer session types
export type SessionType = 'pomodoro' | 'shortBreak' | 'longBreak';

// Timer state
export interface TimerState {
  isRunning: boolean;
  timeRemaining: number; // in seconds
  sessionType: SessionType;
  currentTaskId?: string;
}
