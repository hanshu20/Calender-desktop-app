import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../services/event.service';
import { CalendarEvent } from '../../models/calendar-event.model';
import { formatShortDate, formatTime } from '../../utils/date-utils';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <aside
      [class.collapsed]="collapsed()"
      style="height: 100%; display: flex; flex-direction: column; gap: 1rem; padding: 1.5rem; min-width: 260px;"
    >
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div>
          <div style="font-weight: 700; font-size: 1.1rem;">Events</div>
          <div style="color: var(--muted); font-size: 0.8rem;">All dates, one list</div>
        </div>
        <button class="btn btn-ghost" (click)="toggle()">{{ collapsed() ? 'Open' : 'Close' }}</button>
      </div>

      <div *ngIf="!collapsed()" style="display: flex; flex-direction: column; gap: 0.75rem;">
        <input
          class="input"
          type="search"
          placeholder="Search events"
          [ngModel]="search()"
          (ngModelChange)="search.set($event)"
        />
        <input
          class="input"
          type="date"
          [ngModel]="filterDate()"
          (ngModelChange)="filterDate.set($event)"
        />
        <button class="btn btn-ghost" (click)="clearFilters()">Clear filters</button>
      </div>

      <div
        *ngIf="!collapsed()"
        class="scrollbar-hidden"
        style="overflow: auto; display: flex; flex-direction: column; gap: 0.5rem; padding-right: 0.25rem;"
      >
        <div
          *ngFor="let event of filteredEvents()"
          (click)="navigateToEvent(event)"
          class="panel"
          style="padding: 0.75rem; cursor: pointer; display: flex; flex-direction: column; gap: 0.35rem; border-radius: 1rem;"
        >
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span
              style="width: 10px; height: 10px; border-radius: 999px; display: inline-block;"
              [style.background]="event.color"
            ></span>
            <div style="font-weight: 600;">{{ event.title }}</div>
          </div>
          <div style="font-size: 0.8rem; color: var(--muted);">
            {{ formatShort(event) }}
          </div>
          <div *ngIf="event.description" style="font-size: 0.78rem; color: var(--muted);">
            {{ event.description }}
          </div>
        </div>

        <div *ngIf="filteredEvents().length === 0" style="color: var(--muted); font-size: 0.85rem;">
          No events match your filters.
        </div>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  readonly collapsed = signal(false);
  readonly search = signal('');
  readonly filterDate = signal('');

  constructor(private events: EventService) {}

  readonly filteredEvents = computed(() => {
    const searchLower = this.search().toLowerCase();
    const dateFilter = this.filterDate();
    return this.events.events().filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchLower) ||
        (event.description ?? '').toLowerCase().includes(searchLower);
      const matchesDate = dateFilter
        ? event.start.startsWith(dateFilter)
        : true;
      return matchesSearch && matchesDate;
    });
  });

  toggle(): void {
    this.collapsed.set(!this.collapsed());
  }

  clearFilters(): void {
    this.search.set('');
    this.filterDate.set('');
  }

  navigateToEvent(event: CalendarEvent): void {
    this.events.jumpToDate(new Date(event.start));
    this.events.setView('month');
  }

  formatShort(event: CalendarEvent): string {
    const start = new Date(event.start);
    return `${formatShortDate(start)} · ${formatTime(start)}`;
  }
}
