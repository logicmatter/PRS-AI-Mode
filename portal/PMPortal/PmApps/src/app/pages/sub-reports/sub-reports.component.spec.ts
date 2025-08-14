import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubReportsComponent } from './sub-reports.component';
import { TenantService } from 'src/app/PmCore/services';

describe('SubReportsComponent', () => {
  let component: SubReportsComponent;
  let fixture: ComponentFixture<SubReportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubReportsComponent ],
      providers: [TenantService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  
});
