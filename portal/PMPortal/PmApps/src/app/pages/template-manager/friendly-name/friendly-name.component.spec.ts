import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FriendlyNameComponent } from './friendly-name.component';

describe('FriendlyNameComponent', () => {
  let component: FriendlyNameComponent;
  let fixture: ComponentFixture<FriendlyNameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FriendlyNameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FriendlyNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
