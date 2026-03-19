import { Injectable } from '@angular/core';
import { CalendarEvent } from '../models/calendar-event.model';

const EVENTS_KEY = 'supernova.events.v1';
const THEME_KEY = 'supernova.theme';

@Injectable({ providedIn: 'root' })
export class StorageService {
  loadEvents(): CalendarEvent[] {
    const raw = localStorage.getItem(EVENTS_KEY);
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw) as CalendarEvent[];
      return parsed.map((event) => ({ ...event }));
    } catch {
      return [];
    }
  }

  saveEvents(events: CalendarEvent[]): void {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  }

  loadTheme(): 'dark' | 'light' {
    const stored = localStorage.getItem(THEME_KEY);
    return stored === 'light' ? 'light' : 'dark';
  }

  saveTheme(theme: 'dark' | 'light'): void {
    localStorage.setItem(THEME_KEY, theme);
  }
}
