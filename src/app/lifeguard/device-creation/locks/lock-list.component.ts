import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LocalAuthService, AlertService , LocalMqttService } from '../../services';
import { LockService } from './lock.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompanyService } from '../../device-creation/companies/company.service';
import { OfficeService } from '../offices/office.service';
import { HeartBeatService } from '../../heart-beat/heart-beat.service';
import { Subscription } from 'rxjs';
import { COMPANY_DROPDOWN_SETINGS, OFFICE_DROPDOWN_SETINGS, ZONE_DROPDOWN_SETINGS } from '../../constants/drop-down.constants';
import { IMqttMessage } from 'ngx-mqtt';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WEEK_DAYS , FULL_WEEK_DAYS } from '../../constants/schedule.constant';
@Component({
  selector: 'app-lock-list',
  templateUrl: './lock-list.component.html',
  styleUrls: ['./lock-list.component.css']
})
export class LockListComponent implements OnInit {

  searchForm: FormGroup;
  locksList:any;
  lock:any;
  totalItems;
  currentPage;
  pageSize = 10;
  dropdownCompanyList = [];
  selectedCompanyItems = [];
  companyDropdownSettings = {};
  dropdownStatusList = [];
  statusDropdownSettings = {};
  officeDropdownSettings = {};
  dropdownOfficeList = [];
  selectedOfficeItems = [];
  zoneDropdownSettings = {};
  dropdownZoneList = [];
  selectedZoneItems = [];
  heartBeatsubscription:Subscription;
  clientId = '_' + Math.floor(Math.random()*1E16);
  mqttData:any;
	stop_interval = false;
  message:any;
  subscription:any;
  interval;
  scheduleUsers = [];
  weekDays = WEEK_DAYS;
  schedule_modal : any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private lockService: LockService,
    private authService: LocalAuthService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private companyService: CompanyService,
    private officeService: OfficeService,
    private heartBeatService: HeartBeatService,
    private localMqttService: LocalMqttService,
    private spinnerService: Ng4LoadingSpinnerService,
    private modalService: NgbModal,
  ) {
    this.companyDropdownSettings = COMPANY_DROPDOWN_SETINGS;
    this.officeDropdownSettings  = OFFICE_DROPDOWN_SETINGS;
    this.zoneDropdownSettings = ZONE_DROPDOWN_SETINGS;
    this.statusDropdownSettings = {
      singleSelection: true,
      labelKey:'name',
      text:"Select Status",
      classes:"myclass custom-class",
      noDataLabel: 'No Status Found.'
    };
  }

  ngOnInit() {
    this.getLocks({ page: 1 });
    this.getCompanies();
    this.dropdownStatusList = [
      { id: 1, name: 'Active' },
      { id: 0, name: 'Inactive' }
    ]
    this.searchForm = this.formBuilder.group({
      search: [''],
      companyId: [[]],
      officeId: [[]],
      zoneId: [[]],
      status: [[]]
    });
    let topic = '#';
    if (this.authService.currentCompany()) {
      topic = this.authService.currentCompany()['channel_name'];
    }

    this.heartBeatService.heartBeatInit(topic);
    this.heartBeatsubscription = this.heartBeatService.beatObserver$.subscribe( (beat) => {
      this.locksList.filter( (lock) => {
        // console.log(beat);
        if(beat['type'] == 'lock' && lock.ip == beat['ip'] && lock.company.channel_name == beat['channel'] && lock.office.name.toLowerCase() == beat['office']) {
          lock.timestamp = beat['timestamp'];
        }
      })
    });
    this.subscription = this.localMqttService.observe('device/neosoft').subscribe();
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  getMqttInput(lock,cmd:any){
    let userInput : string;
    let company = lock.company.channel_name;
    userInput = this.clientId + '|' + company + '|' + 1 + '|' + lock.ip + '|' + 1 + '|'+cmd;
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
      if (this.mqttData["response-code"] != 0) {
        this.mqttData = false;
        this.alertService.error("Sorry, we were unable to connect to the hub.");
      }
    })
  }
  getCompanies(){
    this.companyService.getCompanies({ per_page: -1 }).subscribe(
      response => {
        this.dropdownCompanyList = response['data'];
      },
      error => { this.OnErrorDeleteLock(error); }
    );
  }

  getLocks(params){
    this.lockService.getLocks(params).subscribe(response => {
      this.onSucessGetLocks(response); },
    error => { this.onErrorGetLocks(error); }
    );
  }

  getLock(id){
    this.lockService.getLock(id).subscribe(response => {
      this.lock = response.data
    },
    error => { this.onErrorGetLock(error); }
    );
  }

  getStatus(lock) {
    if (lock.status == 0) {
      return 'In Active'
    } else if (lock.status == 1) {
      return 'Active'
    } else if (lock.status == 2) {
      return 'Archived'
    }
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

  getCompanyOffices(company){
    this.officeService.getCompanyOffices(company).subscribe(
      response => { this.dropdownOfficeList = response.data; },
      error => { this.onErrorGetLocks(error); }
    );
  }

  getOfficeZones(office){
    this.officeService.getZones(office).subscribe(response => {
      this.dropdownZoneList = response.data; },
    error => { this.onErrorGetLock(error); }
    );
  }

  deleteLock(isForceDelete, lock){
    isForceDelete = isForceDelete == 1;
    this.lockService.delete(lock.id, isForceDelete).subscribe(response => {
      this.onSuccessDeleteLock(response); },
    error => { this.OnErrorDeleteLock(error); }
    );
  }
  resetTimeLock(isForceDelete, lock){
    this.mqttData = null
    this.stop_interval = false;
		let message = this.getMqttInput(lock,"resettime");
		console.log(message);
    let companyName = lock.company.channel_name.toLowerCase();
    this.subscription.unsubscribe();
    this.subscription = this.subscribeMQTTChannel(companyName);
		this.localMqttService.unsafePublishWithoutSpinner(`web/${companyName}`, message);
		this.spinnerService.show();

		let intervalCounter = 0;
    this.interval = setInterval(()=> {
      intervalCounter = intervalCounter + 1;
      this.alertService.clearAlert();
      if (this.mqttData && !this.stop_interval) {
        if (this.clientId == this.mqttData['client-id'] && this.mqttData["response-code"] == 0 && this.mqttData["cmd"] == "resettime") {
          this.spinnerService.hide();
          clearInterval(this.interval);
          this.stop_interval = true;
          this.alertService.success('Reset Time successfully done.')
        }
      } else if (intervalCounter == 10) {
				clearInterval(this.interval);
				this.spinnerService.hide();
        this.alertService.error('Sorry, we were unable to connect to the hub.Please try again.')
      }
    }, 1000);
  }
  onSuccessDeleteLock(response){
    this.alertService.success(response['message']);
    this.getLocks({ page: this.currentPage, ...this.searchForm.value });
  }

  OnErrorDeleteLock(error){
    this.alertService.error(error['error']['message']);
  }

  onSucessGetLocks(response){
    this.locksList = response['data'];
    this.totalItems = response['total'];
    this.currentPage = response['current_page'];
    this.pageSize = response['per_page'];
  }

  onErrorGetLocks(error){
    this.alertService.error(error['error']['message']);
  }

  onErrorGetLock(error){
    this.alertService.error(error['error']['message']);
  }

  onCompanySelect(company:any){
    this.getCompanyOffices(company);
  }

  onOfficeSelect(office:any){
    this.getOfficeZones(office);
  }

  onZoneSelect(item:any){

  }

  onStatusSelect(item:any){

  }

  pageChanged(page) {
    this.getLocks({ page: page, ...this.searchForm.value })
  }

  onSearch(formData) {
    if(formData['companyId'] && formData['companyId'][0]) {
      formData['company_id'] = formData['companyId'][0]['id']
    } else {
      delete formData['company_id'];
    }
    if(formData['officeId'] && formData['officeId'][0]) {
      formData['office_id'] = formData['officeId'][0]['id']
    } else {
      delete formData['office_id'];
    }
    if(formData['zoneId'] && formData['zoneId'][0]) {
      formData['zone_id'] = formData['zoneId'][0]['id']
    } else {
      delete formData['zone_id'];
    }
    if(formData['status'] && formData['status'][0]) {
      formData['status'] = formData['status'][0]['id']
    } else {
      delete formData['status'];
    }
    delete formData['companyId'];
    delete formData['officeId'];
    delete formData['zoneId'];
    this.getLocks(formData)
  }
  getTypeString(type) {
    if(type == 1)return "Normal";
    if(type == 2)return "<label class='badge badge-success'>Enrollment</label>";
  }
  viewScheduleUsers(lock,modal){
    this.spinnerService.show();
    this.schedule_modal = modal;
    this.scheduleUsers = []
    this.lockService.getScheduleUsers(lock.id).subscribe(response => {
      this.onSucessGetScheduleUsers(response); },
      error => { this.onErrorGetScheduleUsers(error); }
    );
  }
  onSucessGetScheduleUsers(response){
    console.log("Schedule Users" , response);
    this.scheduleUsers = response.data;
    this.spinnerService.hide();
    this.modalService.open(this.schedule_modal, { size: 'lg' });
  }
  onErrorGetScheduleUsers(error){
    this.alertService.error(error['error']['message']);
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
  setLockDefault(isForceDelete, lock){
    this.mqttData = null
    this.stop_interval = false;
		let message = this.getMqttInput(lock,"resetdevice");
		console.log(message);
    let companyName = lock.company.channel_name.toLowerCase();
    this.subscription.unsubscribe();
    this.subscription = this.subscribeMQTTChannel(companyName);
		this.localMqttService.unsafePublishWithoutSpinner(`web/${companyName}`, message);
		this.spinnerService.show();

		let intervalCounter = 0;
    this.interval = setInterval(()=> {
      intervalCounter = intervalCounter + 1;
      this.alertService.clearAlert();
      if (this.mqttData && !this.stop_interval) {
        if (this.clientId == this.mqttData['client-id'] && this.mqttData["response-code"] == 0 && this.mqttData["cmd"] == "resetdevice") {
          this.spinnerService.hide();
          
          clearInterval(this.interval);
          this.stop_interval = true;
          this.lockService.setRockDefault(lock.id).subscribe(response => {
            this.alertService.success('Reset Device successfully done.')
           },
            error => { this.onErrorGetScheduleUsers(error); }
          );
          
        }
      } else if (intervalCounter == 15) {
				clearInterval(this.interval);
				this.spinnerService.hide();
        this.alertService.error('Sorry, we were unable to connect to the hub.Please try again.')
      }
    }, 1000);
  }
}
