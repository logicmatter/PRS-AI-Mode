import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergyDetailsComponent } from './energy-details.component';

describe('EnergyDetailsComponent', () => {
  let component: EnergyDetailsComponent;
  let fixture: ComponentFixture<EnergyDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnergyDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnergyDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
