import { Component } from '@angular/core';
import { CommonExternalComponent } from '../common-external/common-external.component';

@Component({
  selector: 'app-tik-Tak-',
  template: `
    <!--
      Features:
      - 3x3 grid for two players (X and O)
      - Tracks current player turn
      - Shows winner or draw
      - Reset button to play again
    -->
    <div class="ttt-container">
      <h2>Tik Tak Toe</h2>
      <div class="status" *ngIf="!winner && !isDraw">
        Current Player: <span>{{ currentPlayer }}</span>
      </div>
      <div class="status" *ngIf="winner">
        Winner: <span>{{ winner }}</span>
      </div>
      <div class="status" *ngIf="isDraw && !winner">
        It's a Draw!
      </div>
      <div class="board">
        <button
          *ngFor="let cell of board; let i = index"
          class="cell"
          [disabled]="cell !== '' || !!winner"
          (click)="makeMove(i)"
        >
          {{ cell }}
        </button>
      </div>
      <button class="reset-btn" (click)="resetGame()">Reset</button>
    </div>
  `,
  styles: [`
    .ttt-container {
      width: 260px;
      margin: 30px auto;
      padding: 18px;
      border: 1px solid #ccc;
      border-radius: 8px;
      background: #f8f9fa;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      text-align: center;
    }
    .board {
      display: grid;
      grid-template-columns: repeat(3, 60px);
      gap: 5px;
      margin: 20px 0;
    }
    .cell {
      width: 60px;
      height: 60px;
      font-size: 2rem;
      background: #fff;
      border: 1px solid #bbb;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .cell:disabled {
      background: #e9ecef;
      cursor: default;
    }
    .status {
      margin-bottom: 10px;
      font-weight: bold;
    }
    .reset-btn {
      margin-top: 10px;
      padding: 6px 16px;
      border: none;
      border-radius: 4px;
      background: #007bff;
      color: #fff;
      font-size: 1rem;
      cursor: pointer;
      transition: background 0.2s;
    }
    .reset-btn:hover {
      background: #0056b3;
    }
  `]
})
export class tikTakComponent extends CommonExternalComponent {
  board: string[] = Array(9).fill('');
  currentPlayer: 'X' | 'O' = 'X';
  winner: string = '';
  isDraw: boolean = false;

  makeMove(index: number): void {
    if (this.board[index] === '' && !this.winner) {
      this.board[index] = this.currentPlayer;
      if (this.checkWinner()) {
        this.winner = this.currentPlayer;
      } else if (this.board.every(cell => cell !== '')) {
        this.isDraw = true;
      } else {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
      }
    }
  }

  checkWinner(): boolean {
    const winPatterns: number[][] = [
      [0,1,2], [3,4,5], [6,7,8],
      [0,3,6], [1,4,7], [2,5,8],
      [0,4,8], [2,4,6]
    ];
    return winPatterns.some(pattern =>
      pattern.every(idx => this.board[idx] === this.currentPlayer)
    );
  }

  resetGame(): void {
    this.board = Array(9).fill('');
    this.currentPlayer = 'X';
    this.winner = '';
    this.isDraw = false;
  }
}