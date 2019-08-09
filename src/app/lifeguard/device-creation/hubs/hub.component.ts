import { Component, OnInit } from '@angular/core';
import { LocalAuthService, AlertService, LocalMqttService } from '../../services';
import { IMqttMessage } from 'ngx-mqtt';
import { LockService } from '../locks/lock.service';
import { Subscription, Subject, Observable } from 'rxjs';
import { HeartBeatService } from '../../heart-beat/heart-beat.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompanyService } from '../../device-creation/companies/company.service';
import { OfficeService } from '../offices/office.service';
import { OFFICE_DROPDOWN_SETINGS, COMPANY_DROPDOWN_SETINGS } from './../../constants/drop-down.constants';

@Component({
  selector: 'app-hub',
  templateUrl: './hub.component.html',
  styleUrls: ['./hub.component.css']
})
export class HubComponent implements OnInit {

  hubsList = [];
  subscription:Subscription;
  heartBeatsubscription:Subscription;
  interval;
  message:any;
  mqttData:any;
  searchForm: FormGroup;
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
  clientId = '_' + Math.floor(Math.random()*1E16);

  constructor(
    private alertService: AlertService,
    private authService: LocalAuthService,
    private lockService: LockService,
    private localMqttService: LocalMqttService,
    private heartBeatService: HeartBeatService,
    private formBuilder: FormBuilder,
    private companyService: CompanyService,
    private officeService: OfficeService,
  ) {
    this.companyDropdownSettings = COMPANY_DROPDOWN_SETINGS;
    this.officeDropdownSettings  = OFFICE_DROPDOWN_SETINGS;
    this.statusDropdownSettings = {
      singleSelection: true,
      labelKey:'name',
      text:"Select Status",
      classes:"myclass custom-class",
      noDataLabel: 'No Status Found.'
    };
  }

  ngOnInit() {
    this.getHubs({ page: -1 });
    this.subscription = this.localMqttService.observe('device/neosoft').subscribe();
    let topic = '#';
    if (this.authService.currentCompany()) {
      topic = this.authService.currentCompany()['channel_name'];
    }
    this.heartBeatService.heartBeatInit(topic);
    // this.subscription = this.subscribeMQTTChannel('dasi');
    this.heartBeatsubscription = this.heartBeatService.beatObserver$.subscribe( (beat) => {
        this.hubsList.filter( (hub) => {
          if(beat['type'] == 'hub' && hub.company_device.device.mac == beat['mac'] && hub.company.channel_name == beat['channel']) {
            hub.timestamp = beat['timestamp'];
          }
        })
      });
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

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.heartBeatService.heartBeatDestroy();
    clearInterval(this.interval);
  }

  getHubs(params) {
    this.lockService.getLocks({ device_type: 'Hub', ...params }).subscribe(
      response => { this.onSucessGetLocks(response); },
      error => { this.onErrorGetLocks(error); }
    );
  }

  getCompanies(){
    this.companyService.getCompanies({ per_page: -1 }).subscribe(
      response => {
        this.dropdownCompanyList = response['data'];
      },
      error => { this.onErrorGetLocks(error); }
    );
  }

  getCompanyOffices(company){
    this.officeService.getCompanyOffices(company).subscribe(
      response => { this.dropdownOfficeList = response.data; },
      error => { this.onErrorGetLocks(error); }
    );
  }

  // toggleMaintainanceMode(hub) {
  //   let message = this.getMqttInput(hub)
  //   console.log(message)
  //   let companyName = hub.company.channel_name.toLowerCase();
  //   this.subscription.unsubscribe();
  //   this.subscription = this.subscribeMQTTChannel(companyName);
  //   this.localMqttService.unsafePublish(`web/${companyName}`, message);

  //   let intervalCounter = 0;
  //   this.interval = setInterval(()=> {
  //     intervalCounter = intervalCounter + 1;
  //     if (this.mqttData) {
  //       clearInterval(this.interval);
  //       // hub.backdoor = this.mqttData['status'] == 'start' ? 'Stop' : 'Start';
  //       if (this.mqttData["code"] == 0 && this.mqttData['msg'] == 'Done') {
  //         hub.maintainance_mode = this.mqttData['status'] == 'start';
  //         // localStorage.setItem('hubs', JSON.stringify(this.hubsList));
  //         let text = this.mqttData['status'] == 'start' ? 'started' : 'stopped'
  //         this.alertService.clearAlert()
  //         this.alertService.success('Maintainance mode ' + text + ' for hub ' + hub.device_name + '.')
  //       }
  //     } else if (intervalCounter == 10) {
  //       clearInterval(this.interval);
  //       this.alertService.error('Sorry, we were unable to process your request. Please try again later or contact support.')
  //     }
  //   }, 1000);
  // }

