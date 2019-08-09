import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceUserFormComponent } from './form.component';

describe('DeviceUserFormComponent', () => {
  let component: DeviceUserFormComponent;
  let fixture: ComponentFixture<DeviceUserFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceUserFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceUserFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
