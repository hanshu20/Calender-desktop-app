import { Injectable, effect } from '@angular/core';
import { EventService } from './event.service';
import { formatShortDate, formatTime } from '../utils/date-utils';

interface NotificationPayload {
  title: string;
  body: string;
}

declare global {
  interface Window {
    electronAPI?: {
      notify: (payload: NotificationPayload) => Promise<void> | void;
    };
  }
}

@Injectable({ providedIn: 'root' })
export class ReminderService {
  private timer: number | undefined;
  private warnedMissingApi = false;

  constructor(private events: EventService) {}

  start(): void {
    if (this.timer) {
      return;
    }
    this.timer = window.setInterval(() => this.checkReminders(), 15000);
    effect(() => {
      const list = this.events.events();
      list.forEach((event) => {
        if (event.reminder && event.reminderSentAt) {
          const eventTime = new Date(event.start).getTime();
          const sent = new Date(event.reminderSentAt).getTime();
          if (sent < eventTime) {
            this.events.resetReminderSent(event.id);
          }
        }
      });
    });
  }

  private checkReminders(): void {
    const now = Date.now();
    const windowMs = 5 * 60 * 1000;
    this.events.events().forEach((event) => {
      if (!event.reminder || event.reminderSentAt) {
        return;
      }
      const eventTime = new Date(event.start).getTime();
      if (Math.abs(eventTime - now) <= windowMs) {
        const body = `${formatShortDate(new Date(event.start))} at ${formatTime(new Date(event.start))}`;
        this.notify({ title: event.title, body });
        this.events.markReminderSent(event.id);
      }
    });
  }

  testNotification(): void {
    const now = new Date();
    this.notify({
      title: 'Supernova Test',
      body: `${formatShortDate(now)} at ${formatTime(now)}`
    });
  }

  private notify(payload: NotificationPayload): void {
    if (window.electronAPI?.notify) {
      window.electronAPI.notify(payload);
      return;
    }
    if ('Notification' in window) {
      if (Notification.permission === 'denied') {
        if (!this.warnedMissingApi) {
          console.warn('Notifications are blocked. Enable notifications in your OS settings.');
          this.warnedMissingApi = true;
        }
        return;
      }
      if (Notification.permission === 'default') {
        Notification.requestPermission().catch(() => undefined);
      }
      new Notification(payload.title, { body: payload.body });
    }
  }
}
