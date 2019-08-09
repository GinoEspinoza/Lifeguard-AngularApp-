import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MqttCommunicationComponent } from './mqtt-communication.component';

describe('MqttCommunicationComponent', () => {
  let component: MqttCommunicationComponent;
  let fixture: ComponentFixture<MqttCommunicationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MqttCommunicationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MqttCommunicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
