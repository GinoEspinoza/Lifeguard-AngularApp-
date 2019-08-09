import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignDeviceListComponent } from './assign-device-list.component';

describe('AssignDeviceListComponent', () => {
  let component: AssignDeviceListComponent;
  let fixture: ComponentFixture<AssignDeviceListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignDeviceListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignDeviceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
