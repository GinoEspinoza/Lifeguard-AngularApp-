import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LockService } from '../device-creation/locks/lock.service';
import { DeviceUserService } from '../device-creation/device-user/device-user.service';
import { AlertService, LocalMqttService } from '../services';
import { IMqttMessage } from 'ngx-mqtt';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  EVENTS_LIST
} from './events-constant';
@Component({
  selector: 'app-event-show',
  templateUrl: './event-show.component.html',
  styleUrls: ['./event-show.component.css']
})
export class EventShowComponent implements OnInit {
  deviceUsersList:any;
  lock:any
  deviceData: any;
  subscription:any;
  subscription_event:any;
  message:any;
  mqttData:any;
  mqttData_count:any;
  events = [];
  events_count;
  seq_number:any;
  page_size = 5;
  event_no = 5;
  current_page;
  clientId = '_' + Math.floor(Math.random()*1E16);
  interval;
  interval_events;
  stop_interval = false;
  connecting = true;
  constructor(
    private route: ActivatedRoute,
    private lockService: LockService,
    private router: Router,
    private deviceUserService: DeviceUserService,
    private localMqttService: LocalMqttService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.getLock(id);
    this.subscription = this.localMqttService.observe('device/neosoft').subscribe();
    this.subscription_event = this.localMqttService.observe('device/neosoft').subscribe();
    this.events = [];
    this.page_size = 5;
    this.current_page = 1;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.subscription_event.unsubscribe();
  }

  getLock(id){
    this.lockService.getLock(id).subscribe(
      response => { this.onSuccessGetLock(response); },
      error => { this.OnErrorGetLock(error); }
    );
  }

  getEvents() {
    if(this.seq_number <= 0){
      this.seq_number = 1;
    }
    let message = this.getMqttInput("events")
    let companyName = this.lock.company.channel_name.toLowerCase();
    this.subscription_event.unsubscribe();
    this.subscription.unsubscribe();
    this.subscription_event = this.subscribeMQTTChannel(companyName);
    this.localMqttService.unsafePublish(`web/${companyName}`, message);

  }
  getEventsCount(){
    this.connecting = true;
    this.stop_interval = false;
    let message = this.getMqttInput("events_count")
    let companyName = this.lock.company.channel_name.toLowerCase();
    this.subscription.unsubscribe();
    this.subscription_event.unsubscribe();
    this.subscription = this.subscribeCountMQTTChannel(companyName);
    this.localMqttService.unsafePublish(`web/${companyName}`, message);

    let intervalCounter = 0;
    this.interval = setInterval(()=> {
      intervalCounter = intervalCounter + 1;
      this.alertService.clearAlert();
      if (this.mqttData_count && !this.stop_interval) {
        clearInterval(this.interval);
        // hub.backdoor = this.mqttData['status'] == 'start' ? 'Stop' : 'Start';
        if (this.clientId == this.mqttData_count['client-id'] && this.mqttData_count["seq-number"] >= 0) {
          
          this.connecting = false;
          this.events_count = parseInt(this.mqttData_count["seq-number"]);
          if(this.events_count){
            this.current_page = 1;
            this.seq_number = this.events_count - this.page_size + 1;
            this.getEvents();
            this.stop_interval = true;
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
    if(cmd == 'events'){
      userInput += '|' + this.seq_number + '|' + this.event_no;
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
      }else{
        if(this.mqttData["events"]){
          if(Array.isArray(this.mqttData["events"])){
            this.events = this.mqttData["events"];
          }else{
            this.events.push(this.mqttData["events"]);
          }
        }
        if(this.events.length){
          this.events.reverse();
          this.events.forEach((item) => {
            let time = new Date("2019-01-01 "+item['time']);
            let formatted_time = this.appendLeadingZeroes(time.getHours()) + ":" + this.appendLeadingZeroes(time.getMinutes()) + ":" + this.appendLeadingZeroes(time.getSeconds())
            item['time'] = formatted_time;
          });
        }
      }
    })
  }
  appendLeadingZeroes(n){
    if(n <= 9){
      return "0" + n;
    }
    return n
  }
  onSuccessGetLock(response){
    this.lock = response.data;
    this.getDeviceUsers({company_id:this.lock.company.id , per_page:-1});
    this.getEventsCount();
  }

  OnErrorGetLock(error){
    this.alertService.error(error['error']['message']);
  }

  pageChanged(page){
    this.event_no = this.page_size;
    let pages = Math.floor(this.events_count / this.page_size);
    let rest = this.events_count % this.page_size;
    this.seq_number = (pages-page) * this.page_size + rest + 1;
    if(this.seq_number <= 0){
      this.seq_number = 1;
      this.event_no = rest;
    }
    this.getEvents();
  }
  reloadPage(){
    this.events = [];
    this.page_size = 5;
    this.current_page = 1;
    this.events_count = 0;
    this.getEventsCount();
  }
  reloadView(){
    this.events = [];
    this.getEvents();
  }
  getEventDescription(event_id){
    return EVENTS_LIST[event_id][0];
  }
  getEventType(event_id){
    return EVENTS_LIST[event_id][1];
  }
  getEventUserName(user_id){
    if(user_id > 0){
      if(this.deviceUsersList){
        let device_user = this.deviceUsersList.filter(x => x.device_user_id == user_id);
        if(device_user.length > 0){
          return device_user[0].device_user_fname + " " + device_user[0].device_user_lname;
        }
      }
      return "";
    }
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
