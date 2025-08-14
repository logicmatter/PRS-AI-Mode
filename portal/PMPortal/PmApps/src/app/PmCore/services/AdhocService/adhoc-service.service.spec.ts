import { TestBed } from '@angular/core/testing';

import { AdhocServiceService } from './adhoc-service.service';

describe('AdhocServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AdhocServiceService = TestBed.get(AdhocServiceService);
    expect(service).toBeTruthy();
  });
});
