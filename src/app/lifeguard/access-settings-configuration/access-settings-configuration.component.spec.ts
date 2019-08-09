import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessSettingsConfigurationComponent } from './access-settings-configuration.component';

describe('AccessSettingsConfigurationComponent', () => {
  let component: AccessSettingsConfigurationComponent;
  let fixture: ComponentFixture<AccessSettingsConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccessSettingsConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessSettingsConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
