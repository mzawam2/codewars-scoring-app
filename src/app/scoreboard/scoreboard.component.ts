import { Component, Input, OnInit, OnDestroy } from '@angular/core';
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
  displayItems: ScoreBoardItem[] = [];
  private subscription?: Subscription;

  ngOnInit() {
    this.subscription = this.items$.subscribe(items => {
      this.displayItems = items;
      this.displayItems.forEach(item => {
        console.log(item.completedKatas)
      });
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
