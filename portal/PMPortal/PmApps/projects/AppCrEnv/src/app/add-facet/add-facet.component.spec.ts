import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFacetComponent } from './add-facet.component';

describe('AddFacetComponent', () => {
  let component: AddFacetComponent;
  let fixture: ComponentFixture<AddFacetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddFacetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddFacetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
