import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ZonesFormComponent } from './form.component';

describe('ZonesFormComponent', () => {
  let component: ZonesFormComponent;
  let fixture: ComponentFixture<ZonesFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ZonesFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ZonesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
