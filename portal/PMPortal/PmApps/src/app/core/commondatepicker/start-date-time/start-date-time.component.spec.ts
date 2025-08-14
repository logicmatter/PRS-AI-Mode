import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StartDateTimeComponent } from './start-date-time.component';

describe('StartDateTimeComponent', () => {
  let component: StartDateTimeComponent;
  let fixture: ComponentFixture<StartDateTimeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StartDateTimeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StartDateTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
