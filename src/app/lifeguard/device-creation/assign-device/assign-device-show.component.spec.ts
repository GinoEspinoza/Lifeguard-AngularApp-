import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignDeviceShowComponent } from './assign-device-show.component';

describe('AssignDeviceShowComponent', () => {
  let component: AssignDeviceShowComponent;
  let fixture: ComponentFixture<AssignDeviceShowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignDeviceShowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignDeviceShowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
