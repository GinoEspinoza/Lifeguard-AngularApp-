import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DeviceUserService } from './device-user.service';
import { AlertService, LocalMqttService } from '../../services';
import { IMqttMessage } from 'ngx-mqtt';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompanyService } from '../../device-creation/companies/company.service';
import { COMPANY_DROPDOWN_SETINGS } from './../../constants/drop-down.constants';

@Component({
  selector: 'app-device-user-list',
  templateUrl: './device-user-list.component.html',
  styleUrls: ['./device-user-list.component.css']
})
export class DeviceUserListComponent implements OnInit {

  deviceUsersList:any;
  deviceUser:any;
  subscription:any;
  messages = [];
  responses = [];
  searchForm: FormGroup;
  totalItems;
  currentPage;
  pageSize = 10;
  dropdownCompanyList = [];
  selectedCompanyItems = [];
  companyDropdownSettings = {};
  dropdownStatusList = [];
  statusDropdownSettings = {};
  clientId = '_' + Math.floor(Math.random()*1E16);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private deviceUserService: DeviceUserService,
    private localMqttService: LocalMqttService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private companyService: CompanyService,
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
    this.getDeviceUsers({ page: -1 });
    this.subscription = this.localMqttService.observe('device/neosoft').subscribe();
    this.getCompanies();
    this.dropdownStatusList = [
      { id: 1, name: 'Active' },
      { id: 0, name: 'Inactive' }
    ];
    this.searchForm = this.formBuilder.group({
      search: [''],
      companyId: [[]],
      officeId: [[]],
      status: [[]]
    });
  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }

  getDeviceUsers(params){
    this.deviceUserService.getDeviceUsers(params).subscribe(
      response => { this.onSucessGetDeviceUsers(response); },
      error => { this.onErrorGetDeviceUser(error); }
    );
  }

  getCompanies(){
    this.companyService.getCompanies({ per_page: -1 }).subscribe(
      response => {
        this.dropdownCompanyList = response['data'];
      },
      error => { this.onErrorGetDeviceUser(error); }
    );
  }

  totalEnrolled(locks) {
    return locks.filter(lock => lock.enrolled).length
  }

  onSucessGetDeviceUsers(response){
    this.deviceUsersList = response.data;
    this.totalItems = response['total'];
    this.currentPage = response['current_page'];
    this.pageSize = response['per_page'];
  }

  onErrorGetDeviceUser(error){
    this.alertService.error(error['error']['message']);
  }

  getDeviceUser(id){
    this.deviceUserService.getDeviceUser(id).subscribe(
      response => { this.onSucessGetDeviceUser(response); },
      error => { this.onErrorGetDeviceUser(error); }
    );
  }

  onSucessGetDeviceUser(response){
    this.deviceUser = response.data;
  }

  deleteDeviceUser(deviceUser){
    this.messages = this.getMqttInput(deviceUser)
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
        this.deviceUserService.delete(deviceUser).subscribe(response => {
            this.onSuccessDeleteDeviceUser(response);
            this.alertService.success('Device User deleted successfully')
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
        this.alertService.error("We were unable to process this request at the moment. Please contact support.");
      }
      if(this.responses.filter(response => response['lock-name'] == mqttData['lock-name']).length == 0 && mqttData["response-code"] == 0) {
        this.responses.push(mqttData);
      }
    })
  }

  getMqttInput(deviceUser:any){
    let userInput : string;
    let company = deviceUser.company.channel_name;
    let userId = deviceUser.device_user_id;
    let _messages = deviceUser.locks.map( (device)=> {
      let office = device.office.name;
      let timestamp = Date.now();
      let zone = device.zone.name;
      userInput = [this.clientId, company, office, zone, device.device_name, 'deluser', device.ip, userId, timestamp].join('|');
      return userInput.toLowerCase();
    });
    return _messages;
  }

  onSuccessDeleteDeviceUser(response){
    this.getDeviceUsers({ page: this.currentPage, ...this.searchForm.value })
  }

  onCompanySelect(company:any){
  }

  onStatusSelect(item:any){

  }

  pageChanged(page) {
    this.getDeviceUsers({ page: page, ...this.searchForm.value })
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
    delete formData['companyId'];
    this.getDeviceUsers(formData)
  }

}
