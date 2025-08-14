import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LicenseValidatorComponent } from './license-validator.component';

describe('SessionTimeoutComponent', () => {
  let component: LicenseValidatorComponent;
  let fixture: ComponentFixture<LicenseValidatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LicenseValidatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LicenseValidatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
