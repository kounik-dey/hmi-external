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
      - Data is saved in local storage.
      - Responsive Bootstrap 5 UI, PrimeIcons v7 for icons.
    -->

    <div class="container py-4">
      <div class="d-flex justify-content-between align-items-center mb-3" *ngIf="!showGreeting">
        <h2>
          <i class="pi pi-gift text-primary"></i> Birthday Greetings
        </h2>
      </div>

      <!-- Greeting View if link has params or preview -->
      <div *ngIf="showGreeting" class="text-center position-relative" style="min-height: 350px;">
        <canvas #confettiCanvas class="position-fixed top-0 start-0 w-100 h-100" 
                style="pointer-events:none; z-index:1050;"></canvas>
        <div class="card shadow mx-auto p-4 border-0"
             style="max-width: 400px; background: rgba(255,255,255,0.97); position:relative; z-index:1060;">
          <div class="mb-3">
            <i class="pi pi-smile text-warning fs-1"></i>
          </div>
          <h3 class="mb-3">
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
    @media (max-width: 500px) {
      .card {
        padding: 1.25rem !important;
      }
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

  // Confetti Animation (Strict Type Checking, foreground, vibrant)
  launchConfetti(): void {
    const canvasList: NodeListOf<HTMLCanvasElement> = document.querySelectorAll('canvas');
    if (!canvasList || canvasList.length === 0) return;
    const canvas: HTMLCanvasElement = canvasList[0]!;
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d')!;
    // Make confetti full viewport and always on top
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '1050';

    interface ConfettiPiece {
      x: number;
      y: number;
      r: number;
      color: string;
      tilt: number;
      tiltAngle: number;
      speed: number;
      angle: number;
    }
    const colors: string[] = [
      '#FFC107','#03A9F4','#E91E63','#8BC34A','#FF5722','#FFF176','#7C4DFF','#00E676'
    ];
    const pieces: ConfettiPiece[] = [];
    const totalPieces = Math.floor(window.innerWidth / 10) + 60;
    for (let i = 0; i < totalPieces; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height,
        r: 8 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.random() * 10 - 10,
        tiltAngle: Math.random() * Math.PI,
        speed: 1.5 + Math.random() * 2.5,
        angle: Math.random() * 2 * Math.PI
      });
    }

    let running = true;
    function animate(): void {
      if (!running || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((p: ConfettiPiece) => {
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(
          p.x + p.tilt, p.y, p.r, p.r * 0.45, p.tiltAngle, 0, 2 * Math.PI
        );
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.92;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.restore();

        p.y += p.speed;
        p.x += Math.sin(p.angle) * 1.6;
        p.tiltAngle += 0.08 + Math.random() * 0.04;
        p.tilt = Math.sin(p.tiltAngle) * 16;
        p.angle += 0.008;
        if (p.y > canvas.height + 20) {
          p.y = -15;
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