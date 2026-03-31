import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AdminComponent } from './admin.component';

describe('AdminComponent (unit)', () => {
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [AdminComponent],
      providers: [{ provide: Router, useValue: routerSpy }],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AdminComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should sort teams alphabetically by codeWarsUser', () => {
    const fixture = TestBed.createComponent(AdminComponent);
    const component = fixture.componentInstance;

    const names = component.teams.map((t) => t.codeWarsUser);
    const sorted = [...names].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    expect(names).toEqual(sorted);
  });

  it('should keep original team index after sorting', () => {
    const fixture = TestBed.createComponent(AdminComponent);
    const component = fixture.componentInstance;

    const target = component.teams.find((t) => t.codeWarsUser === 'MildRacc');

    expect(target).toBeTruthy();
    expect(target?.originalIndex).toBe(2);
  });

  it('should navigate to team detail when selectTeam is called', () => {
    const fixture = TestBed.createComponent(AdminComponent);
    const component = fixture.componentInstance;

    component.selectTeam(3);

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin/team', 3]);
  });

  it('should run ngOnInit without side effects', () => {
    const fixture = TestBed.createComponent(AdminComponent);
    const component = fixture.componentInstance;

    expect(() => component.ngOnInit()).not.toThrow();
  });
});
