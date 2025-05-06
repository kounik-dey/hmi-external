import { Component } from '@angular/core';
import { CommonExternalComponent } from '../common-external/common-external.component';

interface HealthTip {
  id: number;
  title: string;
  description: string;
}

@Component({
  selector: 'app-shopping',
  template: `
    <!-- 
      Features:
      - Display a list of health tips
      - Mark tips as favorite
      - View only favorite tips
    -->
    <div class="health-tips-container">
      <h2>Health Tips</h2>
      <button (click)="showFavorites = !showFavorites">
        {{ showFavorites ? 'Show All' : 'Show Favorites' }}
      </button>
      <ul class="tips-list">
        <li *ngFor="let tip of displayedTips()">
          <span class="tip-title">{{tip.title}}</span>
          <p class="tip-desc">{{tip.description}}</p>
          <button (click)="toggleFavorite(tip)">
            {{ isFavorite(tip) ? 'Unfavorite' : 'Favorite' }}
          </button>
        </li>
      </ul>
    </div>
  `,
  styles: [`
    .health-tips-container { max-width: 500px; margin: auto; font-family: Arial, sans-serif; }
    h2 { color: #43a047; }
    .tips-list { list-style-type: none; padding: 0; }
    .tips-list li { border-bottom: 1px solid #e0e0e0; padding: 12px 0; }
    .tip-title { font-weight: bold; }
    .tip-desc { margin: 4px 0 8px 0; }
    button { margin-top: 4px; }
  `]
})
export class ShoppingComponent extends CommonExternalComponent {
  healthTips: HealthTip[] = [
    { id: 1, title: 'Stay Hydrated', description: 'Drink at least 8 glasses of water daily to keep your body hydrated.' },
    { id: 2, title: 'Regular Exercise', description: 'Engage in physical activity for at least 30 minutes most days.' },
    { id: 3, title: 'Balanced Diet', description: 'Eat a variety of foods including fruits, vegetables, and lean proteins.' },
    { id: 4, title: 'Adequate Sleep', description: 'Aim for 7-9 hours of sleep each night for optimal health.' }
  ];
  favorites: Set<number> = new Set<number>();
  showFavorites: boolean = false;

  toggleFavorite(tip: HealthTip): void {
    if (this.favorites.has(tip.id)) {
      this.favorites.delete(tip.id);
    } else {
      this.favorites.add(tip.id);
    }
  }

  isFavorite(tip: HealthTip): boolean {
    return this.favorites.has(tip.id);
  }

  displayedTips(): HealthTip[] {
    return this.showFavorites
      ? this.healthTips.filter(tip => this.favorites.has(tip.id))
      : this.healthTips;
  }
}