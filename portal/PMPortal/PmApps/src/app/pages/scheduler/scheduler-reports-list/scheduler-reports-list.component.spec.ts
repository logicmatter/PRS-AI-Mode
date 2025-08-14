import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchedulerReportsListComponent } from './scheduler-reports-list.component';

describe('SchedulerReportsListComponent', () => {
  let component: SchedulerReportsListComponent;
  let fixture: ComponentFixture<SchedulerReportsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SchedulerReportsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchedulerReportsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
