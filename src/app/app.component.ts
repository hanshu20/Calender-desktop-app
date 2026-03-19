import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarComponent } from './components/calendar/calendar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { EventModalComponent } from './components/event-modal/event-modal.component';
import { EventService } from './services/event.service';
import { ReminderService } from './services/reminder.service';
import { StorageService } from './services/storage.service';
import { MONTHS } from './utils/date-utils';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, CalendarComponent, SidebarComponent, EventModalComponent],
  template: `
    <div class="app-shell">
      <app-sidebar class="panel" />

      <div class="panel" style="display: flex; flex-direction: column; gap: 1rem; padding: 1.5rem;">
        <header style="display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
          <div>
            <div style="font-size: 0.85rem; color: var(--muted);">Supernova Calendar</div>
            <h1 style="margin: 0; font-size: 1.5rem;">{{ title() }}</h1>
          </div>
          <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
            <button class="btn btn-ghost" (click)="today()">Today</button>
            <button class="btn btn-ghost" (click)="toggleTheme()">
              {{ theme() === 'dark' ? 'Light Mode' : 'Dark Mode' }}
            </button>
          </div>
        </header>

        <app-calendar class="fade-in" />
      </div>
    </div>

    <app-event-modal />
  `
})
export class AppComponent {
  private readonly events = inject(EventService);
  private readonly reminders = inject(ReminderService);
  private readonly storage = inject(StorageService);

  readonly theme = signal<'dark' | 'light'>(this.storage.loadTheme());

  readonly title = computed(() => {
    const date = this.events.activeDate();
    return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
  });

  constructor() {
    this.applyTheme(this.theme());
    this.reminders.start();
  }

  today(): void {
    this.events.jumpToDate(new Date());
  }

  toggleTheme(): void {
    const next = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
    this.storage.saveTheme(next);
    this.applyTheme(next);
  }

  private applyTheme(theme: 'dark' | 'light'): void {
    document.documentElement.dataset.theme = theme;
  }
}
