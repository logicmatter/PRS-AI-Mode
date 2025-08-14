import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddComplianceprofileComponent } from './add-complianceprofile.component';

describe('AddComplianceprofileComponent', () => {
  let component: AddComplianceprofileComponent;
  let fixture: ComponentFixture<AddComplianceprofileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddComplianceprofileComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddComplianceprofileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
