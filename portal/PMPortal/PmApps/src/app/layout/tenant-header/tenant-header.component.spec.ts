import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantHeaderComponent } from './tenant-header.component';

describe('TenantHeaderComponent', () => {
  let component: TenantHeaderComponent;
  let fixture: ComponentFixture<TenantHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TenantHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TenantHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
