import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupShowComponent } from './group-show.component';

describe('CompanyShowComponent', () => {
  let component: GroupShowComponent;
  let fixture: ComponentFixture<GroupShowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupShowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupShowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
