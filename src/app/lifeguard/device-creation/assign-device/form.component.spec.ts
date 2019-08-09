import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignDeviceFormComponent } from './form.component';

describe('AssignDeviceFormComponent', () => {
  let component: AssignDeviceFormComponent;
  let fixture: ComponentFixture<AssignDeviceFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignDeviceFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignDeviceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
