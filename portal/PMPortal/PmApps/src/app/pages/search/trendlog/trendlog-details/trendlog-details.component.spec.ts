import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrendlogDetailsComponent } from './trendlog-details.component';

describe('TrendlogDetailsComponent', () => {
  let component: TrendlogDetailsComponent;
  let fixture: ComponentFixture<TrendlogDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrendlogDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrendlogDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
