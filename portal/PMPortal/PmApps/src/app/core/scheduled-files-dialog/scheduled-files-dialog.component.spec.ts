import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduledFilesDialogComponent } from './scheduled-files-dialog.component';

describe('ScheduledFilesDialogComponent', () => {
  let component: ScheduledFilesDialogComponent;
  let fixture: ComponentFixture<ScheduledFilesDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScheduledFilesDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduledFilesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
