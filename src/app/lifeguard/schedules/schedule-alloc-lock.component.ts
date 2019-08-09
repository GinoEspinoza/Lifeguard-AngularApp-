import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ScheduleService } from './schedule.service';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl, ValidatorFn  } from '@angular/forms';
import { USER_DROPDOWN_SETINGS } from './../constants/drop-down.constants';
import { DeviceUserService } from '../device-creation/device-user/device-user.service';
import { LockService } from '../device-creation/locks/lock.service';
import { WEEK_DAYS , FULL_WEEK_DAYS } from '../constants/schedule.constant';
import { AlertService, LocalMqttService } from '../services';
import { IMqttMessage } from 'ngx-mqtt';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
@Component({
  selector: 'app-schedule-alloc-lock',
  templateUrl: './schedule-alloc-lock.component.html',
  styleUrls: ['./schedule-alloc-lock.component.css']
})

export class ScheduleAllocLockComponent implements OnInit {
	
	schedule:any;
	scheduleID = 0;
	deviceUsersDDList = [];
	deviceUserDDSetting = USER_DROPDOWN_SETINGS;
	allLocks = [];
	locksDDList = [];
	locksModel = {};
	typeModel = 0;
	selectedType : any;
	selectedLocks = [];
	selectedLockIps = [];
	scheduleRelations = [];
	updateID = 0;
	displayUsersLocks = [];
	weekDays = FULL_WEEK_DAYS;
	subscription:any;
	interval;
	clientId = '_' + Math.floor(Math.random()*1E16);
	mqttData:any;
	stop_interval = false;
	message:any;
	typeList : any;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
		private scheduleService: ScheduleService,
		private lockService: LockService,
    private router: Router,
		private alertService: AlertService,
		private localMqttService: LocalMqttService,
		private spinnerService: Ng4LoadingSpinnerService
  ) { }

  ngOnInit() {
		this.typeList = [
			{id:1 , name : 'Hold Open'},
			{id:2 , name : 'Lock Down'},
		]
		const id = this.route.snapshot.paramMap.get('id');
		this.scheduleID = parseInt(id);
		this.getSchedule(this.scheduleID);
		this.getRelations();
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
	onSuccessGetSchedule(response){
		this.schedule = response.data;
		console.log("schedule:" , this.schedule);
		this.lockService.getLocks({ per_page:-1 ,company_id:this.schedule.company.id,type:1  }).subscribe(resp => {
			this.allLocks = resp.data;
			console.log(resp.data);
			resp.data.forEach(r => {
				this.locksDDList.push({
					id: r.id,
					name: r.device_name,
					ip : r.ip
				});
			})
		}, error => { 
			this.alertService.error(error.error.message); 
		})
	}
	OnErrorGetSchedule(error){
    this.alertService.error(error['error']['message']);
  }

  getRelations() {
		this.scheduleService.getScheduleLockRelations(this.scheduleID).subscribe(resp => {
			this.scheduleRelations = resp.data;
			console.log(resp.data);
			this.displayUsersLocks = [];
			this.scheduleRelations.forEach(sr => {
				let locknames = [];
				sr.locks_detail.forEach(l => {
					locknames.push(l.device_name);
				});
				this.displayUsersLocks.push({
					type_name: this.getTypeName(sr.type),
					locks: locknames.join(', '),
					type:sr.type,
					id:sr.id
				});
			})
		});
	}
	allocateToHub() {
		this.stop_interval = false;
		let message = this.getMqttInput("schedulelock");
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
				if (this.clientId == this.mqttData['client-id'] && this.mqttData["result"] == 1 && this.mqttData["cmd"] == 'schedulelock' ) {
							clearInterval(this.interval);
							this.spinnerService.hide();
							this.scheduleService.setScheduleLock({
								ID: this.updateID,
								scheduleId: this.scheduleID,
								type: this.selectedType.id,
								locks: this.selectedLocks.join(',')
							}).subscribe(resp => this.success(resp), err => this.error(err));
							this.stop_interval = true;
				}
			} else if (intervalCounter == 15) {
						clearInterval(this.interval);
						this.spinnerService.hide();
				this.alertService.error('Sorry, we were unable to connect to the hub.Please try again.')
			}
		}, 1000);
	}
	getMqttInput(cmd:any){
		let userInput : string;
		let company = this.schedule.company.channel_name;
		let type = this.selectedType.id;
		if(this.schedule.type == 0){
			let weekdays = this.schedule.weekday;
			let ips = this.selectedLockIps.join(",");
			userInput = this.clientId + '|' + company + '|' + type + '|' + weekdays + '|' + ips + '|'+cmd+'|' + this.schedule.start_time + '|' + this.schedule.end_time + '|' + this.schedule.id + "|" + this.schedule.type;
		}else if(this.schedule.type == 1){
			let ips = this.selectedLockIps.join(",");
			userInput = this.clientId + '|' + company + '|' + type + '|' + this.schedule.repeat + '|' + ips + '|'+cmd+'|' + this.schedule.start_day + '|' + this.schedule.end_day + '|' + this.schedule.id + "|" + this.schedule.type;
		}
		return userInput.toLowerCase();
	}
	getDeleteMqttInput(obj,cmd:any){
		let userInput : string;
		let company = this.schedule.company.channel_name;
			let type = obj.type;
		userInput = this.clientId + '|' + company + '|' + type + '|' + this.schedule.id + '|' + 1 + '|'+cmd+'|';
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
	error(error) {
			this.alertService.error(error['error']['message']);
	}
  	success(resp) {
		this.getRelations();
		this.updateID = resp.data.id;
		this.alertService.success(resp['message']);
	}
	successDelete(resp){
		this.getRelations();
		this.alertService.success(resp['message']);
	}
  
  onItemSelectType(type) {
	this.selectedType = type
	console.log("Selected Type",this.selectedType)
	this.typeModel = type.id
	const selectedType = type.id;
	const relations = this.scheduleRelations.find(s => s.type==selectedType);
	this.selectedLocks = [];
	this.selectedLockIps = [];
	if (!!relations) {
		this.updateID = relations.id;
		const arrLocks = relations.locks.split(',');
		arrLocks.forEach(lid => {
			this.selectedLocks.push(parseInt(lid));
			var lock = this.locksDDList.filter(x => x.id == lid);
			this.selectedLockIps.push(lock[0].ip);
		});
	} else {
		this.updateID = 0;
	}
	this.refreshLocksModel();
  }
  
	onSelectLock(lock) {
		if (!this.selectedLocks.some((lid) => lid == lock.id)) {
			this.selectedLocks.push(lock.id);
			this.selectedLockIps.push(lock.ip);
			this.refreshLocksModel();
		}else{
			var index = this.selectedLocks.indexOf(lock.id);
			this.selectedLocks.splice(index, 1);
			index = this.selectedLockIps.indexOf(lock.ip);
			this.selectedLockIps.splice(index, 1);
			this.refreshLocksModel();
		}
	}
  
  	refreshLocksModel(){
		this.locksModel = {};
		this.selectedLocks.forEach((lid)=>{
			this.locksModel[lid] = true;
		});
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
	getTypeName(type){
		if(type == 1)return "Hold Open"
		if(type == 2)return "Lock Down"
	}
	EditUserFromSchedule(obj){
		var type = {
			id : obj.type,
			name : obj.type_name
		}
		this.typeModel = type.id
		this.onItemSelectType(type);
	}
	DeleteUserFromSchedule(obj){
		console.log("Schedule User",obj)
		this.mqttData = null;
		this.stop_interval = false;
		let message = this.getDeleteMqttInput(obj,"delschedulelock");
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
				if (this.clientId == this.mqttData['client-id'] && this.mqttData["result"] == 1 && this.mqttData["cmd"] == "delschedulelock") {
							clearInterval(this.interval);
							this.spinnerService.hide();
							console.log("DeleteSchedule",this.mqttData);
							this.scheduleService.deleteScheduleLock({
								id: obj.id,
							}).subscribe(resp => this.successDelete(resp), err => this.error(err));
							this.stop_interval = true;
				}else if(this.clientId == this.mqttData['client-id'] && this.mqttData["result"] == 0 && this.mqttData["cmd"] == "delschedulelock"){
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
}
