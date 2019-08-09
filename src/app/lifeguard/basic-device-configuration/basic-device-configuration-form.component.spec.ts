import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicDeviceConfigurationFormComponent } from './basic-device-configuration-form.component';

describe('BasicDeviceConfigurationFormComponent', () => {
  let component: BasicDeviceConfigurationFormComponent;
  let fixture: ComponentFixture<BasicDeviceConfigurationFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BasicDeviceConfigurationFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BasicDeviceConfigurationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
