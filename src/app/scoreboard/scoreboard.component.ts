import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScoreBoardItem } from '../score-board-item';

@Component({
  selector: 'app-scoreboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scoreboard.component.html',
  styleUrl: './scoreboard.component.scss'
})
export class ScoreboardComponent {
  @Input() items: ScoreBoardItem[] = [];

  getSortedItems(): ScoreBoardItem[] {
    return [...this.items].sort((a, b) => b.points - a.points);
  }
}
