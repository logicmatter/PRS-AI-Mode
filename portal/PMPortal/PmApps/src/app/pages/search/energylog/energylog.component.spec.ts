import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnergylogComponent } from './energylog.component';

describe('EnergylogComponent', () => {
  let component: EnergylogComponent;
  let fixture: ComponentFixture<EnergylogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnergylogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnergylogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
