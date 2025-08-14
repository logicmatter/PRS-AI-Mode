import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppShowReportComponent } from './app-show-report.component';

describe('AppShowReportComponent', () => {
  let component: AppShowReportComponent;
  let fixture: ComponentFixture<AppShowReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppShowReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppShowReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
