import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrendlogComponent } from './trendlog.component';

describe('TrendlogComponent', () => {
  let component: TrendlogComponent;
  let fixture: ComponentFixture<TrendlogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrendlogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrendlogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
