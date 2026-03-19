import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../../services/event.service';
import { CalendarEvent } from '../../models/calendar-event.model';
import {
  MONTHS,
  WEEK_DAYS,
  addDays,
  endOfMonth,
  endOfWeek,
  formatTime as formatTimeString,
  isToday,
  startOfMonth,
  startOfWeek
} from '../../utils/date-utils';

interface DayCell {
  date: Date;
  inMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section style="display: flex; flex-direction: column; gap: 1rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <button class="btn btn-ghost" (click)="prev()">Prev</button>
          <button class="btn btn-ghost" (click)="next()">Next</button>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn" [class.btn-primary]="view() === 'month'" (click)="setView('month')">Month</button>
          <button class="btn" [class.btn-primary]="view() === 'week'" (click)="setView('week')">Week</button>
          <button class="btn" [class.btn-primary]="view() === 'year'" (click)="setView('year')">Year</button>
        </div>
      </div>

      <div *ngIf="view() === 'month'" class="slide-up">
        <div class="calendar-grid" style="margin-bottom: 0.5rem; font-size: 0.8rem; color: var(--muted);">
          <div *ngFor="let day of weekDays" style="text-align: center;">{{ day }}</div>
        </div>
        <div class="calendar-grid">
          <div
            *ngFor="let cell of monthGrid()"
            class="calendar-cell"
            [class.today]="cell.isToday"
            (click)="openCreate(cell.date)"
            (dragover)="allowDrop($event)"
            (drop)="onDrop($event, cell.date)"
          >
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
              <span [style.opacity]="cell.inMonth ? 1 : 0.4">{{ cell.date.getDate() }}</span>
              <button class="btn btn-ghost" style="padding: 0.2rem 0.5rem; font-size: 0.7rem;" (click)="openCreate(cell.date); $event.stopPropagation();">+</button>
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.35rem;">
              <div
                *ngFor="let event of cell.events"
                class="event-pill"
                [style.borderColor]="event.color"
                [style.background]="event.color + '33'"
                draggable="true"
                (dragstart)="onDragStart($event, event.id)"
                (click)="openEdit(event, $event)"
              >
                <span style="width: 6px; height: 6px; border-radius: 999px; background: currentColor;"></span>
                {{ event.title }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="view() === 'week'" class="slide-up" style="display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 0.75rem;">
        <div *ngFor="let cell of weekGrid()" class="calendar-cell" (click)="openCreate(cell.date)">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <div>
              <div style="font-size: 0.75rem; color: var(--muted);">{{ weekDays[cell.date.getDay()] }}</div>
              <div style="font-weight: 600;">{{ cell.date.getDate() }}</div>
            </div>
            <span *ngIf="cell.isToday" class="event-pill" style="font-size: 0.65rem;">Today</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.35rem;">
            <div
              *ngFor="let event of cell.events"
              class="event-pill"
              [style.borderColor]="event.color"
              [style.background]="event.color + '33'"
              (click)="openEdit(event, $event)"
            >
              {{ event.title }} · {{ formatEventTime(event) }}
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="view() === 'year'" class="slide-up" style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1rem;">
        <div
          *ngFor="let month of yearGrid()"
          class="calendar-cell"
          style="min-height: 140px; cursor: pointer;"
          (click)="jumpToMonth(month.index)"
        >
          <div style="font-weight: 600;">{{ month.name }}</div>
          <div style="font-size: 0.8rem; color: var(--muted); margin-top: 0.25rem;">
            {{ month.count }} events
          </div>
          <div style="margin-top: 0.65rem; display: flex; flex-wrap: wrap; gap: 0.35rem;">
            <span
              *ngFor="let color of month.colors"
              style="width: 12px; height: 12px; border-radius: 999px; display: inline-block;"
              [style.background]="color"
            ></span>
          </div>
        </div>
      </div>
    </section>
  `
})
export class CalendarComponent {
  readonly weekDays = WEEK_DAYS;
  readonly view = this.events.view;

  constructor(private events: EventService) {}

  readonly monthGrid = computed<DayCell[]>(() => {
    const active = this.events.activeDate();
    const start = startOfWeek(startOfMonth(active));
    const end = endOfWeek(endOfMonth(active));
    const days: DayCell[] = [];
    let cursor = start;
    while (cursor <= end) {
      const current = new Date(cursor);
      const inMonth = current.getMonth() === active.getMonth();
      days.push({
        date: current,
        inMonth,
        isToday: isToday(current),
        events: this.events.eventsOnDate(current)
      });
      cursor = addDays(cursor, 1);
    }
    return days;
  });

  readonly weekGrid = computed<DayCell[]>(() => {
    const active = this.events.activeDate();
    const start = startOfWeek(active);
    const days: DayCell[] = [];
    for (let i = 0; i < 7; i += 1) {
      const current = addDays(start, i);
      days.push({
        date: current,
        inMonth: true,
        isToday: isToday(current),
        events: this.events.eventsOnDate(current)
      });
    }
    return days;
  });

  readonly yearGrid = computed(() => {
    const active = this.events.activeDate();
    return MONTHS.map((name, index) => {
      const monthEvents = this.events
        .events()
        .filter((event) => new Date(event.start).getMonth() === index && new Date(event.start).getFullYear() === active.getFullYear());
      return {
        name,
        index,
        count: monthEvents.length,
        colors: Array.from(new Set(monthEvents.map((event) => event.color))).slice(0, 6)
      };
    });
  });

  setView(view: 'month' | 'week' | 'year'): void {
    this.events.setView(view);
  }

  prev(): void {
    const current = this.events.activeDate();
    const view = this.view();
    if (view === 'month') {
      this.events.jumpToDate(new Date(current.getFullYear(), current.getMonth() - 1, 1));
    } else if (view === 'week') {
      this.events.jumpToDate(addDays(current, -7));
    } else {
      this.events.jumpToDate(new Date(current.getFullYear() - 1, current.getMonth(), 1));
    }
  }

  next(): void {
    const current = this.events.activeDate();
    const view = this.view();
    if (view === 'month') {
      this.events.jumpToDate(new Date(current.getFullYear(), current.getMonth() + 1, 1));
    } else if (view === 'week') {
      this.events.jumpToDate(addDays(current, 7));
    } else {
      this.events.jumpToDate(new Date(current.getFullYear() + 1, current.getMonth(), 1));
    }
  }

  openCreate(date: Date): void {
    this.events.openCreate(date);
  }

  openEdit(event: CalendarEvent, domEvent: Event): void {
    domEvent.stopPropagation();
    this.events.openEdit(event);
  }

  allowDrop(event: DragEvent): void {
    event.preventDefault();
  }

  onDragStart(event: DragEvent, id: string): void {
    event.dataTransfer?.setData('text/plain', id);
  }

  onDrop(event: DragEvent, date: Date): void {
    event.preventDefault();
    const id = event.dataTransfer?.getData('text/plain');
    if (id) {
      this.events.moveEvent(id, date);
    }
  }

  jumpToMonth(monthIndex: number): void {
    const current = this.events.activeDate();
    this.events.jumpToDate(new Date(current.getFullYear(), monthIndex, 1));
    this.events.setView('month');
  }

  formatTime(date: Date): string {
    return formatTimeString(date);
  }

  formatEventTime(event: CalendarEvent): string {
    return this.formatTime(new Date(event.start));
  }
}
