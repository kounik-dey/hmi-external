// birthday-greetings.component.ts

import { Component, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
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
      - Launch fireworks show for special effect.
      - Data is saved in local storage.
      - Responsive Bootstrap 5 UI, PrimeIcons v7 for icons.
    -->

    <div class="container py-4">
      <div class="d-flex justify-content-between align-items-center mb-3" *ngIf="!showGreeting && !fireworkMode">
        <h2>
          <i class="pi pi-gift text-primary"></i> Birthday Greetings
        </h2>
      </div>

      <!-- Fireworks Overlay -->
      <div *ngIf="fireworkMode" class="position-fixed top-0 start-0 w-100 h-100"
           style="z-index:3000; background:#000; display:flex; align-items:center; justify-content:center;">
        <canvas #fireworkCanvas style="position:absolute; inset:0; width:100vw; height:100vh; z-index:1;"></canvas>
        <div *ngIf="showFireworkName" class="w-100 text-center" style="z-index:2;">
          <span class="fw-bold text-white display-3" style="text-shadow:0 0 20px #fff,0 0 40px #f39c12;">{{ greetingName }}</span>
        </div>
      </div>

      <!-- Greeting View if link has params or preview -->
      <div *ngIf="showGreeting && !fireworkMode" class="text-center position-relative" style="min-height: 350px;">
        <div style="position: fixed; inset: 0; z-index: 2001; pointer-events: none;">
          <canvas #confettiCanvas></canvas>
        </div>
        <div class="card shadow mx-auto p-4 border-0"
             style="max-width: 400px; background: rgba(255,255,255,0.97); position:relative; z-index:2002;">
          <div class="mb-3">
            <i class="pi pi-smile text-warning fs-1"></i>
          </div>
          <h3 class="mb-3">
            Happy Birthday, <span class="text-primary">{{ greetingName }}</span>!
          </h3>
          <p class="lead">{{ greetingMessage }}</p>
          <button *ngIf="previewMode" class="btn btn-outline-secondary mt-3 me-2" (click)="closePreview()">
            <i class="pi pi-times"></i> Close Preview
          </button>
          <button class="btn btn-dark mt-3" (click)="launchFireworks()" type="button">
            <i class="pi pi-star-fill text-warning"></i> Launch Fireworks
          </button>
        </div>
      </div>

      <!-- Main App to add greetings -->
      <div *ngIf="!showGreeting && !fireworkMode">
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
    .display-3 {
      font-size: 2.8rem;
    }
    @media (min-width: 768px) {
      .display-3 {
        font-size: 4rem;
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

  fireworkMode: boolean = false;
  showFireworkName: boolean = false;

  @ViewChild('confettiCanvas') confettiCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('fireworkCanvas') fireworkCanvasRef!: ElementRef<HTMLCanvasElement>;

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
    this.fireworkMode = false;
    this.showFireworkName = false;
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

  // Confetti Animation (Strict Type Checking, foreground, real paper effect)
  launchConfetti(): void {
    setTimeout(() => {
      const canvas: HTMLCanvasElement = this.confettiCanvasRef?.nativeElement!;
      if (!canvas) return;
      const ctx: CanvasRenderingContext2D = canvas.getContext('2d')!;
      // Full viewport
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      canvas.style.zIndex = '2001';
      canvas.style.pointerEvents = 'none';
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      interface ConfettiPiece {
        x: number;
        y: number;
        w: number;
        h: number;
        color: string;
        tilt: number;
        tiltAngle: number;
        speed: number;
        angle: number;
        rotate: number;
        rotateSpeed: number;
        opacity: number;
        gravity: number;
        wind: number;
      }
      const colors: string[] = [
        '#FFC107','#03A9F4','#E91E63','#8BC34A','#FF5722','#FFF176','#7C4DFF','#00E676',
        '#F44336','#FFEB3B','#009688','#FF9800','#673AB7'
      ];
      const pieces: ConfettiPiece[] = [];
      const totalPieces = Math.floor(window.innerWidth / 8) + 70;
      for (let i = 0; i < totalPieces; i++) {
        pieces.push({
          x: Math.random() * canvas.width,
          y: Math.random() * -canvas.height,
          w: 8 + Math.random() * 10,
          h: 18 + Math.random() * 12,
          color: colors[Math.floor(Math.random() * colors.length)],
          tilt: Math.random() * 16 - 8,
          tiltAngle: Math.random() * Math.PI,
          speed: 2 + Math.random() * 2.6,
          angle: Math.random() * 2 * Math.PI,
          rotate: Math.random() * 360,
          rotateSpeed: (Math.random() - 0.5) * 8,
          opacity: 0.85 + Math.random() * 0.15,
          gravity: 0.14 + Math.random() * 0.13,
          wind: (Math.random() - 0.5) * 0.9
        });
      }

      let running = true;
      function animate(): void {
        if (!running || !ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pieces.forEach((p: ConfettiPiece) => {
          ctx.save();
          ctx.globalAlpha = p.opacity;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.tiltAngle + p.rotate * Math.PI / 180);
          ctx.beginPath();
          // Draw rectangle as paper piece, rounded edge
          ctx.moveTo(-p.w/2, -p.h/2);
          ctx.lineTo(p.w/2, -p.h/2);
          ctx.quadraticCurveTo(p.w/2+2, 0, p.w/2, p.h/2);
          ctx.lineTo(-p.w/2, p.h/2);
          ctx.quadraticCurveTo(-p.w/2-2, 0, -p.w/2, -p.h/2);
          ctx.closePath();
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 12;
          ctx.fill();
          ctx.restore();

          // Physics-like motion
          p.y += p.speed + p.gravity;
          p.x += Math.sin(p.angle) * 1.1 + p.wind;
          p.tiltAngle += 0.06 + Math.random() * 0.07;
          p.tilt = Math.sin(p.tiltAngle) * 16;
          p.angle += 0.008 + Math.random() * 0.005;
          p.rotate += p.rotateSpeed;
          if (p.y > canvas.height + 30) {
            p.y = -20;
            p.x = Math.random() * canvas.width;
            p.rotate = Math.random() * 360;
            p.tilt = Math.random() * 16 - 8;
            p.tiltAngle = Math.random() * Math.PI;
          }
        });
        requestAnimationFrame(animate);
      }
      animate();

      // Stop after 7 seconds
      setTimeout(() => {
        running = false;
        ctx.clearRect(0,0,canvas.width,canvas.height);
      }, 7000);
    }, 10);
  }

  // Firework Button Handler
  launchFireworks(): void {
    this.fireworkMode = true;
    this.showFireworkName = false;
    this.cdr.detectChanges();
    setTimeout(() => this.startFireworkShow(), 50);
  }

  // Firework Animation
  startFireworkShow(): void {
    const canvas: HTMLCanvasElement = this.fireworkCanvasRef?.nativeElement!;
    if (!canvas) return;
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '3001';
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      alpha: number;
      size: number;
      decay: number;
    }
    interface Firework {
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      speed: number;
      color: string;
      exploded: boolean;
      particles: Particle[];
      trail: Array<{x:number, y:number}>;
    }

    const colors: string[] = [
      '#FFD700', '#FF5252', '#69F0AE', '#40C4FF', '#E040FB', '#FFAB00', '#00E676', '#D500F9'
    ];
    const fireworks: Firework[] = [];
    const numFireworks = 5 + Math.floor(Math.random() * 2); // 5-6 fireworks

    // Evenly spread horizontally
    for (let i = 0; i < numFireworks; i++) {
      const x = ((i + 0.5) / numFireworks) * canvas.width + (Math.random()-0.5)*80;
      const targetY = 140 + Math.random()*60;
      fireworks.push({
        x: x,
        y: canvas.height + 10,
        targetX: x + (Math.random()-0.5)*40,
        targetY: targetY,
        speed: 11 + Math.random() * 2,
        color: colors[i % colors.length],
        exploded: false,
        particles: [],
        trail: []
      });
    }

    let frame = 0;
    let allExploded = false;
    let animationId: number;

    const drawFireworkTrail = (fw: Firework) => {
      ctx.save();
      ctx.strokeStyle = fw.color;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let j = 0; j < fw.trail.length-1; j++) {
        ctx.moveTo(fw.trail[j].x, fw.trail[j].y);
        ctx.lineTo(fw.trail[j+1].x, fw.trail[j+1].y);
      }
      ctx.stroke();
      ctx.restore();
    };

    const animateFireworks = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      allExploded = true;
      for (const fw of fireworks) {
        if (!fw.exploded) {
          // Move up
          const dx = fw.targetX - fw.x;
          const dy = fw.targetY - fw.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist > fw.speed) {
            fw.x += (dx / dist) * fw.speed;
            fw.y += (dy / dist) * fw.speed;
            fw.trail.push({x: fw.x, y: fw.y});
            if (fw.trail.length > 15) fw.trail.shift();
            // Draw firework head
            ctx.save();
            ctx.beginPath();
            ctx.arc(fw.x, fw.y, 7, 0, 2*Math.PI);
            ctx.fillStyle = fw.color;
            ctx.shadowColor = fw.color;
            ctx.shadowBlur = 20;
            ctx.globalAlpha = 0.92;
            ctx.fill();
            ctx.restore();
            drawFireworkTrail(fw);
            allExploded = false;
          } else {
            // Explode
            fw.exploded = true;
            for (let p = 0; p < 42 + Math.floor(Math.random()*12); p++) {
              const angle = (Math.PI * 2) * (p/(42 + Math.floor(Math.random()*12)));
              const speed = 3.5 + Math.random() * 2.2;
              fw.particles.push({
                x: fw.x,
                y: fw.y,
                vx: Math.cos(angle) * speed * (0.9+Math.random()*0.22),
                vy: Math.sin(angle) * speed * (0.9+Math.random()*0.22),
                color: fw.color,
                alpha: 1,
                size: 2.3 + Math.random()*1.6,
                decay: 0.012 + Math.random()*0.012
              });
            }
          }
        }
        // Animate explosion particles
        if (fw.exploded) {
          for (const part of fw.particles) {
            if (part.alpha > 0) {
              part.x += part.vx;
              part.y += part.vy;
              part.vy += 0.04; // gravity
              part.vx *= 0.985;
              part.vy *= 0.985;
              part.alpha -= part.decay;
              ctx.save();
              ctx.globalAlpha = Math.max(part.alpha, 0);
              ctx.beginPath();
              ctx.arc(part.x, part.y, part.size, 0, 2*Math.PI);
              ctx.fillStyle = part.color;
              ctx.shadowColor = part.color;
              ctx.shadowBlur = 15;
              ctx.fill();
              ctx.restore();
            }
          }
        }
      }
      frame++;
      if (frame < 110) {
        animationId = requestAnimationFrame(animateFireworks);
      } else {
        // Show name after all fireworks
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setTimeout(() => {
          this.showFireworkName = true;
          this.cdr.detectChanges();
          setTimeout(() => {
            this.fireworkMode = false;
            this.showFireworkName = false;
            this.cdr.detectChanges();
            setTimeout(() => this.launchConfetti(), 150);
          }, 1900);
        }, 450);
      }
    };
    animateFireworks();
  }
}