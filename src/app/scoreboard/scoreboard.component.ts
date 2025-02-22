import { Component, Input, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScoreBoardItem } from '../score-board-item';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-scoreboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scoreboard.component.html',
  styleUrl: './scoreboard.component.scss'
})
export class ScoreboardComponent implements OnInit, OnDestroy {
  @Input() items$!: Observable<ScoreBoardItem[]>;
  displayItems = signal<ScoreBoardItem[]>([]);
  sortedItems = computed(() => 
    this.displayItems().sort((a, b) => b.points - a.points)
  );
  private subscription?: Subscription;

  ngOnInit() {
    this.subscription = this.items$.subscribe(items => {
      this.displayItems.set(items);
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
