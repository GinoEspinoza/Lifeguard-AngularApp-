import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalAuthService, AlertService, LocalMqttService } from './../services';
import { COMPANIES, COMPANY_DROPDOWN_SETINGS, OFFICE_DROPDOWN_SETINGS, ZONE_DROPDOWN_SETINGS, DEVICE_DROPDOWN_SETINGS } from './../constants/drop-down.constants';
import { LockService } from '../device-creation/locks/lock.service';
import { CompanyService } from '../device-creation/companies/company.service';
import { ZoneService, OfficeService } from '..';
import { MqttService, IMqttMessage } from 'ngx-mqtt';
import { HistoryService } from '../user-events/history.service';
import {
  NORMALIZED_DOOR_COMMAND,
  UNLOCK_DOOR_COMMAND,
  LOCK_DOOR_COMMAND,
  OPEN_DOOR_COMMAND
} from './door-command-constants';

import { DoorUnlockService } from './door-unlock.service'
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
@Component({
  selector: 'app-door-unlock',
  templateUrl: './door-unlock.component.html',
  styleUrls: ['./door-unlock.component.css']
})
export class DoorUnlockComponent implements OnInit {
  model = {
    left: true,
    middle: false,
    right: false
  };
  doorUnlockForm: FormGroup;
  returnUrl: string;
  companyDropdownList = [];
  companySelectedItems = [];
  officeDropdownList = [];
  officeDropdownSettings = {};
  companyDropdownSettings = {};
  zoneDropdownSettings = {};
  deviceDropdownSettings = {};
  zoneDropdownList = [];
  deviceDropdownList = [];
  selectedItems = [];
  officeSelectedItems = [];
  deviceSelectedItems = [];
  zoneSelectedItems = [];
  selectedCompany;
  selectedOffice;
  selectedZone;
  selOfficeId = 0;
  selZoneId = 0;
  selectedDevice = [];
  deviceModel = {};
  companyList:any;
  lock:any;
  ip:any;
  lockId:any;
  companySelected:any;
  subscription:any;
  message:any;
  mqttData:any;
  clientId = '_' + Math.floor(Math.random()*1E16);
  timestamp = Date.now();
  msg = this.clientId;
  ipPattern = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/g
  unlockDoorCommand:string;
  lockDoorCommand:string;
  openDoorCommand:string;
  normalizedDoorCommand:string;
  stop_interval = false;
  interval;


  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private lockService: LockService,
    private alertService: AlertService,
    private companyService: CompanyService,
    private zoneService: ZoneService,
    private officeService: OfficeService,
    private _mqttService: MqttService,
    private localMqttService: LocalMqttService,
    private doorUnlockService: DoorUnlockService,
    private historyService: HistoryService,
    private authService: LocalAuthService,
    private spinnerService: Ng4LoadingSpinnerService
  ) {
    this.loadPermittedData()
    this.companyDropdownSettings = COMPANY_DROPDOWN_SETINGS;
    this.officeDropdownSettings = OFFICE_DROPDOWN_SETINGS;
    this.zoneDropdownSettings = ZONE_DROPDOWN_SETINGS;
    this.deviceDropdownSettings = DEVICE_DROPDOWN_SETINGS;
    this.unlockDoorCommand = UNLOCK_DOOR_COMMAND;
    this.lockDoorCommand = LOCK_DOOR_COMMAND;
    this.openDoorCommand = OPEN_DOOR_COMMAND;
    this.normalizedDoorCommand = NORMALIZED_DOOR_COMMAND;
  }

  ngOnInit() {
    this.doorUnlockForm = this.formBuilder.group({
      ip: ['',  Validators.compose([Validators.required, Validators.pattern(this.ipPattern)])]
    });
    this.subscription = this.localMqttService.observe('device/neosoft').subscribe()
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  loadPermittedData() {
    if (this.authService.isAdmin()) {
      this.getCompaniesHavingLockes();
    }
    if (this.authService.currentCompany()) {
      this.selectedCompany = this.authService.currentCompany();
      this.selectedItems = [this.selectedCompany];
      this.getCompanyOffices(this.selectedCompany);
    }
  }

  subscribeMQTTChannel(company: string){
    return this.localMqttService.observe(`device/${company}`)
    .subscribe((message: IMqttMessage) => {
      this.message = message.payload.toString();
      this.mqttData = JSON.parse(this.message);
      console.log(this.mqttData);
      if(this.mqttData == false){
        return
      }
      if (this.clientId != this.mqttData['client-id']){
        return
      }
      if (this.mqttData["response-code"]) {
        this.mqttData = false;
        this.alertService.error("Sorry, we were unable to connect to the hub.");
      }
      console.log('received::', this.mqttData);
    })
  }

  // convenience getter for easy access to form fields
  get f() { return this.doorUnlockForm.controls; }

  onSubmit(formData) {
    // stop here if form is invalid
    if (this.isFormInvalid()) {
        return;
    }

    // this.msg = this.msg.replace('@@@', this.selectedDevice.device_name).toLowerCase();
    this.unsafePublish('web/neosoft', this.msg.toString());

    this.sendData(formData);
  }


  public unsafePublish(topic: string, message: string): void {
    this._mqttService.unsafePublish(topic, message, {qos: 1, retain: true});
  }


  sendData(formData){
    formData.companyId = this.selectedCompany.id;
    formData.officeId = this.selectedOffice.id;
    formData.zoneId = this.selectedZone.id;
    // formData.deviceId = this.selectedDevice.id;

    if (this.lock == undefined){
        this.lockService.create(formData)
        .subscribe(
        response => {
          let id = response.data.id
          this.router.navigate(['/lifeguard/locks/'+ id ]);
        },
        error => {
          this.alertService.error(error['error']['message']);
        });
    } else {
        this.lockService.update( this.lock, formData)
    .subscribe(
      response => {
        let id = response.data.id
        this.router.navigate(['/lifeguard/locks/'+ id ]);
      },
      error => {
        this.alertService.error(error['error']['message']);
      });
    }
  }

  onItemSelectOffice(office){
    this.officeSelectedItems = [];
    this.selectedZone = undefined;
    this.selectedOffice = office;
    this.zoneDropdownList = [];
    this.zoneSelectedItems = [];
    this.selOfficeId = office.id;
    // this.officeSelectedItems = office;
    this.officeSelectedItems.push(office);
    this.getOfficeZones(office);
  }

  onItemSelectCompany(company){
    console.log("company" , company);
    this.selectedOffice = undefined;
    this.selectedZone = undefined;
    this.deviceSelectedItems = [];
    this.officeSelectedItems = [];
    this.officeDropdownList = [];
    this.zoneDropdownList = [];
    this.zoneSelectedItems = [];
    this.deviceDropdownList=[];
    this.selectedCompany = company;
    this.companySelected = company;
    this.selOfficeId = 0;
    this.selZoneId = 0;
    this.getCompanyOffices(company);
  }


  onZoneSelect(item:any){
    this.selectedZone = item;
  }

  getCompaniesHavingLockes(){
    this.doorUnlockService.getCompaniesHavingLockes().subscribe(response => {
      this.onSucessGetCompanies(response); },
    error => { this.onErrorGetLock(error); }
    );
  }

  getCompanyOffices(company){
    this.doorUnlockService.getCompanyOfficesHavingLocks(company).subscribe(response => {
      this.onSucessGetOffices(response); },
    error => { this.onErrorGetLock(error); }
    );
  }

  getOfficeZones(office){
    this.doorUnlockService.getOfficeZonesHavingLocks(office).subscribe(response => {
      this.onSucessGetZones(response); },
    error => { this.onErrorGetLock(error); }
    );
  }

  getCompanyDevices(zone){
    this.doorUnlockService.getZoneDevicesHavingLocks(zone).subscribe(response => {
      this.onSucessGetDevices(response); },
    error => { this.onErrorGetLock(error); }
    );
  }

  OnItemDeSelect(item:any){
    this.selectedCompany = undefined;
    this.selectedOffice = undefined;
    this.selectedZone = undefined;
    this.deviceSelectedItems = [];
    this.officeSelectedItems = [];
    this.officeDropdownList = [];
    this.zoneDropdownList = [];
    this.zoneSelectedItems = [];
    this.deviceDropdownList=[];
  }

  onItemDeSelectOffice(item:any){
    this.selectedZone = undefined;
    this.zoneDropdownList = [];
    this.zoneSelectedItems = [];
  }

  onItemSelectZone(zone:any){
    this.selectedZone = zone;
    this.zoneSelectedItems=[];
    this.zoneSelectedItems.push(zone);
    this.selZoneId = zone.id;
    this.getCompanyDevices(zone);
  }

  onItemDeSelectZone(zone:any){
    this.zoneSelectedItems=[]
  }

  onSucessGetDevices(response){
    this.deviceDropdownList= response.data;
    this.selectedDevice = [];
    this.deviceModel = {
    };
    // if(this.lock){
    //   this.deviceDropdownList.push(this.selectedDevice);
    // }
  }

  onErrorGetLock(error){
    this.alertService.error(error['error']['message']);
  }


  onSucessGetCompanies(response){
    this.companyDropdownList = response.data
  }

  onSucessGetOffices(response){
    this.officeDropdownList = response.data
  }

  onSucessGetZones(response){
    this.zoneDropdownList = response.data
   }

  isFormInvalid(){
    if(this.doorUnlockForm.invalid || this.selectedItems.length === 0 ||this.officeSelectedItems.length === 0 || this.zoneSelectedItems.length === 0 || this.deviceSelectedItems.length === 0){
      return true;
    } else {
      return false;
    }
  }

  onItemSelectDevice(device){
    // this.deviceSelectedItems=[]
    if (!this.selectedDevice.some((item) => item.id == device.id)) {
      this.selectedDevice.push(device);
      this.refreshDeviceModel();
      return;
    }else{
      var index = this.selectedDevice.indexOf(device);
      this.selectedDevice.splice(index, 1);
      this.refreshDeviceModel();
    }
    console.log("selected device",this.selectedDevice);
    // this.deviceSelectedItems.push(device)
  }

  onItemDeSelectDevice(device){
    this.deviceSelectedItems=[]
    this.selectedDevice = [];
  }
  onDeviceSelectAll(){
    this.selectedDevice = [...this.deviceDropdownList];
    this.refreshDeviceModel();
  }
  refreshDeviceModel(){
    this.deviceModel = {};
    this.selectedDevice.forEach((device)=>{
      this.deviceModel[device.id] = true;
    });
  }
  onClick(cmd:any){
    this.mqttData = null;
		this.stop_interval = false;
    let message = this.getMQTTInput(cmd);
    let companyName = this.selectedCompany.channel_name.toLowerCase();
    this.unsafePublish(`web/${companyName}`, message);
    this.subscription.unsubscribe();
    this.subscription = this.subscribeMQTTChannel(companyName);
    this.spinnerService.show();
    this.alertService.clearAlert();
    let intervalCounter = 0;
    this.interval = setInterval(()=> {
      intervalCounter = intervalCounter + 1;
      if (this.mqttData && !this.stop_interval) {
        if (this.clientId == this.mqttData['client-id'] && this.mqttData["result"] == 1) {
					clearInterval(this.interval);
          this.spinnerService.hide();
          this.alertService.success('Success!')
          this.selectedDevice.forEach((device) => {
            let userId = this.authService.currentUser()['id'];
            this.historyService.addHistory(userId, 'Manage Door', cmd+" "+device.device_name).subscribe(response => {
              },
              error => {
              }
            );
          })
        }else if(this.clientId == this.mqttData['client-id'] && this.mqttData["result"] == 0){
					clearInterval(this.interval);
					this.spinnerService.hide();
					this.alertService.error('Sorry, we were unable to connect to the device.Please try again.')
				}
      } else if (intervalCounter == 10) {
				clearInterval(this.interval);
				this.spinnerService.hide();
        this.alertService.error('Sorry, we were unable to connect to the hub.Please try again.')
      }
    }, 1000);
  }

  getMQTTInput(command:any){
    let doorInput : string;
    let zone = this.selectedZone.name;
    let office = this.selectedOffice.name;

    let company = this.selectedCompany.channel_name;
    let device_name = "lock";
    let ip_list = [];
    this.selectedDevice.forEach((device) => {
      ip_list.push(device.ip);
    })
    let ips = ip_list.join("&");
    let timestamp = Date.now();

    // this.clientId + '|neosoft|rabale|php|lock1|CMD|IP|TIMESTAMP'
    doorInput = this.clientId + '|' +company + '|' + office + '|' + zone + '|' + device_name + '|' + command + '|' + ips + '|' + timestamp

    console.log('Door Input',doorInput)
    return doorInput.toLowerCase();
  }

}
