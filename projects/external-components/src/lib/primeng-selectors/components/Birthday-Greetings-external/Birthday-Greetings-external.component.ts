// birthday-greetings.component.ts

import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonExternalComponent } from '../common-external/common-external.component';

@Component({
  selector: 'app-birthday-greetings',
  template: `
    <!-- 
      Birthday Greetings App

      Features:
      - Add friends/relatives' names and custom messages.
      - Generate a shareable link with name & message in URL params.
      - Preview the greeting as it will appear to your friend (with confetti).
      - When opened via link, shows personalized greeting and confetti animation.
      - Data is saved in local storage (can download/upload .txt backup).
      - Responsive Bootstrap 5 UI, PrimeIcons v7 for icons.
    -->

    <div class="container py-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2>
          <i class="pi pi-gift text-primary"></i> Birthday Greetings
        </h2>
        <div>
          <button class="btn btn-outline-success btn-sm me-2" (click)="downloadData()" title="Download greetings data">
            <i class="pi pi-download"></i> Download
          </button>
          <label class="btn btn-outline-primary btn-sm mb-0" title="Upload greetings data">
            <i class="pi pi-upload"></i> Upload
            <input type="file" accept=".txt" style="display:none" (change)="uploadData($event)">
          </label>
        </div>
      </div>

      <!-- Greeting View if link has params or preview -->
      <div *ngIf="showGreeting" class="text-center position-relative" style="min-height: 350px;">
        <canvas #confettiCanvas class="position-absolute top-0 start-0 w-100 h-100" style="pointer-events:none; z-index:0;"></canvas>
        <div class="card shadow mx-auto p-4" style="max-width: 400px; background: rgba(255,255,255,0.95); position:relative; z-index:1;">
          <h3 class="mb-3">
            <i class="pi pi-smile text-warning"></i>
            Happy Birthday, <span class="text-primary">{{ greetingName }}</span>!
          </h3>
          <p class="lead">{{ greetingMessage }}</p>
          <button *ngIf="previewMode" class="btn btn-outline-secondary mt-3" (click)="closePreview()">
            <i class="pi pi-times"></i> Close Preview
          </button>
        </div>
      </div>

      <!-- Main App to add greetings -->
      <div *ngIf="!showGreeting">
        <form class="row g-3 mb-4" (ngSubmit)="addGreeting()" autocomplete="off">
          <div class="col-md-5">
            <input type="text" class="form-control" placeholder="Friend's Name"
              [(ngModel)]="newName" name="name" required maxlength="32" />
          </div>
          <div class="col-md-5">
            <input type="text" class="form-control" placeholder="Birthday Message"
              [(ngModel)]="newMessage" name="message" required maxlength="120" />
          </div>
          <div class="col-md-2 d-grid">
            <button type="submit" class="btn btn-primary">
              <i class="pi pi-plus"></i> Add
            </button>
          </div>
        </form>

        <div *ngIf="greetings.length === 0" class="alert alert-info">
          <i class="pi pi-info-circle"></i> No greetings added yet. Add your first!
        </div>

        <ul class="list-group mb-4" *ngIf="greetings.length > 0">
          <li *ngFor="let g of greetings; let i = index" class="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>{{ g.name }}</strong>: {{ g.message }}
            </div>
            <div>
              <button class="btn btn-outline-secondary btn-sm me-2"
                (click)="generateLink(g)" title="Generate Link">
                <i class="pi pi-link"></i>
              </button>
              <button class="btn btn-outline-info btn-sm me-2"
                (click)="previewGreeting(g)" title="Preview">
                <i class="pi pi-eye"></i>
              </button>
              <button class="btn btn-outline-danger btn-sm"
                (click)="deleteGreeting(i)" title="Delete">
                <i class="pi pi-trash"></i>
              </button>
            </div>
          </li>
        </ul>

        <div *ngIf="shareableUrl" class="alert alert-success d-flex align-items-center gap-2">
          <i class="pi pi-share-alt"></i>
          <span>
            Share this link: 
            <a [href]="shareableUrl" target="_blank">{{ shareableUrl }}</a>
          </span>
          <button class="btn btn-sm btn-outline-primary ms-3" (click)="copyToClipboard(shareableUrl)">
            <i class="pi pi-copy"></i> Copy
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 700px;
    }
    canvas {
      pointer-events: none;
      display: block;
    }
  `]
})
export class BirthdayGreetingsComponent extends CommonExternalComponent {
  greetings!: Array<{ name: string; message: string }>;
  newName!: string;
  newMessage!: string;
  shareableUrl!: string;
  showGreeting!: boolean;
  greetingName!: string;
  greetingMessage!: string;
  previewMode!: boolean;

