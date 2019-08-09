import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LockService } from '../locks/lock.service';
import { AlertService, LocalMqttService } from '../../services';
import { IMqttMessage } from 'ngx-mqtt';
import * as moment from 'moment';
import 'moment-precise-range-plugin';

@Component({
  selector: 'app-camera-show',
  templateUrl: './camera-show.component.html',
  styleUrls: ['./camera-show.component.css']
})
export class CameraShowComponent implements OnInit {

  camera:any
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
    private alertService: AlertService
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.getCamera(id);
    this.subscription = this.localMqttService.observe('device/neosoft').subscribe();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getCamera(id){
    this.lockService.getLock(id).subscribe(
      response => { this.onSuccessGetCamera(response); },
      error => { this.OnErrorGetCamera(error); }
    );
  }

  getStatus() {
    if (this.camera.status == 0) {
      return 'In Active'
    } else if (this.camera.status == 1) {
      return 'Active'
    } else if (this.camera.status == 2) {
      return 'Archived'
    }
  }

  expiresIn() {
    if (this.camera.subscription_status == '0') {
      return 'Expired'
    }
    let endDate = moment(this.dateToLocal(this.camera.subscription_end).format('YYYY-MM-DD'))
    let expiry = endDate.diff(moment().format('YYYY-MM-DD'), 'days')
    if ( expiry < 0) {
      return 'Expired'
    } else if (expiry == 0){
      return 'Today'
    } else {
      return moment(moment().format('YYYY-MM-DD')).preciseDiff(endDate);
    }
  }

  dateToLocal(date){
    return moment.utc(date).local();
  }

  onSuccessGetCamera(response){
    this.camera = response.data;
  }

  OnErrorGetCamera(error){
    this.alertService.error(error['error']['message']);
  }

  deleteCamera(camera){
    this.lockService.delete(camera.id).subscribe(
      response => { this.onSuccessDeleteCamera(response); },
      error => { this.OnErrorGetCamera(error); }
    );
  }

  onSuccessDeleteCamera(response){
    this.router.navigate(['cameras']);
  }

}
