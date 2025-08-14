import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CREnvViewRptComponent } from '../../../../AppCrEnv/src/app/crenv-view-rpt/crenv-view-rpt.component';

describe('CREnvViewRptComponent', () => {
  let component: CREnvViewRptComponent;
  let fixture: ComponentFixture<CREnvViewRptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CREnvViewRptComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CREnvViewRptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
