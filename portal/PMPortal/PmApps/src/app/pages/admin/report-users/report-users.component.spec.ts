import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportUsersComponent } from './report-users.component';

describe('ReportUsersComponent', () => {
  let component: ReportUsersComponent;
  let fixture: ComponentFixture<ReportUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportUsersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
