import { TestBed, inject } from '@angular/core/testing';

import { DoorUnlockService } from './door-unlock.service';

describe('DoorUnlockService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DoorUnlockService]
    });
  });

  it('should be created', inject([DoorUnlockService], (service: DoorUnlockService) => {
    expect(service).toBeTruthy();
  }));
});
