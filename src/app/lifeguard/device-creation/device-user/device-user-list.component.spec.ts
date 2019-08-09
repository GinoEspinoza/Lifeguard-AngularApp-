import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceUserListComponent } from './device-user-list.component';

describe('DeviceUserListComponent', () => {
  let component: DeviceUserListComponent;
  let fixture: ComponentFixture<DeviceUserListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceUserListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceUserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
