import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage.js";
import { getAuthUrl, exchangeCodeForTokens, revokeTokens } from "./google.js";
import { listUpcomingEvents, createFocusEvent, getNextMeeting, calculateSmartAdjustTime } from "./calendar.js";
import { insertTaskSchema, insertFocusBlockSchema } from "@shared/schema.js";

// Extend session data to include userId
declare module 'express-session' {
  interface SessionData {
    userId?: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'alegra-time-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    next();
  };

  // Demo login endpoint (since we don't have full auth system)
  app.post('/api/login', async (req, res) => {
    try {
      const demoUser = await storage.getUserByUsername('demo');
      if (demoUser) {
        req.session.userId = demoUser.id;
        res.json({ user: { id: demoUser.id, username: demoUser.username } });
      } else {
        res.status(404).json({ message: 'Demo user not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Login failed' });
    }
  });

  // Google OAuth routes
  app.get('/api/auth', (req, res) => {
    try {
      const authUrl = getAuthUrl();
      res.redirect(authUrl);
    } catch (error) {
      res.status(500).json({ message: 'Failed to initiate OAuth' });
    }
  });

  app.get('/api/oauth2callback', async (req, res) => {
    const { code, error } = req.query;

    if (error) {
      return res.status(400).json({ message: `OAuth error: ${error}` });
    }

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ message: 'Missing authorization code' });
    }

    try {
      await exchangeCodeForTokens(code);
      res.redirect('/'); // Redirect to frontend
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.status(500).json({ message: 'Failed to exchange authorization code' });
    }
  });

  app.post('/api/logout', async (req, res) => {
    try {
      await revokeTokens();
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destruction error:', err);
        }
        res.json({ message: 'Logged out successfully' });
      });
    } catch (error) {
      res.status(500).json({ message: 'Logout failed' });
    }
  });

  // Calendar routes
  app.get('/api/next-events', async (req, res) => {
    try {
      const windowMins = parseInt(req.query.window as string) || 180;
      const events = await listUpcomingEvents({ windowMins });
      
      const nextMeeting = getNextMeeting(events);
      let smartAdjustSuggestion = null;
      
      if (nextMeeting) {
        const meetingTime = new Date(nextMeeting.start.dateTime || nextMeeting.start.date!);
        const adjustedTime = calculateSmartAdjustTime(meetingTime);
        if (adjustedTime !== null) {
          smartAdjustSuggestion = {
            originalMeeting: nextMeeting,
            suggestedDuration: adjustedTime,
            reason: adjustedTime === 0 ? 'Meeting starts too soon' : `Finish ${3} minutes before meeting`
          };
        }
      }

      res.json({
        events,
        nextMeeting,
        smartAdjustSuggestion
      });
    } catch (error) {
      console.error('Failed to fetch calendar events:', error);
      res.status(500).json({ message: 'Failed to fetch calendar events' });
    }
  });

  app.post('/api/focus-block', requireAuth, async (req, res) => {
    try {
      const { title, duration, taskId } = insertFocusBlockSchema.parse({
        ...req.body,
        userId: req.session.userId
      });

      const eventId = await createFocusEvent({
        title,
        minutes: duration,
        startTime: new Date()
      });

      const focusBlock = await storage.createFocusBlock({
        userId: req.session.userId,
        taskId,
        title,
        duration,
        eventId
      });

      res.json(focusBlock);
    } catch (error) {
      console.error('Failed to create focus block:', error);
      res.status(500).json({ message: 'Failed to create focus block' });
    }
  });

  // Task management routes
  app.get('/api/tasks', requireAuth, async (req, res) => {
    try {
      const tasks = await storage.getTasks(req.session.userId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch tasks' });
    }
  });

  app.post('/api/tasks', requireAuth, async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      
      const task = await storage.createTask(taskData);
      res.json(task);
    } catch (error) {
      res.status(400).json({ message: 'Invalid task data' });
    }
  });

  app.patch('/api/tasks/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const task = await storage.updateTask(id, updates);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update task' });
    }
  });

  app.delete('/api/tasks/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteTask(id);
      
      if (!deleted) {
        return res.status(404).json({ message: 'Task not found' });
      }
      
      res.json({ message: 'Task deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete task' });
    }
  });

  // Get user session info
  app.get('/api/me', (req, res) => {
    if (req.session.userId) {
      res.json({ userId: req.session.userId, authenticated: true });
    } else {
      res.json({ authenticated: false });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
