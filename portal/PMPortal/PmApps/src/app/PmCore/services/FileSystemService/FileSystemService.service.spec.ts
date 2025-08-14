import { TestBed } from '@angular/core/testing';

import { FileSystemServiceService } from './FileSystemService.service';

describe('FileSystemServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FileSystemServiceService = TestBed.get(FileSystemServiceService);
    expect(service).toBeTruthy();
  });
});
