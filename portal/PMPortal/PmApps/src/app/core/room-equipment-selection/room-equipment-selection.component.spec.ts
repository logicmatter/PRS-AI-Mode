import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomEquipmentSelectionComponent } from './room-equipment-selection.component';

describe('RoomEquipmentSelectionComponent', () => {
  let component: RoomEquipmentSelectionComponent;
  let fixture: ComponentFixture<RoomEquipmentSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoomEquipmentSelectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomEquipmentSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
