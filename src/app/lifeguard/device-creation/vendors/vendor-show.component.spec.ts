import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyShowComponent } from './company-show.component';

describe('CompanyShowComponent', () => {
  let component: CompanyShowComponent;
  let fixture: ComponentFixture<CompanyShowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompanyShowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanyShowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
