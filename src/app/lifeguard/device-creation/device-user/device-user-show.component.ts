import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DeviceUserService } from './device-user.service';
import { AlertService, LocalMqttService } from '../../services';
import { IMqttMessage } from 'ngx-mqtt';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ScheduleService } from '../../schedules/schedule.service';
import { WEEK_DAYS , FULL_WEEK_DAYS } from '../../constants/schedule.constant';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
@Component({
  selector: 'app-device-user-show',
  templateUrl: './device-user-show.component.html',
  styleUrls: ['./device-user-show.component.css']
})
export class DeviceUserShowComponent implements OnInit {
  schedules;
  totalItems;
  currentPage;
  pageSize = 10;
  deviceUsersList:any;
  deviceUser:any;
  subscription:any;
  sel_lock:any;
  sel_schedule:any;
  messages = [];
  responses = [];
  clientId = '_' + Math.floor(Math.random()*1E16);
  weekDays = WEEK_DAYS;
  mqttData:any;
  message:any;
  interval;
  stop_interval = false;
  locks_schedule_list = [];

  constructor(
    private route: ActivatedRoute,
    private scheduleService: ScheduleService,
    private router: Router,
    private deviceUserService: DeviceUserService,
    private localMqttService: LocalMqttService,
    private alertService: AlertService,
    private modalService: NgbModal,
    private spinnerService: Ng4LoadingSpinnerService
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.getDeviceUser(id);
    this.subscription = this.localMqttService.observe('device/neosoft').subscribe();
  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }

  getDeviceUser(id){
    this.deviceUserService.getDeviceUser(id).subscribe(response => {
      this.onSucessGetDeviceUser(response); },
    error => { this.onErrorGetDeviceUser(error); }
    );
  }
  getSchedules(params) {
    this.scheduleService.getSchedules(params).subscribe(
      response => {
        this.schedules = response['data'];
        this.totalItems = response['total'];
        this.currentPage = response['current_page'];
        this.pageSize = response['per_page'];
      },
      error => { this.onErrorGetScheduleList(error); }
    );
  }
  onErrorGetScheduleList(error){
  }
  onSucessGetDeviceUser(response){
    this.deviceUser = response.data;
    this.getSchedules({ page: 1,company_id:this.deviceUser.company.id });
  }

  onErrorGetDeviceUser(error){
    this.alertService.error(error['error']['message']);
  }
  errorSchedule(error) {
		this.alertService.error(error['error']['message']);
  }
  successSchedule(resp) {
		const id = this.route.snapshot.paramMap.get('id');
    this.getDeviceUser(id);
		this.alertService.success(resp['message']);
	}
  deleteDeviceUser(deviceUser, lock){
    this.messages = this.getMqttInput(deviceUser, lock)
    console.log(this.messages);
    let channel = deviceUser.company.channel_name.toLowerCase();
    this.subscription.unsubscribe();
    this.subscription = this.subscribeMQTTChannel(channel);
    this.responses = [];
    if (this.messages.length > 0) {
      this.messages.map((message)=> {
        this.localMqttService.unsafePublish(`web/${channel}`, message);
      })
    }
    let intervalCounter = 0;
    let interval = setInterval(()=> {
      intervalCounter = intervalCounter + 1;
      if (this.responses.length == this.messages.length) {
        clearInterval(interval);
        this.deviceUserService.delete(deviceUser, lock).subscribe(response => {
            this.alertService.success(response['message']);
            this.deviceUser.locks.splice(lock);
            // this.router.navigate(['device-users']);
          },
          error => { this.onErrorGetDeviceUser(error); }
        );
      } else if (intervalCounter == 10) {
        clearInterval(interval);
        this.alertService.error('Sorry, we were unable to process your request. Please try again later or contact support.')
      }
    }, 1000);
  }

