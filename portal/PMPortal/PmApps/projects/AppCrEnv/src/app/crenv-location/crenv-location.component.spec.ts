import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrenvLocationComponent } from './crenv-location.component';

describe('CrenvLocationComponent', () => {
  let component: CrenvLocationComponent;
  let fixture: ComponentFixture<CrenvLocationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrenvLocationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrenvLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
