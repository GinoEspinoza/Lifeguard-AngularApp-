import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { MqttService, IMqttMessage, IMqttServiceOptions } from 'ngx-mqtt';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';

@Injectable({
  providedIn: 'root'
})

export class LocalMqttService {
  private subscription: Subscription;
  public message: string;

  constructor(
    private _mqttService : MqttService,
    private spinnerService: Ng4LoadingSpinnerService
  ) { }


  public observe(topic:string){
    return this._mqttService.observe(topic).
    map((message: IMqttMessage) => {
      this.spinnerService.hide();
      this.message = message.payload.toString();
      return message;
    });
  }
  public observe1(topic:string){
    return this._mqttService.observe(topic).
    map((message: IMqttMessage) => {
      this.message = message.payload.toString();
      return message;
    });
  }
  public createUser(topic: string, message: string): void {
    this._mqttService.unsafePublish(topic, message.toString(), {qos: 1, retain: true});
  }

  public deleteUser(topic: string, message: string): void {
    this._mqttService.unsafePublish(topic, message.toString(), {qos: 1, retain: true});
  }

  public publish(topic: string, message: string): void {
    this.spinnerService.show();
    this._mqttService.publish(topic, message, {qos: 0, retain: false});
  }

  public unsafePublish(topic: string, message: string): void {
    this.spinnerService.show();
    this._mqttService.unsafePublish(topic, message, {qos: 0, retain: false});
  }
  public unsafePublishWithoutSpinner(topic: string, message: string): void {
    this._mqttService.unsafePublish(topic, message, {qos: 0, retain: false});
  }
  public parseError(responseCode) {
    let message:string = '';
    console.log(responseCode);
    switch(responseCode) {
      case 8: {
        message = "Card already assigned to another user.";
        break;
      }
      case 13: {
        message = "The device user id not found.";
        break;
      }
      case 18: {
        message = 'The pin has already been taken.';
        break;
      }
      case 21: {
        message = 'The ref device user id has already been taken.';
        break;
      }
      default: {
        message = "Sorry, we were unable to process your request. Please try again later or contact support."
        break;
      }
    }
    return message;
  }

}
