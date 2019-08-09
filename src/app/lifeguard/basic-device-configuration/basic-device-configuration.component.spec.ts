import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicDeviceConfigurationComponent } from './basic-device-configuration.component';

describe('BasicDeviceConfigurationComponent', () => {
  let component: BasicDeviceConfigurationComponent;
  let fixture: ComponentFixture<BasicDeviceConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BasicDeviceConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BasicDeviceConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
