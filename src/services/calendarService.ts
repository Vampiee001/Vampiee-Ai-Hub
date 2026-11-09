import { getAccessToken } from './firebaseAuth';

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string; // ISO 8601 string
    date?: string; // YYYY-MM-DD for all-day events
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  htmlLink?: string;
  hangoutLink?: string; // Google Meet video call link
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
    self?: boolean;
  }>;
  status?: string;
  colorId?: string;
  category?: 'meeting' | 'deep_work' | 'deadline' | 'review' | 'general';
}

// Sample events based on current active schedule
export const SAMPLE_CALENDAR_EVENTS: GoogleCalendarEvent[] = [
  {
    id: 'sample-cal-1',
    summary: 'AI Client Strategic Retainer Sync (CloudScale)',
    description: 'Weekly review of autonomous prompt routing and enterprise AI integration deliverables.',
    location: 'Google Meet',
    start: {
      dateTime: '2026-11-02T10:00:00-08:00',
    },
    end: {
      dateTime: '2026-11-02T11:00:00-08:00',
    },
    hangoutLink: 'https://meet.google.com/abc-defg-hij',
    attendees: [
      { email: 'sarah.lin@cloudscale.tech', displayName: 'Dr. Sarah Lin', responseStatus: 'accepted' },
      { email: 'markstephenyucada@gmail.com', displayName: 'Mark Stephen', self: true, responseStatus: 'accepted' }
    ],
    category: 'meeting',
  },
  {
    id: 'sample-cal-2',
    summary: 'Vampiee Deep Work Flow: Autonomous Prompt Routing',
    description: 'Focused coding sprint for multi-model orchestrator subtasks.',
    start: {
      dateTime: '2026-11-02T13:00:00-08:00',
    },
    end: {
      dateTime: '2026-11-02T15:00:00-08:00',
    },
    category: 'deep_work',
  },
  {
    id: 'sample-cal-3',
    summary: 'Apex Ventures Seed Pipeline Q&A',
    description: 'Discussion on AI monetization engines, ARR metrics, and 1,000 AED bill-pay sprints.',
    location: 'Google Meet',
    start: {
      dateTime: '2026-11-02T15:30:00-08:00',
    },
    end: {
      dateTime: '2026-11-02T16:15:00-08:00',
    },
    hangoutLink: 'https://meet.google.com/xyz-uvwx-rst',
    attendees: [
      { email: 'marcus@apexventures.capital', displayName: 'Marcus Vance', responseStatus: 'accepted' },
      { email: 'markstephenyucada@gmail.com', displayName: 'Mark Stephen', self: true, responseStatus: 'accepted' }
    ],
    category: 'meeting',
  },
  {
    id: 'sample-cal-4',
    summary: 'Daily Music Studio: Mastering & Spotify Release Package',
    description: 'Finalize 14-genre stems, TikTok 9:16 export, and ISRC metadata dispatch.',
    start: {
      dateTime: '2026-11-02T17:00:00-08:00',
    },
    end: {
      dateTime: '2026-11-02T18:00:00-08:00',
    },
    category: 'deadline',
  },
  {
    id: 'sample-cal-5',
    summary: 'Dubai Tech Founder Evening Roundtable',
    description: 'Networking and discussion on UAE digital economy and tech initiatives.',
    location: 'DIFC Fintech Hive / Hybrid',
    start: {
      dateTime: '2026-11-03T18:30:00-08:00',
    },
    end: {
      dateTime: '2026-11-03T20:30:00-08:00',
    },
    category: 'general',
  },
];

export interface FetchCalendarOptions {
  timeMin?: string;
  timeMax?: string;
  maxResults?: number;
}

// Fetch calendar events from Google Calendar API v3
export const fetchGoogleCalendarEvents = async (
  options: FetchCalendarOptions = {}
): Promise<GoogleCalendarEvent[]> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('No Google access token found. Please sign in with Google to sync calendar.');
  }

  // Default to today start until 14 days ahead if not specified
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const defaultTimeMin = options.timeMin || startOfDay.toISOString();
  
  const endPeriod = new Date(startOfDay.getTime() + 14 * 24 * 60 * 60 * 1000);
  const defaultTimeMax = options.timeMax || endPeriod.toISOString();
  const maxResults = options.maxResults || 50;

  const params = new URLSearchParams({
    calendarId: 'primary',
    singleEvents: 'true',
    orderBy: 'startTime',
    timeMin: defaultTimeMin,
    timeMax: defaultTimeMax,
    maxResults: maxResults.toString(),
  });

  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message ||
        `Failed to fetch Google Calendar events: HTTP ${response.status}`
    );
  }

  const data = await response.json();
  const items = data.items || [];

  return items.map((item: any) => {
    // Categorize based on keywords in title/description
    const text = `${item.summary || ''} ${item.description || ''}`.toLowerCase();
    let category: GoogleCalendarEvent['category'] = 'general';
    if (text.includes('deep work') || text.includes('focus') || text.includes('code') || text.includes('sprint')) {
      category = 'deep_work';
    } else if (text.includes('sync') || text.includes('meeting') || text.includes('call') || text.includes('review') || item.hangoutLink) {
      category = 'meeting';
    } else if (text.includes('deadline') || text.includes('due') || text.includes('launch') || text.includes('release')) {
      category = 'deadline';
    }

    return {
      id: item.id,
      summary: item.summary || 'Untitled Event',
      description: item.description,
      location: item.location,
      start: item.start,
      end: item.end,
      htmlLink: item.htmlLink,
      hangoutLink: item.hangoutLink,
      attendees: item.attendees,
      status: item.status,
      colorId: item.colorId,
      category,
    };
  });
};

// Format event time nicely (e.g., "10:00 AM - 11:00 AM" or "All Day")
export const formatEventTimespan = (event: GoogleCalendarEvent): { timeStr: string; dateStr: string; isAllDay: boolean; isNow: boolean; isPast: boolean } => {
  if (event.start.date) {
    // All day event
    return {
      timeStr: 'All Day',
      dateStr: event.start.date,
      isAllDay: true,
      isNow: false,
      isPast: false,
    };
  }

  if (!event.start.dateTime) {
    return {
      timeStr: 'Time TBD',
      dateStr: 'Today',
      isAllDay: false,
      isNow: false,
      isPast: false,
    };
  }

  const start = new Date(event.start.dateTime);
  const end = event.end?.dateTime ? new Date(event.end.dateTime) : null;
  const now = new Date();

  const isNow = start <= now && end !== null && now <= end;
  const isPast = end !== null ? end < now : start < now;

  const formatOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };

  const startTimeStr = start.toLocaleTimeString([], formatOptions);
  const endTimeStr = end ? end.toLocaleTimeString([], formatOptions) : '';

  const dateStr = start.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return {
    timeStr: endTimeStr ? `${startTimeStr} – ${endTimeStr}` : startTimeStr,
    dateStr,
    isAllDay: false,
    isNow,
    isPast,
  };
};
