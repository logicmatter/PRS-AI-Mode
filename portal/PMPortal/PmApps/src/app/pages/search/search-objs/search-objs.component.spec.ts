import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchObjsComponent } from './search-objs.component';

describe('SearchObjsComponent', () => {
  let component: SearchObjsComponent;
  let fixture: ComponentFixture<SearchObjsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchObjsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchObjsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
