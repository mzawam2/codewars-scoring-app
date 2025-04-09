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
  // sortedItems = computed(() =>
  //   this.displayItems().sort((a, b) => b.points - a.points)
  // );

  private subscription?: Subscription;
  private scrollSubscription?: Subscription;
  private refreshSubscription?: Subscription;
  private isScrollingPaused = false;
  private readonly SCROLL_INTERVAL = 24;
  private readonly SCROLL_STEP = 3; // pixels
  private readonly REFRESH_INTERVAL = 60000; // 1 minute in milliseconds

  ngOnInit() {
    this.subscribeToItems();

    // Set up a timer to refresh the scoreboard every minute
    this.refreshSubscription = interval(this.REFRESH_INTERVAL).subscribe(() => {
      this.subscribeToItems();
    });
  }

  ngAfterViewInit() {
    this.setupAutoScroll();
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
    this.scrollSubscription?.unsubscribe();
    this.refreshSubscription?.unsubscribe();
  }

  private subscribeToItems() {
    this.subscription?.unsubscribe(); // Unsubscribe from any previous subscription
    this.subscription = this.items$.subscribe(items => {
      const formattedItems = items.map(item => ({
        ...item,
        time: item.time ? this.formatTimeTo12Hour(item.time) : undefined
      }));
      this.displayItems.set(formattedItems);
    });
  }

  private formatTimeTo12Hour(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  private setupAutoScroll() {
    const scrollElement = this.scrollContainer?.nativeElement;
    if (!scrollElement) return;

    // Add mouse events to pause scrolling when user interacts
    scrollElement.addEventListener('mouseenter', () => this.isScrollingPaused = true);
    scrollElement.addEventListener('mouseleave', () => this.isScrollingPaused = false);

    let atTop = true; // Track if we're at the top
    let atBottom = false; // Track if we're at the bottom
    let loiterStartTime: number | null = null;

    // Set up the auto-scroll interval
    this.scrollSubscription = interval(this.SCROLL_INTERVAL).subscribe(() => {
      if (this.isScrollingPaused) return;

      const { scrollTop, scrollHeight, clientHeight } = scrollElement;

      if (atTop) {
        if (loiterStartTime === null) {
          loiterStartTime = Date.now(); // Start loitering at the top
        } else if (Date.now() - loiterStartTime >= 7000) { // Loiter for 7 seconds
          atTop = false; // Start scrolling
          loiterStartTime = null;
        }
      } else if (atBottom) {
        if (loiterStartTime === null) {
          loiterStartTime = Date.now(); // Start loitering at the bottom
        } else if (Date.now() - loiterStartTime >= 3000) { // Loiter for 3 seconds
          scrollElement.scrollTo({ top: 0, behavior: 'instant' });
          atTop = true; // Reset to loiter at the top
          atBottom = false;
          loiterStartTime = null;
        }
      } else {
        // If we're at the bottom, start loitering
        if (scrollTop + clientHeight >= scrollHeight) {
          atBottom = true;
          loiterStartTime = null; // Reset loiter start time for the bottom
        } else {
          // Otherwise, scroll down by SCROLL_STEP pixels
          scrollElement.scrollBy({ top: this.SCROLL_STEP, behavior: 'smooth' });
        }
      }
    });
  }
}
