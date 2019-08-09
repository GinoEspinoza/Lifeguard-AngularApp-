import { Component, OnInit } from '@angular/core';
import { AlertService, LocalMqttService } from './../services';
import { MqttService, IMqttMessage } from 'ngx-mqtt';

@Component({
  selector: 'app-heart-beat',
  templateUrl: './heart-beat.component.html',
  styleUrls: ['./heart-beat.component.css'],
})
export class HeartBeatComponent implements OnInit {

  subscription:any;
  message:any;
  mqttData:any;
  hubKeys = {};
  hubList = [];
  clientId = '_' + Math.floor(Math.random()*1E16);
  timestamp = Date.now();
  constructor(
    private alertService: AlertService,
    private _mqttService: MqttService,
    private localMqttService: LocalMqttService,
  ) { }

  ngOnInit() {
    this.subscription = this.subscribeMQTTChannel('dasi');
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  subscribeMQTTChannel(company: string){
    return this.localMqttService.observe(`hb/#`)
    .subscribe((message: IMqttMessage) => {
      this.hubList = [];
      this.message = message.payload.toString();
      // this.mqttData = JSON.parse(this.message);
      console.log(this.message);
      this.mqttData = this.message;
      let hub = this.processHeartBeats(this.mqttData);
      if (hub) {
        this.hubKeys[hub.mac] = hub;
      }
      for (let key in this.hubKeys) {
        this.hubList.push(this.hubKeys[key]);
      }
    })
  }

  processHeartBeats(data: any) {
    let attrs = data.split('|')
    if (attrs[0] !== 'hub') {
      return null;
    }
    return {
      type: attrs[0],
      timestamp: attrs[1],
      mac: attrs[2],
      ip: attrs[3],
      channel: attrs[4]
    }
  }

  status(hub) {
    let timestamp:any = new Date(hub.timestamp + ' UTC');
    let now:any = new Date((new Date()).toUTCString());
    let diff = Math.abs(timestamp - now);
    diff = Math.floor((diff/1000)/60);
    if(diff > 1){
      return 'Offline';
    } else {
      return 'Online';
    }
  }

}
