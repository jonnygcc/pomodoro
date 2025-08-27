import { type User, type InsertUser, type Task, type InsertTask, type FocusBlock, type InsertFocusBlock } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Task operations
  getTasks(userId: string): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;
  
  // Focus block operations
  createFocusBlock(focusBlock: InsertFocusBlock): Promise<FocusBlock>;
  getFocusBlocks(userId: string): Promise<FocusBlock[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private tasks: Map<string, Task>;
  private focusBlocks: Map<string, FocusBlock>;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.focusBlocks = new Map();
    
    // Initialize with demo data
    this.initializeDemoData();
  }

  private async initializeDemoData() {
    // Create demo user
    const demoUser = await this.createUser({
      username: "demo",
      password: "demo"
    });

    // Create demo tasks
    const demoTasks = [
      { title: "Meditation", completed: true, pomodorosCompleted: 1, pomodorosRequired: 1, userId: demoUser.id },
      { title: "Read an article on Design Trends", completed: true, pomodorosCompleted: 1, pomodorosRequired: 1, userId: demoUser.id },
      { title: "Practice Motion Design (After Effects)", completed: false, pomodorosCompleted: 1, pomodorosRequired: 2, userId: demoUser.id },
      { title: "Watch a movie", completed: false, pomodorosCompleted: 0, pomodorosRequired: 2, userId: demoUser.id },
      { title: "Evening Workout", completed: false, pomodorosCompleted: 0, pomodorosRequired: 2, userId: demoUser.id },
      { title: "Sketch wireframe for Mingle Landing Page", completed: false, pomodorosCompleted: 0, pomodorosRequired: 2, userId: demoUser.id },
      { title: "Continue a design system portfolio", completed: false, pomodorosCompleted: 0, pomodorosRequired: 3, userId: demoUser.id },
    ];

    for (const task of demoTasks) {
      await this.createTask(task);
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getTasks(userId: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.userId === userId);
  }

  async getTask(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = randomUUID();
    const task: Task = {
      ...insertTask,
      id,
      userId: insertTask.userId || null,
      createdAt: new Date(),
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const existingTask = this.tasks.get(id);
    if (!existingTask) return undefined;
    
    const updatedTask = { ...existingTask, ...updates };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }

  async createFocusBlock(insertFocusBlock: InsertFocusBlock): Promise<FocusBlock> {
    const id = randomUUID();
    const focusBlock: FocusBlock = {
      ...insertFocusBlock,
      id,
      userId: insertFocusBlock.userId || null,
      taskId: insertFocusBlock.taskId || null,
      eventId: insertFocusBlock.eventId || null,
      createdAt: new Date(),
    };
    this.focusBlocks.set(id, focusBlock);
    return focusBlock;
  }

  async getFocusBlocks(userId: string): Promise<FocusBlock[]> {
    return Array.from(this.focusBlocks.values()).filter(block => block.userId === userId);
  }
}

export const storage = new MemStorage();
