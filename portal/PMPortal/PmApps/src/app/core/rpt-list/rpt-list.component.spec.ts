import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RptListComponent } from './rpt-list.component';

describe('RptListComponent', () => {
  let component: RptListComponent;
  let fixture: ComponentFixture<RptListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RptListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RptListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
