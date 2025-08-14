import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrenvStandardComponent } from './crenv-standard.component';

describe('CrenvStandardComponent', () => {
  let component: CrenvStandardComponent;
  let fixture: ComponentFixture<CrenvStandardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrenvStandardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrenvStandardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
