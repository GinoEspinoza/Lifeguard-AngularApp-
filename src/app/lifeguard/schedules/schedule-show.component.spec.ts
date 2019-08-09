import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleShowComponent } from './schedule-show.component';

describe('CompanyShowComponent', () => {
  let component: ScheduleShowComponent;
  let fixture: ComponentFixture<ScheduleShowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScheduleShowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduleShowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
