import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrenvFacetComponent } from './crenv-facet.component';

describe('CrenvFacetComponent', () => {
  let component: CrenvFacetComponent;
  let fixture: ComponentFixture<CrenvFacetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrenvFacetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrenvFacetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
