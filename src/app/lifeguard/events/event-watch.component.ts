import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LockService } from '../device-creation/locks/lock.service';
import { AlertService, LocalMqttService } from '../services';
import { DeviceUserService } from '../device-creation/device-user/device-user.service';
import { IMqttMessage } from 'ngx-mqtt';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  EVENTS_LIST
} from './events-constant';
@Component({
  selector: 'app-event-watch',
  templateUrl: './event-watch.component.html',
  styleUrls: ['./event-watch.component.css']
})
export class EventWatchComponent implements OnInit {
  deviceUsersList:any;
  lock:any;
  interval;
  deviceData: any;
  subscription:any;
  subscription_events:any;
  message:any;
  mqttData:any;
  mqttData_count:any;
  new_events = [];
  events = [];
  events_count;
  connecting = true;
  recording = false;
  new_events_count = 0;
  clientId = '_' + Math.floor(Math.random()*1E16);
  stop_timer = false;

  constructor(
    private route: ActivatedRoute,
    private lockService: LockService,
    private deviceUserService: DeviceUserService,
    private router: Router,
    private localMqttService: LocalMqttService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.getLock(id);
    this.subscription = this.localMqttService.observe('device/neosoft').subscribe();
    this.subscription_events = this.localMqttService.observe('device/neosoft').subscribe();
    this.events = [];
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.subscription_events.unsubscribe();
    this.stop_timer = true;
  }

  getLock(id){
    this.lockService.getLock(id).subscribe(
      response => { this.onSuccessGetLock(response); },
      error => { this.OnErrorGetLock(error); }
    );
  }

  getRealTimeEvents() {
    let message = this.getMqttInput("real_events")
    console.log(message);
    let companyName = this.lock.company.channel_name.toLowerCase();
    this.subscription_events.unsubscribe();
    this.subscription.unsubscribe();
    this.subscription_events = this.subscribeMQTTChannel(companyName);
    this.localMqttService.unsafePublishWithoutSpinner(`web/${companyName}`, message);
    this.beginRecord();
  }
  getEventsCount(){
    let message = this.getMqttInput("events_count")
    let companyName = this.lock.company.channel_name.toLowerCase();
    this.subscription.unsubscribe();
    this.subscription_events.unsubscribe();
    this.subscription = this.subscribeCountMQTTChannel(companyName);
    this.localMqttService.unsafePublish(`web/${companyName}`, message);

    let intervalCounter = 0;
    this.interval = setInterval(()=> {
      intervalCounter = intervalCounter + 1;
      this.alertService.clearAlert();
      if (this.mqttData_count) {
        // hub.backdoor = this.mqttData['status'] == 'start' ? 'Stop' : 'Start';
        if (this.clientId == this.mqttData_count['client-id'] && this.mqttData_count["seq-number"] >= 0) {
          clearInterval(this.interval);
          this.connecting = false;
          this.recording = true;

          this.events_count = parseInt(this.mqttData_count["seq-number"]);
          if(this.events_count){
            this.beginRecord();
          }
        }
      } else if (intervalCounter == 10) {
        clearInterval(this.interval);
        this.alertService.error('Sorry, we were unable to connect to the device.Please reload.')
      }
    }, 1000);
  }
  getMqttInput(cmd:any){
    let userInput : string;
    let company = this.lock.company.channel_name;
    let office = this.lock.office.name;
    let zone = this.lock.zone.name;
    let device = this.lock.device_name;
    let timestamp = Date.now();
    userInput = this.clientId + '|' + company + '|' + office + '|' + zone + '|' + device + '|'+cmd+'|' + this.lock.ip + '|' + timestamp;
    if(cmd == 'real_events'){
      userInput += '|' + this.events_count;
    }

    return userInput.toLowerCase();
  }
  subscribeCountMQTTChannel(company: string){
    return this.localMqttService.observe(`device/${company}`)
    .subscribe((message: IMqttMessage) => {
      this.message = message.payload.toString();
      this.mqttData_count = JSON.parse(this.message);
      if (this.clientId != this.mqttData_count['client-id']){
        return
      }
      if (this.mqttData_count["response-code"]) {
        this.mqttData_count = false;
        this.alertService.error("Sorry, we were unable to get the events. Please contact support.");
      }
    })
  }
  subscribeMQTTChannel(company: string){
    return this.localMqttService.observe(`device/${company}`)
    .subscribe((message: IMqttMessage) => {
      this.message = message.payload.toString();
      this.mqttData = JSON.parse(this.message);
      if (this.clientId != this.mqttData['client-id']){
        return
      }
      if (this.mqttData["response-code"]) {
        this.mqttData = false;
        this.alertService.error("Sorry, we were unable to get the events. Please contact support.");
      }else if(this.mqttData["new_event"] == 1 && this.events_count < this.mqttData["count"]){
        let event_array = this.mqttData["events"];
        if(event_array){
          if(Array.isArray(event_array)){
            event_array.forEach((item)=>{
              this.new_events.push(item);
            })
          }else{
            this.new_events.push(event_array);
          }
        }
        this.new_events_count = this.new_events.length;
        this.events_count = this.mqttData["count"];
      }
    })
  }

  onSuccessGetLock(response){
    this.lock = response.data;
    this.getDeviceUsers({company_id:this.lock.company.id , per_page:-1});
    this.getEventsCount();
  }

  OnErrorGetLock(error){
    this.alertService.error(error['error']['message']);
  }

  reloadPage(){
    this.events = [];
    this.events_count = 0;
    this.connecting = true;
    this.recording = false;
    this.getEventsCount();
  }
  getEventDescription(event_id){
    return EVENTS_LIST[event_id][0];
  }
  getEventType(event_id){
    return EVENTS_LIST[event_id][1];
  }
  getEventUserName(user_id){
    if(user_id > 0){
      let device_user = this.deviceUsersList.filter(x => x.device_user_id == user_id);
      if(device_user.length > 0){
        return device_user[0].device_user_fname + " " + device_user[0].device_user_lname;
      }
      return "";
    }
  }
  beginRecord(){
    if(!this.stop_timer){
      setTimeout(() => {
        this.getRealTimeEvents();
      }, 1000*10);
    }
  }
  showNewEvents(){
    this.new_events.forEach((item)=>{
      this.events.unshift(item);
    })
    this.new_events = [];
    this.new_events_count = 0;
  }
  getDeviceUsers(params){
    this.deviceUserService.getDeviceUsers(params).subscribe(
      response => { this.onSucessGetDeviceUsers(response); },
      error => { this.onErrorGetDeviceUser(error); }
    );
  }
  onSucessGetDeviceUsers(response){
    this.deviceUsersList = response.data;
  }

  onErrorGetDeviceUser(error){
    this.alertService.error(error['error']['message']);
  }
  onExport(){
    if(this.events.length == 0){
      this.alertService.error("Sorry , No events to export");
    }else{
      this.savePDF();
    }
  }
  savePDF() {
		var doc = new jsPDF();
		let tableBody = [];
		this.events.forEach(event => {
			let row = [];
			row.push(event['event-id']);
			row.push(this.getEventDescription(event['event-id']));
			row.push(this.getEventUserName(event['detail-1']));
			row.push(this.getEventType(event['event-id']));
			row.push(event['date']);
			row.push(event['time']);
			tableBody.push(row);
		});
		doc.autoTable({
			head: [['ID', 'Name', 'User', 'Type', 'Date','Time']],
			body: tableBody
		});
		doc.save('events.pdf');
	}
}
