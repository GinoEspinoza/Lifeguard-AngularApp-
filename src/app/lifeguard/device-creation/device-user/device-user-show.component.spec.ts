import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceUserShowComponent } from './device-user-show.component';

describe('DeviceUserShowComponent', () => {
  let component: DeviceUserShowComponent;
  let fixture: ComponentFixture<DeviceUserShowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceUserShowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceUserShowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
