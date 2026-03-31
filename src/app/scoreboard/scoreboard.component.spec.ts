import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, Subscription } from 'rxjs';

import { ScoreboardComponent } from './scoreboard.component';
import { SCOREBOARD_UI_CONFIG } from '../config/ui.config';

describe('ScoreboardComponent (unit)', () => {
  let component: ScoreboardComponent;
  let fixture: ComponentFixture<ScoreboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoreboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.items$ = of([]);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render last updated fallback when no items exist', () => {
    component.items$ = of([]);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.scoreboard-time')?.textContent).toContain('Last Updated: N/A');
  });

  it('should format time to 12-hour and render rows', () => {
    component.items$ = of([
      {
        teamMembers: ['Alice', 'Bob'],
        codeWarsUser: 'alice1',
        completedKatas: ['Nut Farm'],
        points: 200,
        rank: 1,
        time: '13:05'
      }
    ]);

    fixture.detectChanges();

    expect(component.lastUpdated()).toBe('1:05 PM');

    const el = fixture.nativeElement as HTMLElement;
    const rows = el.querySelectorAll('tbody tr');
    expect(rows.length).toBe(1);
    expect(el.querySelector('.scoreboard-time')?.textContent).toContain('Last Updated: 1:05 PM');
    expect(rows[0].textContent).toContain('Alice, Bob');
    expect(rows[0].textContent).toContain('200');
  });

  it('should keep item time undefined when source time is missing', () => {
    component.items$ = of([
      {
        teamMembers: ['Alice', 'Bob'],
        codeWarsUser: 'alice1',
        completedKatas: ['Nut Farm'],
        points: 200,
        rank: 1
      }
    ]);

    fixture.detectChanges();

    expect(component.displayItems()[0].time).toBeUndefined();
    expect(component.lastUpdated()).toBe('N/A');
  });

  it('should unsubscribe active subscriptions on destroy', () => {
    const subA = new Subscription();
    const subB = new Subscription();
    const subC = new Subscription();

    spyOn(subA, 'unsubscribe');
    spyOn(subB, 'unsubscribe');
    spyOn(subC, 'unsubscribe');

    (component as any).subscription = subA;
    (component as any).scrollSubscription = subB;
    (component as any).refreshSubscription = subC;

    component.ngOnDestroy();

    expect(subA.unsubscribe).toHaveBeenCalled();
    expect(subB.unsubscribe).toHaveBeenCalled();
    expect(subC.unsubscribe).toHaveBeenCalled();
  });

  it('should format midnight and morning time correctly', () => {
    expect((component as any).formatTimeTo12Hour('00:07')).toBe('12:07 AM');
    expect((component as any).formatTimeTo12Hour('09:15')).toBe('9:15 AM');
  });

  it('should setup refresh subscription on init', () => {
    component.items$ = of([]);

    component.ngOnInit();

    expect((component as any).refreshSubscription).toBeTruthy();
    component.ngOnDestroy();
  });

  it('should safely return when scroll container is missing', () => {
    (component as any).scrollContainer = undefined;

    expect(() => (component as any).setupAutoScroll()).not.toThrow();
  });

  it('should re-subscribe on refresh interval', fakeAsync(() => {
    component.items$ = of([]);
    const subscribeSpy = spyOn<any>(component, 'subscribeToItems').and.callThrough();

    component.ngOnInit();
    expect(subscribeSpy).toHaveBeenCalledTimes(1);

    tick(SCOREBOARD_UI_CONFIG.uiRefreshIntervalMs + 1);
    expect(subscribeSpy).toHaveBeenCalledTimes(2);

    component.ngOnDestroy();
  }));

  it('should auto-scroll down after top loiter', fakeAsync(() => {
    const handlers: Record<string, () => void> = {};
    const scrollElement = {
      scrollTop: 0,
      scrollHeight: 1000,
      clientHeight: 100,
      addEventListener: (event: string, handler: () => void) => {
        handlers[event] = handler;
      },
      scrollBy: jasmine.createSpy('scrollBy'),
      scrollTo: jasmine.createSpy('scrollTo')
    };

    let now = 1000;
    spyOn(Date, 'now').and.callFake(() => now);

    (component as any).scrollContainer = { nativeElement: scrollElement };
    (component as any).setupAutoScroll();

    tick(SCOREBOARD_UI_CONFIG.scrollIntervalMs);
    now += SCOREBOARD_UI_CONFIG.topLoiterMs + 1;
    tick(SCOREBOARD_UI_CONFIG.scrollIntervalMs);
    tick(SCOREBOARD_UI_CONFIG.scrollIntervalMs);

    expect(scrollElement.scrollBy).toHaveBeenCalledWith({
      top: SCOREBOARD_UI_CONFIG.scrollStepPx,
      behavior: 'smooth'
    });
    expect(handlers['mouseenter']).toBeDefined();
    expect(handlers['mouseleave']).toBeDefined();

    (component as any).scrollSubscription?.unsubscribe();
  }));

  it('should pause on mouse enter and reset to top after bottom loiter', fakeAsync(() => {
    const handlers: Record<string, () => void> = {};
    const scrollElement = {
      scrollTop: 0,
      scrollHeight: 200,
      clientHeight: 100,
      addEventListener: (event: string, handler: () => void) => {
        handlers[event] = handler;
      },
      scrollBy: jasmine.createSpy('scrollBy'),
      scrollTo: jasmine.createSpy('scrollTo')
    };

    let now = 1000;
    spyOn(Date, 'now').and.callFake(() => now);

    (component as any).scrollContainer = { nativeElement: scrollElement };
    (component as any).setupAutoScroll();

    handlers['mouseenter']();
    tick(SCOREBOARD_UI_CONFIG.scrollIntervalMs);
    expect(scrollElement.scrollBy).not.toHaveBeenCalled();

    handlers['mouseleave']();
    tick(SCOREBOARD_UI_CONFIG.scrollIntervalMs);
    now += SCOREBOARD_UI_CONFIG.topLoiterMs + 1;
    tick(SCOREBOARD_UI_CONFIG.scrollIntervalMs);

    scrollElement.scrollTop = 100;
    tick(SCOREBOARD_UI_CONFIG.scrollIntervalMs);
    tick(SCOREBOARD_UI_CONFIG.scrollIntervalMs);

    now += SCOREBOARD_UI_CONFIG.bottomLoiterMs + 1;
    tick(SCOREBOARD_UI_CONFIG.scrollIntervalMs);

    expect(scrollElement.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'instant' });

    (component as any).scrollSubscription?.unsubscribe();
  }));
});
