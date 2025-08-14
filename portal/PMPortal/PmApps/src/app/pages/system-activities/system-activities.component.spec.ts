import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemActivitiesComponent } from './system-activities.component';

describe('SystemActivitiesComponent', () => {
  let component: SystemActivitiesComponent;
  let fixture: ComponentFixture<SystemActivitiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SystemActivitiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemActivitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
