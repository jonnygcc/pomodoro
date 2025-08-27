import { getCalendarClient } from './google.js';
import type { CalendarEvent } from '@shared/schema';

interface CachedEvents {
  events: CalendarEvent[];
  lastFetch: number;
}

// In-memory cache for calendar events
let eventsCache: CachedEvents | null = null;
const CACHE_DURATION = 60 * 1000; // 60 seconds

export async function listUpcomingEvents(options: { windowMins?: number } = {}): Promise<CalendarEvent[]> {
  const { windowMins = 180 } = options;

  // Check cache first
  if (eventsCache && Date.now() - eventsCache.lastFetch < CACHE_DURATION) {
    return eventsCache.events;
  }

  try {
    const calendar = await getCalendarClient();
    
    const timeMin = new Date();
    const timeMax = new Date(Date.now() + windowMins * 60 * 1000);

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events: CalendarEvent[] = (response.data.items || [])
      .filter((event: any) => event.start?.dateTime || event.start?.date)
      .map((event: any) => ({
        id: event.id!,
        summary: event.summary || 'Untitled Event',
        start: {
          dateTime: event.start?.dateTime,
          date: event.start?.date,
        },
        end: {
          dateTime: event.end?.dateTime,
          date: event.end?.date,
        },
      }));

    // Update cache
    eventsCache = {
      events,
      lastFetch: Date.now(),
    };

    return events;
  } catch (error) {
    console.error('Failed to fetch calendar events:', error);
    // Return cached events if available, otherwise empty array
    return eventsCache?.events || [];
  }
}

export async function createFocusEvent(options: {
  title: string;
  minutes: number;
  startTime?: Date;
}): Promise<string | null> {
  const { title, minutes, startTime = new Date() } = options;

  try {
    const calendar = await getCalendarClient();
    
    const endTime = new Date(startTime.getTime() + minutes * 60 * 1000);

    const event = {
      summary: `Focus — ${title}`,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      description: `Focus session created by Alegra Time`,
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    // Invalidate cache
    eventsCache = null;

    return response.data.id || null;
  } catch (error) {
    console.error('Failed to create focus event:', error);
    throw new Error('Failed to create calendar event');
  }
}

export function getNextMeeting(events: CalendarEvent[]): CalendarEvent | null {
  const now = new Date();
  
  for (const event of events) {
    const startTime = new Date(event.start.dateTime || event.start.date!);
    if (startTime > now) {
      return event;
    }
  }
  
  return null;
}

export function calculateSmartAdjustTime(nextMeetingTime: Date, currentTime: Date = new Date()): number | null {
  const timeDiff = nextMeetingTime.getTime() - currentTime.getTime();
  const minutesUntilMeeting = Math.floor(timeDiff / (1000 * 60));
  
  // If meeting is more than 30 minutes away, no adjustment needed
  if (minutesUntilMeeting > 30) {
    return null;
  }
  
  // If meeting is less than 5 minutes away, suggest skip
  if (minutesUntilMeeting < 5) {
    return 0;
  }
  
  // Suggest adjustment to finish 3 minutes before meeting
  return Math.max(5, minutesUntilMeeting - 3);
}

// Refresh cache periodically
setInterval(() => {
  if (eventsCache) {
    listUpcomingEvents().catch(console.error);
  }
}, CACHE_DURATION);
