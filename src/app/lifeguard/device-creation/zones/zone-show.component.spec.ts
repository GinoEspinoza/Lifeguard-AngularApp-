import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ZoneShowComponent } from './zone-show.component';

describe('ZoneShowComponent', () => {
  let component: ZoneShowComponent;
  let fixture: ComponentFixture<ZoneShowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ZoneShowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ZoneShowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
