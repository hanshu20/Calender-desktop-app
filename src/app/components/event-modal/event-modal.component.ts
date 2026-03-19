import { Component, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../services/event.service';
import { EventDraft } from '../../models/calendar-event.model';
import { toInputDateTime } from '../../utils/date-utils';

@Component({
  selector: 'app-event-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="modalOpen()" class="modal-backdrop fade-in" (click)="close()">
      <div class="modal-card slide-up" (click)="$event.stopPropagation()">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h2 style="margin: 0;">{{ isEditing() ? 'Edit Event' : 'New Event' }}</h2>
          <button class="btn btn-ghost" (click)="close()">Close</button>
        </div>

        <div style="display: grid; gap: 0.75rem;">
          <div>
            <label style="font-size: 0.8rem; color: var(--muted);">Title</label>
            <input class="input" [(ngModel)]="model.title" placeholder="Event title" />
          </div>
          <div>
            <label style="font-size: 0.8rem; color: var(--muted);">Description</label>
            <textarea class="input" rows="3" [(ngModel)]="model.description" placeholder="Optional notes"></textarea>
          </div>
          <div>
            <label style="font-size: 0.8rem; color: var(--muted);">Date & Time</label>
            <input class="input" type="datetime-local" [(ngModel)]="model.start" />
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <input type="checkbox" [(ngModel)]="model.reminder" />
            <span>Reminder</span>
          </div>
          <div>
            <label style="font-size: 0.8rem; color: var(--muted);">Color</label>
            <input class="input" type="color" [(ngModel)]="model.color" />
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.25rem;">
          <button *ngIf="isEditing()" class="btn btn-danger" (click)="delete()">Delete</button>
          <div style="margin-left: auto; display: flex; gap: 0.5rem;">
            <button class="btn btn-ghost" (click)="close()">Cancel</button>
            <button class="btn btn-primary" (click)="save()">Save</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class EventModalComponent {
  readonly modalOpen = signal(false);
  readonly isEditing = signal(false);

  model: EventDraft = {
    title: '',
    description: '',
    start: toInputDateTime(new Date()),
    reminder: false,
    color: '#8b5cf6'
  };

  constructor(private events: EventService) {
    effect(() => {
      const modal = this.events.modal();
      this.modalOpen.set(modal.open);
      if (modal.open && modal.draft) {
        this.isEditing.set(!!modal.draft.id);
        this.model = {
          ...modal.draft,
          start: toInputDateTime(new Date(modal.draft.start))
        };
      }
    });
  }

  save(): void {
    const draft: EventDraft = {
      ...this.model,
      start: new Date(this.model.start).toISOString()
    };
    this.events.upsertEvent(draft);
  }

  delete(): void {
    if (this.model.id) {
      this.events.deleteEvent(this.model.id);
      this.close();
    }
  }

  close(): void {
    this.events.closeModal();
  }
}
