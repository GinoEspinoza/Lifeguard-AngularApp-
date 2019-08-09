import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { MqttService, IMqttMessage, IMqttServiceOptions } from 'ngx-mqtt';
var mqtt = require('mqtt')
@Injectable({
  providedIn: 'root'
})

export class WssConnectionService {
//   private subscription: Subscription;
  public message: string;

  mqttOption: IMqttServiceOptions = {
    hostname: 'lifeguard.php-dev.in',
    port: 8888,
    path: '/'
  };

  clientId = '_' + Math.random().toString(16);

  options:any = {
    keepalive: 10,
    clientId: this.clientId,
    protocolId: 'MQTT',
    protocolVersion: 4,
    clean: true,
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000,
    will: {
      topic: 'WillMsg',
      payload: 'Connection Closed abnormally..!',
      qos: 0,
      retain: false
    },
    username: 'demo',
    password: 'demo',
    rejectUnauthorized: false
  }
  host = 'wss://lifeguard.php-dev.in:8888'

  private _mqttService = new MqttService(this.options);

//   client = this._mqttService.connect(this.options, this.host)

  constructor(
//    private _mqttService = new MqttService();
  ) { }

  public unsafePublish(topic: string, message: string): void {
    this._mqttService.unsafePublish(topic, message.toString(), {qos: 0, retain: true});
  }

  public publish(topic: string, message: string): void {
    this._mqttService.publish(topic, message, {qos: 0, retain: true});
  }

//   client.on('error', function (err) {
//     console.log(err)
//     client.end()
//   })

//   client.on('connect', function () {
//     console.log('client connected:' + clientId)
//   })

//   client.subscribe('topic', { qos: 0 })

}