import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DoorUnlockComponent } from './door-unlock.component';

describe('DoorUnlockComponent', () => {
  let component: DoorUnlockComponent;
  let fixture: ComponentFixture<DoorUnlockComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DoorUnlockComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DoorUnlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
