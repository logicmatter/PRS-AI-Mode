import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EndDateTimeComponent } from './end-date-time.component';

describe('EndDateTimeComponent', () => {
  let component: EndDateTimeComponent;
  let fixture: ComponentFixture<EndDateTimeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EndDateTimeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EndDateTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
