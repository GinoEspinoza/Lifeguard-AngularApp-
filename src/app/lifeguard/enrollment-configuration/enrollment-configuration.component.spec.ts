import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnrollmentConfigurationComponent } from './enrollment-configuration.component';

describe('EnrollmentConfigurationFormComponent', () => {
  let component: EnrollmentConfigurationComponent;
  let fixture: ComponentFixture<EnrollmentConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnrollmentConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrollmentConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
