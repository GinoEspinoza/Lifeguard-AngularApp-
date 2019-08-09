import { Component, OnInit,  } from '@angular/core';
import { UserService } from '../users/user.service';
import { ScheduleService } from './schedule.service';
import { AlertService,LocalMqttService } from '../services';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompanyService } from '../device-creation/companies/company.service';
import { COMPANY_DROPDOWN_SETINGS, ROLES, ROLE_SETTINGS } from '../constants/drop-down.constants';
import { WEEK_DAYS , FULL_WEEK_DAYS } from '../constants/schedule.constant';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { IMqttMessage } from 'ngx-mqtt';
@Component({
  selector: 'app-schedule-list',
  templateUrl: './schedule.component.html'
})
export class ScheduleComponent implements OnInit {

  searchForm: FormGroup;
  users;
  schedules;
  totalItems;
  currentPage;
  pageSize = 10;
  dropdownCompanyList = [];
  selectedCompanyItems = [];
  companyDropdownSettings = {};
  dropdownStatusList = [];
  statusDropdownSettings = {};
  weekDays = WEEK_DAYS;
  clientId = '_' + Math.floor(Math.random()*1E16);
  mqttData:any;
	stop_interval = false;
  message:any;
  subscription:any;
  interval;

  constructor(
    private scheduleService: ScheduleService,
    private userService: UserService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private companyService: CompanyService,
    private localMqttService: LocalMqttService,
		private spinnerService: Ng4LoadingSpinnerService
  ) {
    this.companyDropdownSettings = COMPANY_DROPDOWN_SETINGS;
    this.statusDropdownSettings = {
      singleSelection: true,
      labelKey:'name',
      text:"Select Status",
      classes:"myclass custom-class",
      noDataLabel: 'No Status Found.'
    };
  }

  ngOnInit() {
    this.getSchedules({ page: 1 });
    this.getCompanies();
    this.dropdownStatusList = [
      { id: 1, name: 'Active' },
      { id: 0, name: 'Inactive' }
    ]
    this.searchForm = this.formBuilder.group({
      search: [''],
      companyId: [[]],
      status: [[]],
      role: [[]]
    });
    this.subscription = this.localMqttService.observe('device/neosoft').subscribe();
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
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

  getStatus(schedule) {
    if (schedule.status == 0) {
      return 'In Active'
    } else if (schedule.status == 1) {
      return 'Active'
    } else if (schedule.status == 2) {
      return 'Archived'
    }
  }

  getCompanies(){
    this.companyService.getCompanies({ per_page: -1 }).subscribe(
      response => {
        this.dropdownCompanyList = response['data'];
      },
      error => { this.OnErrorDeleteSchedule(error); }
    );
  }

  onErrorGetScheduleList(error){
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
    this.mqttData = null
    this.stop_interval = false;
		let message = this.getDeleteMqttInput(schedule,"delschedule");
		console.log(message);
    let companyName = schedule.company.channel_name.toLowerCase();
    this.subscription.unsubscribe();
    this.subscription = this.subscribeMQTTChannel(companyName);
		this.localMqttService.unsafePublishWithoutSpinner(`web/${companyName}`, message);
		this.spinnerService.show();

		let intervalCounter = 0;
    this.interval = setInterval(()=> {
      intervalCounter = intervalCounter + 1;
      this.alertService.clearAlert();
      if (this.mqttData && !this.stop_interval) {
        if (this.clientId == this.mqttData['client-id'] && this.mqttData["result"] == 1 && this.mqttData["cmd"] == "delschedule") {
          this.spinnerService.hide();
          clearInterval(this.interval);
					console.log("DeleteSchedule",this.mqttData);
					this.scheduleService.delete(schedule.id).subscribe(
            response => { this.onSuccessDeleteSchedule(response); },
            error => { this.OnErrorDeleteSchedule(error); }
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
    this.getSchedules({ page: this.currentPage });
  }

  OnErrorDeleteSchedule(error) {
    this.alertService.error(error['error']['message'])
  }


  onCompanySelect(item:any){

  }

  onStatusSelect(item:any){

  }

  onRoleSelect(item:any){

  }
  
  pageChanged(page) {
    this.getSchedules({ page: page, ...this.searchForm.value })
  }

  onSearch(formData) {
    if(formData['companyId'] && formData['companyId'][0]) {
      formData['company_id'] = formData['companyId'][0]['id']
    } else {
      delete formData['company_id'];
    }
    if(formData['status'] && formData['status'][0]) {
      formData['status'] = formData['status'][0]['id']
    } else {
      delete formData['status'];
    }
    this.getSchedules(formData)
  }
  getWeekDetails(schedule){
    let weekdays = schedule.weekday.split(",");
    let label = ""
    for(let i =0 ;i<7 ;i++){
      if(weekdays[i] == 1){
        label += "<span class='badge badge-info mr-10'>"+this.weekDays[i].name+"</span>";
      }
    }
    label += schedule.start_time + " ~ " + schedule.end_time;
    return label;
  }
}
