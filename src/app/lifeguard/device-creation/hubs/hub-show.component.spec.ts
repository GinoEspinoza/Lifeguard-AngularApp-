import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LockShowComponent } from './lock-show.component';

describe('LockShowComponent', () => {
  let component: LockShowComponent;
  let fixture: ComponentFixture<LockShowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LockShowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LockShowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
