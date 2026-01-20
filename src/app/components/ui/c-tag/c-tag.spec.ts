import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CTag } from './c-tag';

describe('CTag', () => {
  let component: CTag;
  let fixture: ComponentFixture<CTag>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CTag]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CTag);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
