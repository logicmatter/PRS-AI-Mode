import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppParametersComponent } from './app-parameters.component';

describe('AppParametersComponent', () => {
  let component: AppParametersComponent;
  let fixture: ComponentFixture<AppParametersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppParametersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppParametersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
