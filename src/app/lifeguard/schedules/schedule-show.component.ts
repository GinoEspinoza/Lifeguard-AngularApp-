import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ScheduleService } from './schedule.service';
import { AlertService ,LocalMqttService } from '../services';
import { WEEK_DAYS , FULL_WEEK_DAYS } from '../constants/schedule.constant';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { IMqttMessage } from 'ngx-mqtt';
@Component({
  selector: 'app-schedule-show',
  templateUrl: './schedule-show.component.html',
  styleUrls: []
})

export class ScheduleShowComponent implements OnInit {
  schedule:any;
  vendorData: any;
  userShow = false;
  weekDays = FULL_WEEK_DAYS;
  clientId = '_' + Math.floor(Math.random()*1E16);
  mqttData:any;
	stop_interval = false;
  message:any;
  subscription:any;
  interval;
  
  constructor(
    private route: ActivatedRoute,
    private scheduleService: ScheduleService,
    private router: Router,
    private alertService: AlertService,
		private localMqttService: LocalMqttService,
		private spinnerService: Ng4LoadingSpinnerService
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.getSchedule(id);
    this.subscription = this.localMqttService.observe('device/neosoft').subscribe();
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  getSchedule(id){
    this.scheduleService.showSchedule(id).subscribe(response => {
      this.onSuccessGetSchedule(response); },
    error => { this.OnErrorGetSchedule(error); }
    );
  }

  getStatus() {
    if (this.schedule.status == 0) {
      return 'In Active'
    } else if (this.schedule.status == 1) {
      return 'Active'
    } else if (this.schedule.status == 2) {
      return 'Archived'
    }
  }

  onSuccessGetSchedule(response){
    this.schedule = response.data;
  }

  OnErrorGetSchedule(error){
    this.alertService.error(error['error']['message']);
  }
  getDeleteMqttInput(schedule,cmd:any){
    let userInput : string;
    let company = schedule.company.channel_name;
    userInput = this.clientId + '|' + company + '|' + 1 + '|' + schedule.id + '|' + 1 + '|'+cmd+'|';
    return userInput.toLowerCase();
  }
  subscribeMQTTChannel(company: string){
    return this.localMqttService.observe1(`device/${company}`)
    .subscribe((message: IMqttMessage) => {
      this.message = message.payload.toString();
			this.mqttData = JSON.parse(this.message);
			console.log("mqtt",this.mqttData);
      if (this.clientId != this.mqttData['client-id']){
        return
      }
      if (this.mqttData["response-code"]) {
        this.mqttData = false;
        this.alertService.error("Sorry, we were unable to connect to the hub.");
      }
    })
  }
  deleteSchedule(schedule){
    this.mqttData = null;
		this.stop_interval = false;
		let message = this.getDeleteMqttInput(schedule,"delschedule");
		console.log(message);
    let companyName = this.schedule.company.channel_name.toLowerCase();
    this.subscription.unsubscribe();
    this.subscription = this.subscribeMQTTChannel(companyName);
		this.localMqttService.unsafePublishWithoutSpinner(`web/${companyName}`, message);
		this.spinnerService.show();

		let intervalCounter = 0;
    this.interval = setInterval(()=> {
      intervalCounter = intervalCounter + 1;
      this.alertService.clearAlert();
      if (this.mqttData && !this.stop_interval) {
				clearInterval(this.interval);
        if (this.clientId == this.mqttData['client-id'] && this.mqttData["result"] == 1 && this.mqttData["cmd"] == "delschedule") {
					this.spinnerService.hide();
					console.log("DeleteSchedule",this.mqttData);
					this.scheduleService.delete(schedule.id).subscribe(response => {
            this.onSuccessDeleteSchedule(response); },
            error => { this.OnErrorGetSchedule(error); }
          );
					this.stop_interval = true;
        }
        else if(this.clientId == this.mqttData['client-id'] && this.mqttData["result"] == 0 && this.mqttData["cmd"] == "delschedule"){
					clearInterval(this.interval);
					this.spinnerService.hide();
					this.alertService.error('Sorry, we were unable to connect to the device.Please try again.')
				}
      } else if (intervalCounter == 15) {
				clearInterval(this.interval);
				this.spinnerService.hide();
        this.alertService.error('Sorry, we were unable to connect to the hub.Please try again.')
      }
    }, 1000);
  }

  onSuccessDeleteSchedule(response){
    this.alertService.success(response['message'])
    this.router.navigate(['/lifeguard/schedules']);
  }
  onShowUser(){
    this.userShow = true;
  }
  getWeekdayLabels(weekdays){
    weekdays = weekdays.split(",");
    let label = ""
    for(let i =0 ;i<7 ;i++){
      if(weekdays[i] == 1){
        label += "<span class='badge badge-info mr-10'>"+this.weekDays[i].name+"</span>";
      }
    }
    return label;
  }
}
