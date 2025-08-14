import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrenvComplianceprofileComponent } from './crenv-complianceprofile.component';

describe('CrenvComplianceprofileComponent', () => {
  let component: CrenvComplianceprofileComponent;
  let fixture: ComponentFixture<CrenvComplianceprofileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrenvComplianceprofileComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrenvComplianceprofileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
