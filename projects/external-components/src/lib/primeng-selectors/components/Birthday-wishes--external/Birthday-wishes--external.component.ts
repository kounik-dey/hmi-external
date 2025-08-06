// birthday-wishes-.component.ts

import { Component, AfterViewInit } from '@angular/core';
import { CommonExternalComponent } from '../common-external/common-external.component';

@Component({
  selector: 'app-birthday-wishes-',
  template: `
    <!-- 
      Birthday Wishes App

      Features:
      - Enter your friend's name and select a wish from the list.
      - Instantly generate a shareable birthday wish link.
      - Animated fireworks in the background for celebration!
      - All wishes are saved in your browser (local storage).
      - Responsive, modern interface with Bootstrap 5 and PrimeIcons.
    -->
    <div class="fireworks-bg"></div>
    <div class="card shadow-sm mt-4 mx-auto position-relative" style="max-width: 430px; z-index:2;">
      <div class="card-header d-flex align-items-center">
        <i class="pi pi-gift text-primary me-2"></i>
        <strong>Birthday Wishes Generator</strong>
      </div>
      <div class="card-body">
        <form (ngSubmit)="generateLink()" autocomplete="off">
          <div class="mb-3">
            <label for="friendName" class="form-label">Friend's Name</label>
            <input id="friendName" type="text" class="form-control" maxlength="32"
              [(ngModel)]="friendName" name="friendName" required
              placeholder="Enter your friend's name">
          </div>
          <div class="mb-3">
            <label for="wishSelect" class="form-label">Choose a Wish</label>
            <select id="wishSelect" class="form-select" [(ngModel)]="selectedWish" name="selectedWish" required>
              <option *ngFor="let wish of wishesList" [value]="wish">{{ wish }}</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary w-100"
            [disabled]="!friendName.trim() || !selectedWish">
            <i class="pi pi-link me-2"></i> Generate Shareable Link
          </button>
        </form>

        <div *ngIf="shareableLink" class="alert alert-success mt-4 mb-0 d-flex align-items-center justify-content-between">
          <span>
            <i class="pi pi-check-circle me-2"></i>
            <a [href]="shareableLink" target="_blank">{{ shareableLink }}</a>
          </span>
          <button class="btn btn-outline-secondary btn-sm ms-2"
            (click)="copyToClipboard()">
            <i class="pi pi-copy"></i>
          </button>
        </div>
      </div>
      <div class="card-footer small text-muted text-end">
        Made with <i class="pi pi-heart-fill text-danger"></i>
      </div>
    </div>
    <canvas id="fireworks-canvas" class="position-fixed top-0 start-0 w-100 h-100" style="z-index:1;pointer-events:none;"></canvas>
  `,
  styles: [`
    .fireworks-bg {
      position: fixed;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      z-index: 0;
      pointer-events: none;
      background: transparent;
    }
    .card { border-radius: 1.25rem; }
    .alert a { color: #155724; text-decoration: underline; word-break: break-all; }
    canvas#fireworks-canvas {
      position: fixed;
      top: 0; left: 0;
      width: 100vw !important;
      height: 100vh !important;
      display: block;
    }
  `]
})
export class BirthdayWishesComponent extends CommonExternalComponent implements AfterViewInit {
  friendName: string = '';
  selectedWish: string = '';
  shareableLink: string = '';
  wishesList: string[] = [
    "Happy Birthday! Wishing you a day filled with love and cheer.",
    "May your birthday be as wonderful as you are!",
    "Cheers to you on your special day!",
    "Wishing you lots of smiles and laughter today!",
    "Hope all your wishes come true this year!",
    "Have a fantastic birthday and a great year ahead!",
    "Sending you hugs, kisses, and lots of birthday joy!",
    "Another adventure-filled year awaits you. Happy Birthday!",
    "Wishing you a magical birthday!",
    "May your day be bright and your year even brighter!"
  ];

  ngAfterViewInit(): void {
    this.launchFireworks();
  }

  generateLink(): void {
    if (!this.friendName.trim() || !this.selectedWish) return;
    const encodedName: string = encodeURIComponent(this.friendName.trim());
    const encodedWish: string = encodeURIComponent(this.selectedWish);
    // Example shareable link: /birthday-wish?name=John&wish=Happy%20Birthday
    const baseUrl: string = window.location.origin + '/birthday-wish?name=';
    this.shareableLink = `${baseUrl}${encodedName}&wish=${encodedWish}`;
    this.saveWish(this.friendName, this.selectedWish, this.shareableLink);
  }

  saveWish(name: string, wish: string, link: string): void {
    const wishObj = {
      name,
      wish,
      link,
      date: new Date().toISOString()
    };
    let history: any[] = [];
    try {
      history = JSON.parse(localStorage.getItem('birthday_wishes_history') ?? '[]');
    } catch { history = []; }
    history.unshift(wishObj);
    localStorage.setItem('birthday_wishes_history', JSON.stringify(history));
  }

  copyToClipboard(): void {
    if (this.shareableLink) {
      navigator.clipboard.writeText(this.shareableLink);
    }
  }

  // Simple canvas fireworks animation (no external library)
  launchFireworks(): void {
    const canvas = document.getElementById('fireworks-canvas') as HTMLCanvasElement | null;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    interface Particle {
      x: number; y: number; vx: number; vy: number; alpha: number; color: string;
    }
    let particles: Particle[] = [];

    function randomColor(): string {
      const colors = ['#FF5252','#FFD740','#40C4FF','#69F0AE','#FF4081','#7C4DFF'];
      return colors[Math.floor(Math.random()*colors.length)];
    }

    function createFirework() {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height * 0.5 + 50;
      const color = randomColor();
      for (let i = 0; i < 36; i++) {
        const angle = (i / 36) * 2 * Math.PI;
        const speed = Math.random() * 3 + 2;
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color
        });
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, 2 * Math.PI);
        ctx.fillStyle = p.color;
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04; // gravity
        p.alpha -= 0.012;
      }
      particles = particles.filter(p => p.alpha > 0);
      ctx.globalAlpha = 1;
      requestAnimationFrame(animate);
    }

    setInterval(createFirework, 1200);
    animate();
  }
}