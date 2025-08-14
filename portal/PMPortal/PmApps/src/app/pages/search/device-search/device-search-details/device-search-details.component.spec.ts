import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceSearchDetailsComponent } from './device-search-details.component';

describe('DeviceSearchDetailsComponent', () => {
  let component: DeviceSearchDetailsComponent;
  let fixture: ComponentFixture<DeviceSearchDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceSearchDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceSearchDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
