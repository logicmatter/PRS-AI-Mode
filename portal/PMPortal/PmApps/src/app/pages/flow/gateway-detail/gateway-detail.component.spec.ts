import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GatewayDetailComponent } from './gateway-detail.component';

describe('GatewayDetailComponent', () => {
  let component: GatewayDetailComponent;
  let fixture: ComponentFixture<GatewayDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GatewayDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GatewayDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
