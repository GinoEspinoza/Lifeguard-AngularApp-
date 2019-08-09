import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubUserCreateComponent } from './user-create.component';

describe('UserCreateComponent', () => {
  let component: SubUserCreateComponent;
  let fixture: ComponentFixture<SubUserCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubUserCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubUserCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
