import { TestBed } from '@angular/core/testing';

import { BookmarkServiceService } from './BookMarkService.service';

describe('BookmarkServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BookmarkServiceService = TestBed.get(BookmarkServiceService);
    expect(service).toBeTruthy();
  });
});
