import { Component, Input, OnInit, OnDestroy, signal, computed, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScoreBoardItem } from '../score-board-item';
import { Observable, Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-scoreboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scoreboard.component.html',
  styleUrl: './scoreboard.component.scss'
})
export class ScoreboardComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() items$!: Observable<ScoreBoardItem[]>;
  @ViewChild('scoreboardScroll') private scrollContainer?: ElementRef;
  
  displayItems = signal<ScoreBoardItem[]>([]);
  sortedItems = computed(() => 
    this.displayItems().sort((a, b) => b.points - a.points)
  );
  
  private subscription?: Subscription;
  private scrollSubscription?: Subscription;
  private isScrollingPaused = false;
  private readonly SCROLL_INTERVAL = 25; // 3 seconds
  private readonly SCROLL_STEP = 100; // pixels

  ngOnInit() {
    this.subscription = this.items$.subscribe(items => {
      this.displayItems.set(items);
    });
  }

  ngAfterViewInit() {
    this.setupAutoScroll();
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
    this.scrollSubscription?.unsubscribe();
  }

  private setupAutoScroll() {
    const scrollElement = this.scrollContainer?.nativeElement;
    if (!scrollElement) return;

    // Add mouse events to pause scrolling when user interacts
    scrollElement.addEventListener('mouseenter', () => this.isScrollingPaused = true);
    scrollElement.addEventListener('mouseleave', () => this.isScrollingPaused = false);

    // Set up the auto-scroll interval
    this.scrollSubscription = interval(this.SCROLL_INTERVAL).subscribe(() => {
      if (this.isScrollingPaused) return;

      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      
      // If we're at the bottom, scroll back to top
      if (scrollTop + clientHeight >= scrollHeight) {
        scrollElement.scrollTo({ top: 0, behavior: 'instant' });
      } else {
        // Otherwise, scroll down by SCROLL_STEP pixels
        scrollElement.scrollBy({ top: this.SCROLL_STEP, behavior: 'smooth' });
      }
    });
  }
}
