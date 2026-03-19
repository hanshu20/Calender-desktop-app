import { Injectable, computed, effect, signal } from '@angular/core';
import { CalendarEvent, CalendarView, EventDraft } from '../models/calendar-event.model';
import { StorageService } from './storage.service';
import { isSameDay, mergeDateAndTime } from '../utils/date-utils';

export interface ModalState {
  open: boolean;
  draft?: EventDraft;
}

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly eventsSignal = signal<CalendarEvent[]>([]);
  readonly events = computed(() =>
    this.eventsSignal()
      .slice()
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
  );

  readonly view = signal<CalendarView>('month');
  readonly activeDate = signal<Date>(new Date());
  readonly modal = signal<ModalState>({ open: false });

  constructor(private storage: StorageService) {
    this.eventsSignal.set(storage.loadEvents());
    effect(() => {
      this.storage.saveEvents(this.eventsSignal());
    });
  }

  setView(view: CalendarView): void {
    this.view.set(view);
  }

  jumpToDate(date: Date): void {
    this.activeDate.set(new Date(date));
  }

  openCreate(date: Date): void {
    const start = new Date(date);
    start.setHours(9, 0, 0, 0);
    this.modal.set({
      open: true,
      draft: {
        title: '',
        description: '',
        start: start.toISOString(),
        reminder: false,
        color: '#8b5cf6'
      }
    });
  }

  openEdit(event: CalendarEvent): void {
    this.modal.set({
      open: true,
      draft: {
        id: event.id,
        title: event.title,
        description: event.description,
        start: event.start,
        end: event.end,
        reminder: event.reminder,
        color: event.color
      }
    });
  }

  closeModal(): void {
    this.modal.set({ open: false });
  }

  upsertEvent(draft: EventDraft): void {
    if (!draft.title.trim()) {
      return;
    }
    const now = new Date().toISOString();
    const existing = this.eventsSignal();
    const index = existing.findIndex((event) => event.id === draft.id);
    if (index >= 0) {
      const current = existing[index];
      const timeChanged = current.start !== draft.start;
      const updated: CalendarEvent = {
        ...current,
        title: draft.title.trim(),
        description: draft.description?.trim(),
        start: draft.start,
        end: draft.end,
        reminder: draft.reminder,
        color: draft.color,
        reminderSentAt: draft.reminder ? (timeChanged ? undefined : current.reminderSentAt) : undefined,
        updatedAt: now
      };
      const copy = existing.slice();
      copy[index] = updated;
      this.eventsSignal.set(copy);
    } else {
      const id = globalThis.crypto?.randomUUID?.() ?? `evt-${Date.now()}`;
      const created: CalendarEvent = {
        id,
        title: draft.title.trim(),
        description: draft.description?.trim(),
        start: draft.start,
        end: draft.end,
        reminder: draft.reminder,
        color: draft.color,
        reminderSentAt: undefined,
        createdAt: now,
        updatedAt: now
      };
      this.eventsSignal.set([...existing, created]);
    }
    this.closeModal();
  }

  deleteEvent(id: string): void {
    this.eventsSignal.set(this.eventsSignal().filter((event) => event.id !== id));
  }

  moveEvent(id: string, newDate: Date): void {
    const events = this.eventsSignal();
    const index = events.findIndex((event) => event.id === id);
    if (index < 0) {
      return;
    }
    const event = events[index];
    const eventDate = mergeDateAndTime(newDate, new Date(event.start));
    const updated: CalendarEvent = {
      ...event,
      start: eventDate.toISOString(),
      updatedAt: new Date().toISOString()
    };
    const copy = events.slice();
    copy[index] = updated;
    this.eventsSignal.set(copy);
  }

  eventsOnDate(date: Date): CalendarEvent[] {
    return this.events().filter((event) => isSameDay(new Date(event.start), date));
  }

  resetReminderSent(id: string): void {
    const events = this.eventsSignal();
    const index = events.findIndex((event) => event.id === id);
    if (index < 0) {
      return;
    }
    const copy = events.slice();
    copy[index] = { ...events[index], reminderSentAt: undefined };
    this.eventsSignal.set(copy);
  }

  markReminderSent(id: string): void {
    const events = this.eventsSignal();
    const index = events.findIndex((event) => event.id === id);
    if (index < 0) {
      return;
    }
    const copy = events.slice();
    copy[index] = { ...events[index], reminderSentAt: new Date().toISOString() };
    this.eventsSignal.set(copy);
  }
}
