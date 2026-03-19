export type CalendarView = 'month' | 'week' | 'year';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string;
  end?: string;
  reminder: boolean;
  color: string;
  reminderSentAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventDraft {
  id?: string;
  title: string;
  description?: string;
  start: string;
  end?: string;
  reminder: boolean;
  color: string;
}
