import { async, ComponentFixture, TestBed } from '@angular/core/testing';

//import { CREnvCommonParamsComponent } from './crenv-common-params.component';

import { CREnvCommonParamsComponent } from 'projects/AppCrEnv/src/app/crenv-common-params/crenv-common-params.component';

describe('CREnvCommonParamsComponent', () => {
  let component: CREnvCommonParamsComponent;
  let fixture: ComponentFixture<CREnvCommonParamsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CREnvCommonParamsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CREnvCommonParamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