  subscribeMQTTChannel(channel: string){
    return this.localMqttService.observe(`device/${channel}`)
    .subscribe((_message: IMqttMessage) => {
      let message = _message.payload.toString();
      let mqttData = JSON.parse(message);
      console.log(mqttData);
      if (this.clientId != mqttData['client-id']){
        return
      }
      if (mqttData["response-code"] != 0) {
        mqttData = false;
        this.alertService.error("We were unable to process this request this request at the moment. Please contact support.");
      }
      if(this.responses.filter(response => response['lock-name'] == mqttData['lock-name']).length == 0 && mqttData["response-code"] == 0) {
        this.responses.push(mqttData);
      }
    })
  }
  subscribeScheduleMQTTChannel(company: string){
    return this.localMqttService.observe1(`device/${company}`)
    .subscribe((message: IMqttMessage) => {
      this.message = message.payload.toString();
			this.mqttData = JSON.parse(this.message);
			console.log("mqtt",this.mqttData);
      if (this.clientId != this.mqttData['client-id']){
        return
      }
      if (this.mqttData["response-code"] && this.mqttData["response-code"] != 0) {
        this.mqttData = false;
        this.alertService.error("Sorry, we were unable to connect to the hub.");
      }
    })
  }
  getScheduleMqttInput(cmd:any){
    let userInput : string;
    let company = this.deviceUser.company.channel_name;
		let user_id = this.deviceUser.device_user_id;
    let weekdays = this.sel_schedule.weekday;
    let ips = this.sel_lock.ip;
    if(cmd == 'schedule'){
      userInput = this.clientId + '|' + company + '|' + user_id + '|' + weekdays + '|' + ips + '|'+cmd+'|' + this.sel_schedule.start_time + '|' + this.sel_schedule.end_time + '|' + this.sel_schedule.id;
    }else if(cmd == 'deletelockschedule'){
      userInput = this.clientId + '|' + company + '|' + user_id + '|' + this.sel_schedule.id + '|' + ips + '|'+cmd;
    }
    return userInput.toLowerCase();
  }
  getShareMqttInput(cmd:any,lock){
    let userInput : string;
    let company = this.deviceUser.company.channel_name;
		let user_id = this.deviceUser.device_user_id;
    let lock_ip = lock.ip;
    let ips = this.deviceUser.locks.filter((in_lock)=>{
      if (in_lock.ip == lock.ip) {
        return false; // skip
      }
      return true;
    }).map((in_lock)=>{
      if(in_lock.ip != lock.ip)
        return in_lock.ip;
    });
    userInput = this.clientId + '|' + company + '|1|1|1|'+cmd+'|' + lock_ip + '|' + user_id + '|2|'+ips.join("&");
    return userInput.toLowerCase();
  }
  getMqttInput(deviceUser:any, lock:any){
    let userInput : string;
    this.clientId = '_' + Math.floor(Math.random()*1E16);
    let company = deviceUser.company.channel_name;
    let userId = deviceUser.device_user_id;
    let _messages = [lock].map( (device)=> {
      let office = device.office.name;
      let timestamp = Date.now();
      let zone = device.zone.name;
      userInput = [this.clientId, company, office, zone, device.device_name, 'deluser', device.ip, userId, timestamp].join('|');
      return userInput.toLowerCase();
    });
    return _messages;
  }

  deleteUserCredentials(deviceUser, lock) {
    this.messages = this.getMqttCredentialInput(deviceUser, lock)
    console.log(this.messages);
    let channel = deviceUser.company.channel_name.toLowerCase();
    this.subscription.unsubscribe();
    this.subscription = this.subscribeMQTTChannel(channel);
    this.responses = [];
    if (this.messages.length > 0) {
      this.messages.map((message)=> {
        this.localMqttService.unsafePublish(`web/${channel}`, message);
      })
    }
    let intervalCounter = 0;
    let interval = setInterval(()=> {
      intervalCounter = intervalCounter + 1;
      if (this.responses.length == this.messages.length) {
        clearInterval(interval);
        this.deviceUserService.deleteCredential(deviceUser, lock).subscribe(response => {
            this.alertService.success(response['message']);
            lock.enrolled = false;
            // this.deviceUser.locks.splice(lock);
            // this.router.navigate(['device-users']);
          },
          error => { this.onErrorGetDeviceUser(error); }
        );
      } else if (intervalCounter == 10) {
        clearInterval(interval);
        this.alertService.error('Sorry, we were unable to process your request. Please try again later or contact support.')
      }
    }, 1000);
  }

