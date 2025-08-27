import { apiRequest } from './queryClient';
import type { Task, FocusBlock, CalendarEvent } from '@shared/schema';

export interface CalendarResponse {
  events: CalendarEvent[];
  nextMeeting?: CalendarEvent;
  smartAdjustSuggestion?: {
    originalMeeting: CalendarEvent;
    suggestedDuration: number;
    reason: string;
  };
}

export const api = {
  // Authentication
  login: () => apiRequest('POST', '/api/login', {}),
  logout: () => apiRequest('POST', '/api/logout', {}),
  getMe: () => apiRequest('GET', '/api/me', undefined),

  // Tasks
  getTasks: () => apiRequest('GET', '/api/tasks', undefined),
  createTask: (task: Partial<Task>) => apiRequest('POST', '/api/tasks', task),
  updateTask: (id: string, updates: Partial<Task>) => 
    apiRequest('PATCH', `/api/tasks/${id}`, updates),
  deleteTask: (id: string) => apiRequest('DELETE', `/api/tasks/${id}`, undefined),

  // Calendar
  getNextEvents: (windowMins?: number) => {
    const params = windowMins ? `?window=${windowMins}` : '';
    return apiRequest('GET', `/api/next-events${params}`, undefined);
  },
  
  // Focus blocks
  createFocusBlock: (focusBlock: { title: string; minutes: number; taskId?: string }) =>
    apiRequest('POST', '/api/focus-block', focusBlock),

  // OAuth
  initiateAuth: () => {
    window.location.href = '/api/auth';
  }
};