  constructor(private cdr: ChangeDetectorRef) {
    super();
    this.greetings = [];
    this.newName = '';
    this.newMessage = '';
    this.shareableUrl = '';
    this.showGreeting = false;
    this.greetingName = '';
    this.greetingMessage = '';
    this.previewMode = false;
    this.loadFromLocalStorage();
    this.checkForGreetingParams();
  }

  // Check URL for ?name=...&message=...
  private checkForGreetingParams(): void {
    const params: URLSearchParams = new URLSearchParams(window.location.search);
    const name: string | null = params.get('name');
    const message: string | null = params.get('message');
    if (name !== null && message !== null) {
      this.showGreeting = true;
      this.greetingName = decodeURIComponent(name);
      this.greetingMessage = decodeURIComponent(message);
      this.previewMode = false;
      setTimeout(() => this.launchConfetti(), 300);
    }
  }

  addGreeting(): void {
    if (!this.newName.trim() || !this.newMessage.trim()) return;
    this.greetings.push({ name: this.newName.trim(), message: this.newMessage.trim() });
    this.saveToLocalStorage();
    this.newName = '';
    this.newMessage = '';
    this.shareableUrl = '';
  }

  deleteGreeting(index: number): void {
    this.greetings.splice(index, 1);
    this.saveToLocalStorage();
    this.shareableUrl = '';
  }

  generateLink(greeting: { name: string; message: string }): void {
    const baseUrl: string = window.location.origin + window.location.pathname;
    const url: string = `${baseUrl}?name=${encodeURIComponent(greeting.name)}&message=${encodeURIComponent(greeting.message)}`;
    this.shareableUrl = url;
  }

  copyToClipboard(text: string): void {
    void navigator.clipboard.writeText(text);
  }

  // Local Storage
  private saveToLocalStorage(): void {
    localStorage.setItem('birthday-greetings', JSON.stringify(this.greetings));
  }

  private loadFromLocalStorage(): void {
    const data: string | null = localStorage.getItem('birthday-greetings');
    if (data) {
      try {
        const parsed: unknown = JSON.parse(data);
        if (Array.isArray(parsed)) {
          this.greetings = parsed as Array<{ name: string; message: string }>;
        } else {
          this.greetings = [];
        }
      } catch {
        this.greetings = [];
      }
    }
  }

  // Download/Upload functionality using inherited functions
  downloadData(): void {
    this.componentDataDownloader({ greetings: this.greetings });
  }

  async uploadData(event: Event): Promise<void> {
    const result: any = await this.componentDataUploader(event);
    if (result && typeof result === 'object' && Array.isArray(result.greetings)) {
      this.greetings = result.greetings as Array<{ name: string; message: string }>;
      this.saveToLocalStorage();
      this.cdr.detectChanges();
    }
  }

  // Preview Functionality
  previewGreeting(greeting: { name: string; message: string }): void {
    this.greetingName = greeting.name;
    this.greetingMessage = greeting.message;
    this.showGreeting = true;
    this.previewMode = true;
    setTimeout(() => this.launchConfetti(), 300);
    this.cdr.detectChanges();
  }

  closePreview(): void {
    this.showGreeting = false;
    this.previewMode = false;
    this.greetingName = '';
    this.greetingMessage = '';
  }

  // Confetti Animation (Strict Type Checking)
  launchConfetti(): void {
    const canvasList: NodeListOf<HTMLCanvasElement> = document.querySelectorAll('canvas');
    if (!canvasList || canvasList.length === 0) return;
    const canvas: HTMLCanvasElement = canvasList[0]!;
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d')!;
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    interface ConfettiPiece {
      x: number;
      y: number;
      r: number;
      color: string;
      speed: number;
      angle: number;
    }
    const colors: string[] = ['#FFC107','#03A9F4','#E91E63','#8BC34A','#FF5722','#FFF176'];
    const pieces: ConfettiPiece[] = [];
    for (let i = 0; i < 70; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height,
        r: 7 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: 1 + Math.random() * 2,
        angle: Math.random() * 2 * Math.PI
      });
    }

    let running = true;
    function animate(): void {
      if (!running || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((p: ConfettiPiece) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.85;
        ctx.fill();
        ctx.globalAlpha = 1;
        p.y += p.speed;
        p.x += Math.sin(p.angle) * 1.5;
        p.angle += 0.01;
        if (p.y > canvas.height) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }
      });
      requestAnimationFrame(animate);
    }
    animate();

    // Stop after 7 seconds
    setTimeout(() => {
      running = false;
      if (ctx) {
        ctx.clearRect(0,0,canvas.width,canvas.height);
      }
    }, 7000);
  }
}