  getMqttCredentialInput(deviceUser:any, lock:any){
    let userInput : string;
    this.clientId = '_' + Math.floor(Math.random()*1E16);
    let company = deviceUser.company.channel_name;
    let userId = deviceUser.device_user_id;
    let enrollModes = {
      "0": "",
      "1": "2", //smart card
      "2": "1", //finger
      "4": "3", //palm
    }
    let enrollMode = enrollModes[deviceUser.enroll_mode] || '0';

    let _messages = [lock].map( (device)=> {
      let office = device.office.name;
      let timestamp = Date.now();
      let zone = device.zone.name;
      userInput = [this.clientId, company, office, zone, device.device_name, 'delusercreds', device.ip, userId, enrollMode, timestamp].join('|');
      return userInput.toLowerCase();
    });
    return _messages;
  }
  openScheduleModel(modal_content,lock){
    this.sel_schedule = null
    this.sel_lock = lock
    this.modalService.open(modal_content, { size: 'lg' });
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
  getStatus(schedule) {
    if (schedule.status == 0) {
      return 'In Active'
    } else if (schedule.status == 1) {
      return 'Active'
    } else if (schedule.status == 2) {
      return 'Archived'
    }
  }
  setSchedule(schedule){
    this.sel_schedule = schedule
  }
  selectSchedule(modal){
    modal.close('Close click')
    if(!this.sel_lock){
      this.alertService.error('Please select a lock.')
      return;
    }
    if(!this.sel_schedule){
      this.alertService.error('Please select a schedule.')
      return;
    }
    this.stop_interval = false;
		let message = this.getScheduleMqttInput("schedule");
		console.log(message);
    let companyName = this.sel_schedule.company.channel_name.toLowerCase();
    this.subscription.unsubscribe();
    this.subscription = this.subscribeScheduleMQTTChannel(companyName);
		this.localMqttService.unsafePublishWithoutSpinner(`web/${companyName}`, message);
		this.spinnerService.show();

		let intervalCounter = 0;
    this.interval = setInterval(()=> {
      intervalCounter = intervalCounter + 1;
      this.alertService.clearAlert();
      if (this.mqttData && !this.stop_interval) {
        if (this.clientId == this.mqttData['client-id'] && this.mqttData["result"] == 1 && this.mqttData['cmd']=='schedule' ) {
					clearInterval(this.interval);
          this.spinnerService.hide();
          let locks_ips = this.getSelScheduleLockIps();
          let update_id = this.getExistingScheduleUserId()
					this.scheduleService.setScheduleUserDevice({
						ID: update_id,
						scheduleId: this.sel_schedule.id,
						userId: this.deviceUser.id,
						locks: locks_ips
					}).subscribe(resp => this.successSchedule(resp), err => this.errorSchedule(err));
					this.stop_interval = true;
        }
      } else if (intervalCounter == 10) {
				clearInterval(this.interval);
				this.spinnerService.hide();
        this.alertService.error('Sorry, we were unable to connect to the hub.Please try again.')
      }
    }, 1000);
  }
  getSelScheduleLockIps(){
    let locks = this.deviceUser.locks;
    let lock_ip_list = [];
    locks.forEach(lock => {
        if(lock.schedule.id == this.sel_schedule.id && lock.id != this.sel_lock.id){
          lock_ip_list.push(lock.id);
        }
    });
    lock_ip_list.push(this.sel_lock.id);
    return lock_ip_list.join(",");
  }
  getExistingScheduleUserId(){
    let locks = this.deviceUser.locks;
    let lock = locks.filter(lock => lock.schedule.id == this.sel_schedule.id);
    if(lock.length == 0){
      return 0;
    }else{
      return lock[0].schedule_user_id;
    }
  }
  deleteSchedule(schedule, lock){
    this.sel_schedule = schedule
    this.sel_lock = lock
    if(!this.sel_lock){
      this.alertService.error('Please select a lock.')
      return;
    }
    if(!this.sel_schedule.id){
      this.alertService.error('No schedule for this lock.')
      return;
    }
    this.stop_interval = false;
		let message = this.getScheduleMqttInput("deletelockschedule");
		console.log(message);
    let companyName = this.deviceUser.company.channel_name.toLowerCase();
    this.subscription.unsubscribe();
    this.subscription = this.subscribeScheduleMQTTChannel(companyName);
		this.localMqttService.unsafePublishWithoutSpinner(`web/${companyName}`, message);
		this.spinnerService.show();

		let intervalCounter = 0;
    this.interval = setInterval(()=> {
      intervalCounter = intervalCounter + 1;
      this.alertService.clearAlert();
      if (this.mqttData && !this.stop_interval) {
        if (this.clientId == this.mqttData['client-id'] && this.mqttData["result"] == 1 && this.mqttData['cmd']=='deletelockschedule' ) {
					clearInterval(this.interval);
          this.spinnerService.hide();
          let locks_ips = this.getDelScheduleLockIps();
          let update_id = this.getExistingScheduleUserId()
          if(locks_ips){
            this.scheduleService.setScheduleUserDevice({
              ID: update_id,
              scheduleId: this.sel_schedule.id,
              userId: this.deviceUser.id,
              locks: locks_ips
            }).subscribe(resp => this.successSchedule(resp), err => this.errorSchedule(err));
          }else{
            this.scheduleService.deleteScheduleUserDevice({
              id: update_id,
            }).subscribe(resp => this.successSchedule(resp), err => this.errorSchedule(err));
          }
					this.stop_interval = true;
        }else if(this.clientId == this.mqttData['client-id'] && this.mqttData["result"] == 0 && this.mqttData["cmd"] == "deletelockschedule"){
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
  getDelScheduleLockIps(){
    let locks = this.deviceUser.locks;
    let lock_ip_list = [];
    locks.forEach(lock => {
        if(lock.schedule.id == this.sel_schedule.id && lock.id != this.sel_lock.id){
          lock_ip_list.push(lock.id);
        }
    });
    return lock_ip_list.join(",");
  }
  shareCredentials(lock){
    console.log("selected lock:",lock);
    this.sel_lock = lock
    if(!this.sel_lock){
      this.alertService.error('Please select a lock.')
      return;
    }
    this.stop_interval = false;
		let message = this.getShareMqttInput("sharecredentials",lock);
    console.log("mqtt message",message);
    let companyName = this.deviceUser.company.channel_name.toLowerCase();
    this.subscription.unsubscribe();
    this.subscription = this.subscribeScheduleMQTTChannel(companyName);
		this.localMqttService.unsafePublishWithoutSpinner(`web/${companyName}`, message);
		this.spinnerService.show();

		let intervalCounter = 0;
    this.interval = setInterval(()=> {
      intervalCounter = intervalCounter + 1;
      this.alertService.clearAlert();
      if (this.mqttData && !this.stop_interval) {
        if (this.clientId == this.mqttData['client-id'] && this.mqttData['cmd']=='sharecredentials' && this.mqttData['result']==1 ) {
					clearInterval(this.interval);
          this.spinnerService.hide();
          this.stop_interval = true;
          let locks = this.deviceUser.locks.map((in_lock)=>{
              return in_lock.id;
          });
          this.deviceUserService.updateShareCredentials({id:this.deviceUser.id , locks_enroll:locks.join(','), smart_card_number:this.mqttData['card']}).subscribe(response => {
              this.alertService.success('Device user updated successfully.');
              this.getDeviceUser(this.deviceUser.id) 
            },
            error => { this.onErrorGetDeviceUser(error); }
          );

        }else if (this.clientId == this.mqttData['client-id'] && this.mqttData['cmd']=='sharecredentials' && this.mqttData['result']== 0 ){
          if(this.mqttData['error'] == 'card'){
            this.alertService.error('There are no card credentials on the selected lock.');
          }
          if(this.mqttData['error'] == 'enroll'){
            this.alertService.error('Error on set credentials to other locks');
          }
          this.spinnerService.hide();
          this.stop_interval = true;
        }
      } else if (intervalCounter == 15) {
				clearInterval(this.interval);
				this.spinnerService.hide();
        this.alertService.error('Sorry, we were unable to connect to the hub.Please try again.')
      }
    }, 1000);
  }

}
