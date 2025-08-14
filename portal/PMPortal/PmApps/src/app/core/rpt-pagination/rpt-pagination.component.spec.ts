import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RptPaginationComponent } from './rpt-pagination.component';

describe('RptPaginationComponent', () => {
  let component: RptPaginationComponent;
  let fixture: ComponentFixture<RptPaginationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RptPaginationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RptPaginationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
