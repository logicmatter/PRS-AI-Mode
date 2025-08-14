import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RptResolutionsComponent } from './rpt-resolutions.component';

describe('RptResolutionsComponent', () => {
  let component: RptResolutionsComponent;
  let fixture: ComponentFixture<RptResolutionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RptResolutionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RptResolutionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