  manageHUB(hub, cmd) {
    let message = this.getMqttInput(hub, cmd)
    console.log(message)
    let companyName = hub.company.channel_name.toLowerCase();
    this.subscription.unsubscribe();
    this.subscription = this.subscribeMQTTChannel(companyName);
    this.localMqttService.unsafePublish(`web/${companyName}`, message);

    let intervalCounter = 0;
    this.interval = setInterval(()=> {
      intervalCounter = intervalCounter + 1;
      this.alertService.clearAlert()
      if (this.mqttData) {
        clearInterval(this.interval);
        // hub.backdoor = this.mqttData['status'] == 'start' ? 'Stop' : 'Start';
        if (this.mqttData["code"] == 0 && this.mqttData['msg'] == 'Done') {
          let text;
          switch(this.mqttData['status']) {
            case 'start':{
              hub.maintainance_mode = true;
              text = 'Maintainance mode started for hub ' + hub.device_name + '.';
              break;
            }
            case 'stop': {
              hub.maintainance_mode = false;
              text = 'Maintainance mode stopped for hub ' + hub.device_name + '.';
              break;
            }
            case 'update': {
              text = hub.device_name + ': ' + this.mqttData['output']['git'];
              break;
            }
            case 'restartmqtt':{
              text = 'MQTT server of ' + hub.device_name + ' has been restarted successfully.';
              break;
            }
            case 'hubrestart':{
              text = hub.device_name + ' has been restarted successfully.';
              break;
            }
            case 'updatesource': {
              text = hub.device_name + ': ' + this.mqttData['output'];
              break;
            }
            default: {
              text = null;
              break;
            }
          }
          // localStorage.setItem('hubs', JSON.stringify(this.hubsList));
          this.alertService.success(text)
        }
      } else if (intervalCounter == 10) {
        clearInterval(this.interval);
        this.alertService.error('Sorry, we were unable to process your request. Please try again later or contact support.')
      }
    }, 1000);
  }

  getMqttInput(hub:any, cmd:string=null){
    let userInput : string;
    let company = hub.company.channel_name;
    let office = hub.office.name;
    let timestamp = Date.now();
    let mac = hub.company_device.device.mac.replace(/:/g, '')
    if (cmd == 'MaintainanceMode') {
      if (hub.maintainance_mode == false) {
        cmd = 'Start';
      } else if (hub.maintainance_mode == true) {
        cmd = 'Stop';
      } else { cmd = 'Start' }
    }
    userInput = this.clientId + '|' + company + '|' + office + '||hub|wcbg6|' + cmd + '|' + mac + '|' + timestamp;

    return userInput.toLowerCase();
  }

  subscribeMQTTChannel(company: string){
    return this.localMqttService.observe(`device/${company}`)
    .subscribe((message: IMqttMessage) => {
      this.message = message.payload.toString();
      console.log(this.message)
      this.mqttData = JSON.parse(this.message);
      if (this.clientId != this.mqttData['client-id']){
        return
      }
      if (this.mqttData["code"] != 0) {
        this.mqttData = false;
        clearInterval(this.interval);
        this.alertService.error("Sorry, we were unable to add this lock at the moment. Please contact support.");
      }
      console.log(this.mqttData)

    })
  }

  onSucessGetLocks(response){
    this.hubsList = response['data'];
    this.totalItems = response['total'];
    this.currentPage = response['current_page'];
    this.pageSize = response['per_page'];
  }

  onErrorGetLocks(error){
    this.alertService.error(error['error']['message']);
  }

  deleteHub(hub){
    this.lockService.delete(hub.id).subscribe(response => {
      this.onSuccessDeleteLock(response); },
    error => { this.OnErrorDeleteLock(error); }
    );
  }

  onSuccessDeleteLock(response){
    this.alertService.success('Hub deleted successfully.');
    this.getHubs({ page: this.currentPage, ...this.searchForm.value });
  }

  OnErrorDeleteLock(error){
    this.alertService.error(error['error']['message']);
  }

  getStatusIcon(hub) {
    let status = this.getStatus(hub);
    if (status == 'Online') {
      return 'fa-circle text-success';
    } else if(status == 'Offline') {
      return 'fa-circle text-warning';
    } else {
      return 'fa-refresh text-muted';
    }
  }

  getStatus(hub) {
    if (!hub.timestamp) {
      return null;
    }
    let timestamp:any = new Date(hub.timestamp + ' UTC');
    let now:any = new Date((new Date()).toUTCString());
    let diff = Math.abs(timestamp - now);
    diff = Math.floor((diff/1000)/60);
    if(diff > 1){
      return 'Offline';
    } else {
      return 'Online';
    }
  }

  getSimpleStatus(hub) {
    if (hub.status == 0) {
      return 'In Active'
    } else if (hub.status == 1) {
      return 'Active'
    } else if (hub.status == 2) {
      return 'Archived'
    }
  }

  onCompanySelect(company:any){
    this.getCompanyOffices(company);
  }

  onOfficeSelect(company:any){
  }

  onStatusSelect(item:any){

  }

  pageChanged(page) {
    this.getHubs({ page: page, ...this.searchForm.value })
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
    if(formData['status'] && formData['status'][0]) {
      formData['status'] = formData['status'][0]['id']
    } else {
      delete formData['status'];
    }
    delete formData['companyId'];
    delete formData['officeId'];
    this.getHubs(formData)
  }


}
