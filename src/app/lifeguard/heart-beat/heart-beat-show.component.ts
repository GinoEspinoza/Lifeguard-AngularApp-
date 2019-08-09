import { Component, OnInit } from '@angular/core';
import { AlertService, LocalMqttService } from './../services';
import { MqttService, IMqttMessage } from 'ngx-mqtt';
import { HeartBeatService } from './heart-beat.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-heart-beat-show',
  templateUrl: './heart-beat-show.component.html',
})
export class HeartBeatShowComponent implements OnInit {

  subscription:any;
  message:any;
  mqttData:any;
  lockKeys = {};
  locksList = [];
  clientId = '_' + Math.floor(Math.random()*1E16);
  timestamp = Date.now();
  constructor(
    private alertService: AlertService,
    private route: ActivatedRoute,
    private _mqttService: MqttService,
    private localMqttService: LocalMqttService,
    private heartBeatService: HeartBeatService,
  ) { }

  ngOnInit() {
    const channel = this.route.snapshot.paramMap.get('channel');
    // this.subscription = this.subscribeMQTTChannel('neosoft');
    this.subscribeHeartbeat(channel)
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  subscribeHeartbeat(channel) {
    let topic = channel;
      console.log(topic)

    this.heartBeatService.heartBeatInit(topic);
    this.subscription = this.heartBeatService.beatObserver$.subscribe( (beat) => {
      this.locksList = [];
      if (beat) {
        this.lockKeys[beat['office']+beat['ip']] = beat
      }
      for (let key in this.lockKeys) {
        this.locksList.push(this.lockKeys[key]);
      }
      console.log(this.locksList.length)
    });
  }

  getStatusIcon(lock) {
    let status = this.getLiveStatus(lock);
    if (status == 'Online') {
      return 'fa-circle text-success';
    } else if(status == 'Offline') {
      return 'fa-circle text-warning';
    } else {
      return 'fa-refresh text-muted';
    }
  }

  getLiveStatus(lock) {
    if (!lock.timestamp) {
      return null;
    }
    let timestamp:any = new Date(lock.timestamp + ' UTC');
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
