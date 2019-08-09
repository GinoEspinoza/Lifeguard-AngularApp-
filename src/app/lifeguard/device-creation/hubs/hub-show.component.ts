import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LockService } from '../locks/lock.service';
import { AlertService, LocalMqttService } from '../../services';
import { HeartBeatService } from '../../heart-beat/heart-beat.service';
import { IMqttMessage } from 'ngx-mqtt';

@Component({
  selector: 'app-hub-show',
  templateUrl: './hub-show.component.html',
  styleUrls: ['./hub-show.component.css']
})
export class HubShowComponent implements OnInit {

  hub:any
  locksList = [];
  deviceData: any;
  subscription:any;
  message:any;
  mqttData:any;
  clientId = '_' + Math.floor(Math.random()*1E16);

  constructor(
    private route: ActivatedRoute,
    private lockService: LockService,
    private router: Router,
    private localMqttService: LocalMqttService,
    private alertService: AlertService,
    private heartBeatService: HeartBeatService,
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.getHub(id);
    this.subscription = this.localMqttService.observe('device/neosoft').subscribe();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getHub(id){
    this.lockService.getLock(id).subscribe(
      response => { this.onSuccessGetHub(response); },
      error => { this.OnErrorGetHub(error); }
    );
  }

  getStatus() {
    if (this.hub.status == 0) {
      return 'In Active'
    } else if (this.hub.status == 1) {
      return 'Active'
    } else if (this.hub.status == 2) {
      return 'Archived'
    }
  }

  setStatus($event) {

  }

  onSuccessGetHub(response){
    this.hub = response.data;
    this.getLocks(this.hub.company_device.device.mac)
  }

  OnErrorGetHub(error){
    this.alertService.error(error['error']['message']);
  }

  deleteHub(hub){
    this.lockService.delete(hub.id).subscribe(
      response => { this.onSuccessDeleteHub(response); },
      error => { this.OnErrorGetHub(error); }
    );
  }

  onSuccessDeleteHub(response){
    this.router.navigate(['hubs']);
    this.alertService.success('Hub deleted successfully.');
  }

  getLocks(mac) {
    this.lockService.getHubLocks(mac).subscribe(
      response => { this.onSuccessGetLocks(response); },
      error => { this.OnErrorGetHub(error); }
    );
  }

  onSuccessGetLocks(response) {
    this.locksList = response.data;
    this.subscribeHeartbeat(this.hub.company.channel)
  }

  subscribeHeartbeat(channel) {
    let topic = channel;
    this.heartBeatService.heartBeatInit(topic);
    this.subscription = this.heartBeatService.beatObserver$.subscribe( (beat) => {
      this.locksList.filter( (lock) => {
        if(beat['type'] == 'lock' && lock.ip == beat['ip'] && lock.company.channel_name == beat['channel'] && lock.office.name.toLowerCase() == beat['office']) {
          lock.timestamp = beat['timestamp'];
        }
      })
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
