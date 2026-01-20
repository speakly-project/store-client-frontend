import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CCurso } from './c-curso';

describe('CCurso', () => {
  let fixture: ComponentFixture<CCurso>;
  let component: CCurso;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CCurso]
    }).compileComponents();

    fixture = TestBed.createComponent(CCurso);
    component = fixture.componentInstance;
  });
});
