import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ScheduleService } from './schedule.service';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl, ValidatorFn  } from '@angular/forms';
import { USER_DROPDOWN_SETINGS } from './../constants/drop-down.constants';
import { DeviceUserService } from '../device-creation/device-user/device-user.service';
import { WEEK_DAYS , FULL_WEEK_DAYS } from '../constants/schedule.constant';
import { AlertService, LocalMqttService } from '../services';
import { IMqttMessage } from 'ngx-mqtt';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
@Component({
  selector: 'app-schedule-alloc',
  templateUrl: './schedule-alloc.component.html',
  styleUrls: ['./schedule-alloc.component.css']
})

export class ScheduleAllocComponent implements OnInit {
	
	schedule:any;
	assignForm: FormGroup;
	scheduleID = 0;
	deviceUsersDDList = [];
	deviceUserDDSetting = USER_DROPDOWN_SETINGS;
	allDevUsers = [];
	locksDDList = [];
	locksModel = {};
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

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
		private scheduleService: ScheduleService,
		private deviceUserService: DeviceUserService,
    private router: Router,
		private alertService: AlertService,
		private localMqttService: LocalMqttService,
		private spinnerService: Ng4LoadingSpinnerService
  ) { }

  ngOnInit() {
		const id = this.route.snapshot.paramMap.get('id');
		this.scheduleID = parseInt(id);
		this.getSchedule(this.scheduleID);
		this.getRelations();
		this.assignForm = this.formBuilder.group({
			devuser: [[], Validators.required]
		});
		this.subscription = this.localMqttService.observe('device/neosoft').subscribe();
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  get f() { return this.assignForm.controls; }
  get formData() { return <FormArray>this.assignForm.controls.devuser; }
	
	getSchedule(id){
    this.scheduleService.showSchedule(id).subscribe(response => {
      this.onSuccessGetSchedule(response); },
    error => { this.OnErrorGetSchedule(error); }
    );
	}
	onSuccessGetSchedule(response){
		this.schedule = response.data;
		console.log("schedule:" , this.schedule);
		this.deviceUserService.getDeviceUsers({ per_page:-1 ,company_id:this.schedule.company.id  }).subscribe(resp => {
			this.allDevUsers = resp.data;
			console.log(resp.data);
			resp.data.forEach(r => {
				this.deviceUsersDDList.push({
					id: r.id,
					name: r.device_user_fname + ' ' + r.device_user_lname,
					device_id:r.device_user_id
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
		this.scheduleService.getScheduleRelations(this.scheduleID).subscribe(resp => {
			this.scheduleRelations = resp.data;
			console.log(resp.data);
			this.displayUsersLocks = [];
			this.scheduleRelations.forEach(sr => {
				let locknames = [];
				sr.locks_detail.forEach(l => {
					locknames.push(l.device_name);
				});
				this.displayUsersLocks.push({
					username: sr.user.device_user_fname + ' ' + sr.user.device_user_lname,
					locks: locknames.join(', '),
					device_user_id:sr.user.device_user_id,
					user_id:sr.user_id,
					id:sr.id
				});
			})
		});
	}
	allocateToHub() {
		this.stop_interval = false;
		let message = this.getMqttInput("schedule");
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
        if (this.clientId == this.mqttData['client-id'] && this.mqttData["result"] == 1 && this.mqttData['cmd'] == 'schedule' ) {
					clearInterval(this.interval);
					this.spinnerService.hide();
					let formData = this.assignForm.value;
					this.scheduleService.setScheduleUserDevice({
						ID: this.updateID,
						scheduleId: this.scheduleID,
						userId: formData.devuser[0].id,
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
		let user_id = this.assignForm.value.devuser[0].device_id;
    let weekdays = this.schedule.weekday;
    let ips = this.selectedLockIps.join(",");
    userInput = this.clientId + '|' + company + '|' + user_id + '|' + weekdays + '|' + ips + '|'+cmd+'|' + this.schedule.start_time + '|' + this.schedule.end_time + '|' + this.schedule.id;
    return userInput.toLowerCase();
	}
	getDeleteMqttInput(obj,cmd:any){
    let userInput : string;
    let company = this.schedule.company.channel_name;
		let user_id = obj.device_user_id;
    userInput = this.clientId + '|' + company + '|' + user_id + '|' + this.schedule.id + '|' + 1 + '|'+cmd+'|';
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
  onSubmit() {
		this.allocateToHub();
  }
  
  onSelectUser(e) {
	  let formData = this.assignForm.value;
	  const selectedDevUserID = formData.devuser[0].id;
	  const selectedDevUser = this.allDevUsers.find(du => du.id == selectedDevUserID);
	  this.locksDDList = selectedDevUser.locks;
	  console.log("locks",this.locksDDList);
	  const relations = this.scheduleRelations.find(s => s.user_id==selectedDevUserID);
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
		console.log("ips" , this.selectedLockIps);
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
	EditUserFromSchedule(obj){
		this.assignForm.patchValue({
			devuser:[{
					id: obj.user_id,
					name: obj.username,
					device_id:obj.device_user_id
			}]
		})
		this.onSelectUser(obj);
	}
	DeleteUserFromSchedule(obj){
		console.log("Schedule User",obj)
		this.mqttData = null;
		this.stop_interval = false;
		let message = this.getDeleteMqttInput(obj,"delscheduleuser");
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
        if (this.clientId == this.mqttData['client-id'] && this.mqttData["result"] == 1 && this.mqttData["cmd"] == "delscheduleuser") {
					clearInterval(this.interval);
					this.spinnerService.hide();
					console.log("DeleteSchedule",this.mqttData);
					this.scheduleService.deleteScheduleUserDevice({
						id: obj.id,
					}).subscribe(resp => this.successDelete(resp), err => this.error(err));
					this.stop_interval = true;
        }else if(this.clientId == this.mqttData['client-id'] && this.mqttData["result"] == 0 && this.mqttData["cmd"] == "delscheduleuser"){
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
