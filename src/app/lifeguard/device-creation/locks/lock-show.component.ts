import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LockService } from './lock.service';
import { AlertService, LocalMqttService } from '../../services';
import { IMqttMessage } from 'ngx-mqtt';

@Component({
  selector: 'app-lock-show',
  templateUrl: './lock-show.component.html',
  styleUrls: ['./lock-show.component.css']
})
export class LockShowComponent implements OnInit {

  lock:any
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
    this.getLock(id);
    this.subscription = this.localMqttService.observe('device/neosoft').subscribe();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getLock(id){
    this.lockService.getLock(id).subscribe(
      response => { this.onSuccessGetLock(response); },
      error => { this.OnErrorGetLock(error); }
    );
  }

  getStatus() {
    if (this.lock.status == 0) {
      return 'In Active'
    } else if (this.lock.status == 1) {
      return 'Active'
    } else if (this.lock.status == 2) {
      return 'Archived'
    }
  }

  setStatus($event) {
    let message = this.getMqttInput($event)
    console.log(message);
    let companyName = this.lock.company.channel_name.toLowerCase();
    this.localMqttService.unsafePublish(`web/${companyName}`, message);
    this.subscription.unsubscribe();
    this.subscription = this.subscribeMQTTChannel(companyName);
  }

  getMqttInput(_status){
    let userInput : string;
    let company = this.lock.company.channel_name;
    let office = this.lock.office.name;
    let zone = this.lock.zone.name;
    let device = this.lock.device_name;
    let status = _status ? '1' : '0';
    let timestamp = Date.now();
    userInput = this.clientId + '|' + company + '|' + office + '|' + zone + '|' + device + '|setlockstate|' + status + '|' + this.lock.ip + '|' + timestamp;

    return userInput.toLowerCase();
  }

  subscribeMQTTChannel(company: string){
    return this.localMqttService.observe(`device/${company}`)
    .subscribe((message: IMqttMessage) => {
      this.message = message.payload.toString();
      this.mqttData = JSON.parse(this.message);
      if (this.clientId != this.mqttData['client-id']){
        return
      }
      if (this.mqttData["response-code"] != 0) {
        this.mqttData = false;
        this.alertService.error("Sorry, we were unable to add this lock at the moment. Please contact support.");
      }
      console.log(this.mqttData)
      this.lockService.updateState(this.lock).subscribe(
        response => {
          this.alertService.success('Lock status successfully changed.');
        },
        error => { this.OnErrorGetLock(error); }
      );
    })
  }

  onSuccessGetLock(response){
    this.lock = response.data;
  }

  OnErrorGetLock(error){
    this.alertService.error(error['error']['message']);
  }

  deleteLock(lock){
    this.lockService.delete(lock.id).subscribe(
      response => { this.onSuccessDeleteLock(response); },
      error => { this.OnErrorGetLock(error); }
    );
  }

  onSuccessDeleteLock(response){
    this.router.navigate(['locks']);
  }
  getTypeString(type) {
    if(type == 1)return "Normal";
    if(type == 2)return "Enrollment";
  }
}
