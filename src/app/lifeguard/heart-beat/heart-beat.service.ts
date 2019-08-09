import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { LocalMqttService } from './../services';
import { MqttService, IMqttMessage } from 'ngx-mqtt';
import { Subscription, Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeartBeatService {
  subscription:any;
  message:any;
  mqttData:any;
  hubKeys = {};
  hubList = [];
  clientId = '_' + Math.floor(Math.random()*1E16);
  timestamp = Date.now();

  private subject = new Subject<any>();
  beatObserver$ = this.subject.asObservable();

  constructor(
    private _mqttService: MqttService,
    private localMqttService: LocalMqttService,
  ) { }

  ngOnDestroy() {
    this.heartBeatDestroy();
  }

  heartBeatInit(company: string="#") {
    this.subscription = this.subscribeMQTTChannel(company);
  }

  heartBeatDestroy() {
    this.subscription.unsubscribe();
  }

  subscribeMQTTChannel(company: string){
    return this.localMqttService.observe(`hb/${company}`)
    .subscribe((message: IMqttMessage) => {
      this.message = message.payload.toString();
      // this.mqttData = JSON.parse(this.message);
      this.mqttData = this.message;
      let hub = this.processHeartBeats(this.mqttData)
      this.hubKeys[hub.mac] = hub;
      this.subject.next(hub);
      // for (let key in this.hubKeys) {
      //   this.hubList.push(this.hubKeys[key]);
      // }
      // console.log('received::', this.hubList);
    })
  }

  processHeartBeats(data: any) {
    let attrs = data.split('|')
    if (attrs[0] == 'lock') {
      return {
        type: attrs[0],
        channel: attrs[1],
        office: attrs[2],
        zone: attrs[3],
        lockName: attrs[4],
        ip: attrs[5],
        timestamp: attrs[7],
      }
    }
    else {
      return {
        type: attrs[0],
        timestamp: attrs[1],
        mac: attrs[2],
        ip: attrs[3],
        channel: attrs[4]
      }
    }
  }

}
