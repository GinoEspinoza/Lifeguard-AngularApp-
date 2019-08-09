import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficeShowComponent } from './office-show.component';

describe('OfficeShowComponent', () => {
  let component: OfficeShowComponent;
  let fixture: ComponentFixture<OfficeShowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OfficeShowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OfficeShowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
