import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Cursos } from './cursos';

describe('Cursos page', () => {
  let fixture: ComponentFixture<Cursos>;
  let component: Cursos;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cursos]
    }).compileComponents();

    fixture = TestBed.createComponent(Cursos);
    component = fixture.componentInstance;
  });

  it('should create the page component', () => {
    expect(component).toBeTruthy();
  });

  it('should render course cards in the grid', () => {
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const cards = el.querySelectorAll('c-curso');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('should render filters and pagination', () => {
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.filters')).toBeTruthy();
    expect(el.querySelector('.pagination')).toBeTruthy();
  });
});
