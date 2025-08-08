// birthday.component.ts

import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonExternalComponent } from '../common-external/common-external.component';

@Component({
  selector: 'app-birthday',
  template: `
    <!-- 
      Features:
      - Add, edit, and delete birthdays with name and date.
      - Data is saved in browser local storage.
      - Download/Upload all data as .txt file for backup or transfer.
      - Responsive Bootstrap 5 design.
      - PrimeIcons v7 used for icons.
    -->
    <div class="card shadow-sm">
      <div class="card-header d-flex justify-content-between align-items-center bg-primary text-white">
        <span>
          <i class="pi pi-gift me-2"></i>
          Birthday Tracker
        </span>
        <div>
          <button class="btn btn-light btn-sm me-2" (click)="downloadData()" title="Download Data">
            <i class="pi pi-download"></i>
          </button>
          <label class="btn btn-light btn-sm mb-0" title="Upload Data">
            <i class="pi pi-upload"></i>
            <input type="file" accept=".txt" hidden (change)="uploadData($event)">
          </label>
        </div>
      </div>
      <div class="card-body">
        <form class="row g-2 mb-3" (ngSubmit)="addBirthday()">
          <div class="col-md-5">
            <input type="text" class="form-control" placeholder="Name" [(ngModel)]="newName" name="name" required>
          </div>
          <div class="col-md-5">
            <input type="date" class="form-control" [(ngModel)]="newDate" name="date" required>
          </div>
          <div class="col-md-2 d-grid">
            <button type="submit" class="btn btn-success">
              <i class="pi pi-plus"></i> Add
            </button>
          </div>
        </form>
        <div *ngIf="birthdays.length === 0" class="alert alert-info text-center">
          <i class="pi pi-info-circle"></i> No birthdays added yet.
        </div>
        <ul class="list-group">
          <li *ngFor="let b of birthdays; let i = index" class="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <i class="pi pi-user me-2 text-primary"></i>
              <strong>{{b.name}}</strong> — <span class="text-muted">{{b.date | date:'longDate'}}</span>
            </div>
            <div>
              <button class="btn btn-outline-secondary btn-sm me-2" (click)="editBirthday(i)" title="Edit">
                <i class="pi pi-pencil"></i>
              </button>
              <button class="btn btn-outline-danger btn-sm" (click)="deleteBirthday(i)" title="Delete">
                <i class="pi pi-trash"></i>
              </button>
            </div>
          </li>
        </ul>
        <!-- Edit Modal -->
        <div class="modal fade" tabindex="-1" [ngClass]="{'show d-block': editingIndex!==null}" *ngIf="editingIndex!==null">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title"><i class="pi pi-pencil me-2"></i>Edit Birthday</h5>
                <button type="button" class="btn-close" aria-label="Close" (click)="cancelEdit()"></button>
              </div>
              <div class="modal-body">
                <div class="mb-3">
                  <label>Name</label>
                  <input type="text" class="form-control" [(ngModel)]="editName" required>
                </div>
                <div class="mb-3">
                  <label>Date</label>
                  <input type="date" class="form-control" [(ngModel)]="editDate" required>
                </div>
              </div>
              <div class="modal-footer">
                <button class="btn btn-secondary" (click)="cancelEdit()">Cancel</button>
                <button class="btn btn-primary" (click)="saveEdit()">Save</button>
              </div>
            </div>
          </div>
        </div>
        <!-- End Edit Modal -->
      </div>
    </div>
  `,
  styles: [`
    .modal.show.d-block {
      display: block;
      background: rgba(0,0,0,0.4);
    }
    .modal-dialog {
      margin-top: 10vh;
    }
  `]
})
export class BirthdayComponent extends CommonExternalComponent {
  birthdays!: { name: string; date: string }[];
  newName!: string;
  newDate!: string;
  editingIndex!: number | null;
  editName!: string;
  editDate!: string;

  constructor(private cdr: ChangeDetectorRef) {
    super();
    this.birthdays = [];
    this.newName = '';
    this.newDate = '';
    this.editingIndex = null;
    this.editName = '';
    this.editDate = '';
    this.loadBirthdays();
  }

  loadBirthdays(): void {
    const data = localStorage.getItem('birthday-data');
    this.birthdays = data ? JSON.parse(data) : [];
  }

  saveBirthdays(): void {
    localStorage.setItem('birthday-data', JSON.stringify(this.birthdays));
  }

  addBirthday(): void {
    if (!this.newName || !this.newDate) return;
    this.birthdays!.push({ name: this.newName, date: this.newDate });
    this.saveBirthdays();
    this.newName = '';
    this.newDate = '';
  }

  deleteBirthday(index: number): void {
    this.birthdays!.splice(index, 1);
    this.saveBirthdays();
  }

  editBirthday(index: number): void {
    this.editingIndex = index;
    this.editName = this.birthdays![index].name;
    this.editDate = this.birthdays![index].date;
  }

  cancelEdit(): void {
    this.editingIndex = null;
    this.editName = '';
    this.editDate = '';
  }

  saveEdit(): void {
    if (this.editingIndex !== null && this.editName && this.editDate) {
      this.birthdays![this.editingIndex] = { name: this.editName, date: this.editDate };
      this.saveBirthdays();
      this.cancelEdit();
    }
  }

  downloadData(): void {
    this.componentDataDownloader({ birthdays: this.birthdays! });
  }

  async uploadData(event: Event): Promise<void> {
    const data = await this.componentDataUploader(event);
    if (data && data.birthdays) {
      this.birthdays = data.birthdays;
      this.saveBirthdays();
      this.cdr.detectChanges();
    }
  }
}