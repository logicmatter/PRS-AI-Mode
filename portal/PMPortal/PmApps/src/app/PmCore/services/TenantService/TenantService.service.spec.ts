import { TestBed } from '@angular/core/testing';

import { TenantService } from './TenantService.service';

describe('TenantService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TenantService = TestBed.get(TenantService);
    expect(service).toBeTruthy();
  });
});
