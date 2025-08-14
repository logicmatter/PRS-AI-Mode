import { TestBed } from '@angular/core/testing';

import { LookupServiceService } from './lookup-service.service';

describe('LookupServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LookupServiceService = TestBed.get(LookupServiceService);
    expect(service).toBeTruthy();
  });
});
