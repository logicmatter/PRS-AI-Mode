import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreqComplianceprofileComponent } from './creq-complianceprofile.component';

describe('CreqComplianceprofileComponent', () => {
  let component: CreqComplianceprofileComponent;
  let fixture: ComponentFixture<CreqComplianceprofileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreqComplianceprofileComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreqComplianceprofileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
