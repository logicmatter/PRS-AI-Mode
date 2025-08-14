import { TestBed } from '@angular/core/testing';

import { SearchUtilityService } from './search-utility.service';

describe('SearchUtilityService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SearchUtilityService = TestBed.get(SearchUtilityService);
    expect(service).toBeTruthy();
  });
});
