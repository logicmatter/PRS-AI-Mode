import { TestBed } from '@angular/core/testing';

import { AdhocReportutilityService } from './adhoc-reportutility.service';

describe('AdhocReportutilityService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AdhocReportutilityService = TestBed.get(AdhocReportutilityService);
    expect(service).toBeTruthy();
  });
});
