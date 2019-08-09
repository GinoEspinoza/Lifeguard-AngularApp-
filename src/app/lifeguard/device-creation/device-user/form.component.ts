import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalAuthService, AlertService, LocalMqttService } from './../../services';
import { OFFICE_DROPDOWN_SETINGS, DEVICE_DROPDOWN_SETINGS, COMPANY_DROPDOWN_SETINGS,LOCK_DROPDOWN_MULTI_SETINGS, MULTI_ZONE_DROPDOWN_SETINGS , GROUP_DROPDOWN_MULTI_SETTINGS } from './../../constants/drop-down.constants';
import { OfficeService } from '../offices/office.service';
import { CompanyService } from '../companies/company.service';
import { ZoneService } from '../zones/zone.service';
import { DeviceUserService } from './device-user.service';
import { Input } from '@angular/core';
import { IMqttMessage } from 'ngx-mqtt';
import { LockService } from '../locks/lock.service';
import { GroupService } from '../../groups/group.service';
import * as _ from "lodash";

@Component({
  selector: 'app-device-user',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class DeviceUserFormComponent implements OnInit {

  deviceUserForm: FormGroup;
  returnUrl: string;
  dropdownList = [];

  companySelectedItems = [];
  officeDropdownList = [];
  officeDropdownSettings = {};
  companyDropdownSettings = {};
  lockDropdownMultiSettings = {};
  groupDropdownMultiSettings = {};
  zoneDropdownSettings = {};
  deviceDropdownSettings = {};
  zoneDropdownList = [];
  deviceDropdownList = [];
  selectedItems = [];
  selectedZones = [];
  officeSelectedItems = [];
  deviceSelectedItems = [];
  zoneSelectedItems = [];
  lockSelectedItems = [];
  lockDropdownList = [];
  groupSelectedItems = [];
  groupDropdownList = [];
  selectedLock;
  selectedCompany;
  selectedOffice;
  selectedDevice;
  selectedGroup;
  companyList:any;
  lock:any;
  ip:any;
  lockId:any;
  groupId:any;
  subscription:any;
  message:any;
  mqttData:any;
  deviceUserId:any;
  clientId = '_' + Math.floor(Math.random()*1E16);
  timestamp = Date.now();
  deviceUser:any;
  messages = [];
  responses = [];
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
    private deviceUserService: DeviceUserService,
    private localMqttService: LocalMqttService,
    private authService: LocalAuthService,
    private groupService: GroupService,
  ) {
    this.companyDropdownSettings = COMPANY_DROPDOWN_SETINGS;
    this.officeDropdownSettings = OFFICE_DROPDOWN_SETINGS;
    this.zoneDropdownSettings = MULTI_ZONE_DROPDOWN_SETINGS;
    this.lockDropdownMultiSettings = LOCK_DROPDOWN_MULTI_SETINGS;
    this.groupDropdownMultiSettings = GROUP_DROPDOWN_MULTI_SETTINGS;
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.deviceUserForm = this.formBuilder.group({
      companyId:       ['', Validators.required],
      officeId:        ['', Validators.required],
      zoneId:          ['', Validators.required],
      lockId:          ['', Validators.required],
      groupId:          [''],
      deviceUserId:    ['', Validators.required],
      refDeviceUserId: ['', Validators.required],
      deviceUserFName: ['', Validators.required],
      deviceUserLName: ['', Validators.required],
      status:          [false, Validators.required],
      pin:             ['', Validators.required]
    });

    if (id !== null && id !== undefined){
      this.deviceUserId = id;
      this.getDeviceUser(id);
    } else {
      this.loadPermittedData();
    }
    this.subscription = this.localMqttService.observe('device/neosoft').subscribe();
    if (this.authService.isAdmin()) {
      this.getCompanies();
    }
  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
    clearInterval(this.interval);
  }

  loadPermittedData() {
    if (this.authService.currentCompany()) {
      this.selectedCompany = this.authService.currentCompany();
      this.selectedItems = [this.selectedCompany];
      this.getCompanyOffices(this.selectedCompany);
      this.getCompanyGroups({ per_page: -1,company_id:this.selectedCompany.id });
      this.deviceUserForm.patchValue({
        companyId: this.selectedCompany.id
      })
    }
  }

  subscribeMQTTChannel(channel: string){
    return this.localMqttService.observe(`device/${channel}`)
    .subscribe((message: IMqttMessage) => {
      this.message = message.payload.toString();
      this.mqttData = JSON.parse(this.message);
      console.log(this.mqttData);
      if (this.clientId != this.mqttData['client-id']){
        return
      }
      if (this.mqttData["response-code"] != 0) {
        let errorMessage = "Error adding user to the device. Please try again.";
        this.mqttData = false;
        clearInterval(this.interval);
        this.alertService.error(errorMessage);
      }
      if(this.responses.filter(response => response['lock-name'] == this.mqttData['lock-name']).length == 0 && this.mqttData["response-code"] == 0) {
        this.responses.push(this.mqttData);
      }
    })
  }

  // convenience getter for easy access to form fields
  get f() { return this.deviceUserForm.controls; }

  onSubmit(formData) {
    // stop here if form is invalid
    if (this.isFormInvalid()) {
      return;
    }
    formData.status = formData.status ? 1 : 0
    this.messages = this.getMqttInput(formData)
    console.log(this.messages);
    let channel = this.selectedCompany.channel_name.toLowerCase();
    this.subscription.unsubscribe();
    this.subscription = this.subscribeMQTTChannel(channel);
    this.responses = [];
    if (this.messages.length > 0) {
      this.messages.map((message)=> {
        this.localMqttService.unsafePublish(`web/${channel}`, message);
      })
    }
    let intervalCounter = 0;
    this.interval = setInterval(()=> {
      intervalCounter = intervalCounter + 1;
      if (this.responses.length == this.messages.length) {
        clearInterval(this.interval);
        this.sendData(formData);
      } else if (intervalCounter == 10) {
        clearInterval(this.interval);
        this.alertService.error('Sorry, we were unable to connect to the devices. Please try again later or contact support.')
      }
    }, 1000);
    // this.sendData(formData);
  }

  getMqttInput(deviceUser:any){
    let userInput : string;
    let company = this.selectedCompany.channel_name;
    let office = this.selectedOffice.name;
    let userId = deviceUser.deviceUserId;
    let refUserId = deviceUser.refDeviceUserId;
    let userName = (deviceUser.deviceUserFName + deviceUser.deviceUserLName).substr(0, 15);
    let status = deviceUser.status;
    let pin = deviceUser.pin;
    let _messages = this.lockSelectedItems.map( (device)=> {
      let timestamp = Date.now();
      let zone = device.zone.name;
      userInput = [this.clientId, company, office, zone, device.device_name, 'adduser', device.ip, userId, refUserId, userName, status, pin, timestamp].join('|');
      return userInput.toLowerCase();
    });
    return _messages;
  }

  sendData(formData){
    formData.companyId = this.selectedCompany.id;
    formData.lockId = this.lockSelectedItems.map(({ id }) => id);
    formData.groupId = this.groupSelectedItems.map(({ id }) => id);

    if (this.deviceUser == undefined){
      this.deviceUserService.create(formData).subscribe(
        response => {
          let id = response.data.id
          this.alertService.success(response['message'])
          this.router.navigate(['/lifeguard/device-users/'+ id ]);
        },
        error => {
          this.alertService.error(error['error']['message']);
        });
    } else {
      this.deviceUserService.update( this.deviceUser, formData).subscribe(
        response => {
          let id = response.data.id
          this.alertService.success(response['message'])
          this.router.navigate(['/lifeguard/device-users/'+ id ]);
        },
        error => {
          this.alertService.error(error['error']['message'])
        }
      );
    }
  }

  getDeviceUser(id: any): any {
    this.deviceUserService.getDeviceUser(id).subscribe(
      response => {
        this.onSucessGetDeviceUser(response);
      },
      error => { this.onErrorGetDeviceUser(error); }
    );
  }

  onSucessGetDeviceUser(response){
    this.deviceUser = response.data
    this.populatedFormValues(response.data)
  }

  onItemSelectOffice(office){
    this.officeSelectedItems = [];
    this.selectedZones = [];
    this.selectedOffice = office;
    this.zoneDropdownList = [];
    this.zoneSelectedItems = [];
    this.lockSelectedItems=[]
    this.selectedLock = undefined;
    this.officeSelectedItems.push(office);
    this.getOfficeZones(office);
  }

  getOfficeZones(office){
    this.deviceUserService.getZonesHavingLocks(office).subscribe(
      response => { this.onSucessGetZones(response); },
      error => { this.onErrorGetDeviceUser(error); }
    );
  }

  onItemSelectCompany(company){
    this.selectedOffice = undefined;
    this.selectedZones = [];
    this.selectedLock = undefined;
    this.deviceSelectedItems = [];
    this.officeSelectedItems = [];
    this.officeDropdownList = [];
    this.zoneDropdownList = [];
    this.zoneSelectedItems = [];
    this.groupDropdownList = [];
    this.groupSelectedItems = [];
    this.deviceDropdownList=[];
    this.selectedCompany = company;
    this.getCompanyOffices(company);
    this.getCompanyGroups({ per_page: -1,company_id:company.id });
  }

  getCompanies(){
    this.deviceUserService.getCompaniesHavingLocks().subscribe(
      response => { this.onSucessGetCompanies(response); },
      error => { this.onErrorGetDeviceUser(error); }
    );
  }
  getCompanyGroups(params) {
    this.groupService.getGroups(params).subscribe(
      response => {
        this.groupDropdownList = response['data'];
        console.log("groups are" , this.groupDropdownList);
      },
      error => { this.onErrorGetGroupList(error); }
    );
  }
  onErrorGetGroupList(error){
    this.alertService.error(error['error']['message'])
  }
  OnItemDeSelect(item:any){
    this.selectedCompany = undefined;
    this.selectedOffice = undefined;
    this.selectedZones = [];
    this.deviceSelectedItems = [];
    this.officeSelectedItems = [];
    this.officeDropdownList = [];
    this.zoneDropdownList = [];
    this.zoneSelectedItems = [];
    this.lockDropdownList=[];
    this.lockSelectedItems=[];
    this.groupDropdownList = [];
    this.groupSelectedItems = [];
    this.selectedLock = undefined;
  }

  onItemDeSelectOffice(item:any){
    this.selectedZones = [];
    this.zoneDropdownList = [];
    this.zoneSelectedItems = [];
    this.lockDropdownList=[];
    this.lockSelectedItems=[]
    this.selectedLock = undefined;
  }

  onItemSelectZone(zone:any){
    // this.zoneSelectedItems=[]
    this.lockDropdownList=[];
    this.lockSelectedItems=[]
    this.selectedLock = undefined;
    // this.zoneSelectedItems.push(zone)
    // this.selectedZones.push(zone);
    this.getCompanyDevices(this.zoneSelectedItems);
    this.zoneSelectedItems.forEach(zone => {
      if(this.deviceUser){
        var lock = this.deviceUser.locks.filter( lock => { return lock.zone.id == zone.id} );
        if(lock[0])
          this.lockSelectedItems = this.lockSelectedItems.concat(lock);
      }
    });
  }

  onItemDeSelectZone(zone:any){
    // this.zoneSelectedItems=[]
    this.lockDropdownList=[];
    this.lockSelectedItems=[]
    // this.selectedLock = undefined;
    if (this.zoneSelectedItems.length > 0) {
      this.getCompanyDevices(this.zoneSelectedItems);
      this.zoneSelectedItems.forEach(zone => {
        var lock = this.deviceUser.locks.filter( lock => { return lock.zone.id == zone.id} );
        if(lock[0])
          this.lockSelectedItems = this.lockSelectedItems.concat(lock);
      });
    } else {
      this.lockDropdownList = [];
    }
  }

  getCompanyOffices(company){
    this.deviceUserService.getOfficesHavingLocks(company).subscribe(response => { this.onSucessGetOffices(response); },
      error => { this.onErrorGetDeviceUser(error); }
    );
  }

  onSucessGetDevices(response){
    this.lockDropdownList= response.data;
    if(this.lock){
      this.deviceDropdownList.push(this.selectedDevice);
    }
  }

  getCompanyDevices(zones){
    this.deviceUserService.getZoneDevicesHavingLocks(zones).subscribe(
      response => { this.onSucessGetDevices(response); },
      error => { this.onErrorGetDeviceUser(error); }
    );
  }

  onErrorGetDeviceUser(error){
    this.alertService.error(error['error']['message'])
  }


  onSucessGetCompanies(response){
    this.dropdownList = response.data
  }

  onSucessGetOffices(response){
    this.officeDropdownList = response.data
  }

  onSucessGetZones(response){
    this.zoneDropdownList = response.data
  }

  getCompanyDevicesMulti(device){
    this.lockSelectedItems = device
  }

  populatedFormValues(deviceUser){
    this.getCompanies();
    this.selectedCompany = deviceUser.company;
    this.selectedItems.push(deviceUser.company);
    this.getCompanyOffices(this.selectedCompany);
    // using office from first lock since all of them will belong to same office.
    if (deviceUser.locks[0]) {
      this.officeSelectedItems.push(deviceUser.locks[0].office);
      this.selectedOffice = deviceUser.locks[0].office;
      this.getOfficeZones(deviceUser.locks[0].office);
    }
    this.zoneSelectedItems = _.uniqBy(deviceUser.locks.map((lock)=> lock.zone), 'id');
    if (this.zoneSelectedItems[0]) {
      this.getCompanyDevices(this.zoneSelectedItems);
    }
    this.selectedDevice = deviceUser.locks.map( (lock) => {
      return {
        id: lock.id,
        ip: lock.ip,
        device_name: lock.device_name,
        zone: lock.zone
      };
    })
    this.getCompanyGroups({ per_page: -1,company_id:this.selectedCompany.id });
    this.selectedGroup = deviceUser.groups;
    this.lockSelectedItems = this.selectedDevice;
    this.groupSelectedItems = this.selectedGroup;
    this.deviceUserForm.patchValue({
      deviceUserId: deviceUser.device_user_id,
      refDeviceUserId: deviceUser.ref_device_user_id,
      deviceUserFName: deviceUser.device_user_fname,
      deviceUserLName: deviceUser.device_user_lname,
      status: deviceUser.status == '1',
      pin: deviceUser.pin,
      companyId: this.selectedItems,
      officeId: this.officeSelectedItems,
      zoneId: this.zoneSelectedItems,
      lockId: this.lockSelectedItems,
      groupId: this.groupSelectedItems,
    })
  }

  isFormInvalid(){
    if(this.deviceUserForm.invalid || this.selectedItems.length === 0 ||this.officeSelectedItems.length === 0 || this.zoneSelectedItems.length === 0 || this.lockSelectedItems.length === 0){
      return true;
    } else {
      return false;
    }
  }

  onItemSelectLock(lock:any) { }

  onItemDeSelectLock(lock) { }

  onItemSelectGroup(lock:any) { }

  onItemDeSelectGroup(lock) { }

  generateID() {
    this.deviceUserService.generateID().subscribe(
      response=> {
        this.deviceUserForm.patchValue({
          deviceUserId: response['device_user_id'],
          refDeviceUserId: response['device_user_id'],
          pin: response['device_user_id'],
        });
      }),
      error=> { this.onErrorGetDeviceUser(error) }
  }

}
