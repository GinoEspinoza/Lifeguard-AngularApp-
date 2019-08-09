import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalAuthService, AlertService, LocalMqttService } from '../services';
import {
  COMPANY_DROPDOWN_SETINGS,
  OFFICE_DROPDOWN_SETINGS,
  ZONE_DROPDOWN_SETINGS,
  DEVICE_DROPDOWN_SETINGS,
  ENROLL_FINGER_DROPDOWN_SETINGS,
  ENROLL_MODE_DROPDOWN_SETINGS,
  ENROLL_DEVICE_DROPDOWN_SETINGS
} from '../constants/drop-down.constants';
import { EnrollmentConfigurationService } from './enrollment-configuration.service';
import { CompanyService } from '..';
import { ZoneService, OfficeService } from '..';
import { LockService } from '../device-creation/locks/lock.service';
import { DeviceUserService } from '../device-creation/device-user/device-user.service';
import { ENROLL_FINGER_COUNT, ENROLL_MODE } from './enrollment.constants';
import { DoorUnlockService } from '../door-unlock/door-unlock.service'
import { IMqttMessage } from 'ngx-mqtt';
import { Observable } from 'rxjs';

import {
  API_DOMAIN
} from '../api.constants';

import { mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-enrollment-configuration-form',
  templateUrl: './enrollment-configuration-form.component.html'
})
export class EnrollmentConfigurationFormComponent implements OnInit {

  enrollUserForm: FormGroup;
  returnUrl: string;
  companyDropdownList = [];
  officeDropdownList = [];
  zoneDropdownList = [];
  deviceDropdownList = [];
  selectedItems = [];
  selectedCompany: any;
  selectedZone: any;
  officeSelectedItems = [];
  zoneSelectedItems = [];
  deviceSelectedItems = [];
  companyDropdownSettings = {};
  officeDropdownSettings = {};
  zoneDropdownSettings = {};
  deviceDropdownSettings = {};
  enrollModeDropdownSettings = {};
  enrollFingerDropdownSettings = {};
  deviceList =  [];
  selectedDevice;
  assignDevice:any;
  ip:any;
  assignDeviceId:any;
  companySelected:any;
  subscription:any;
  message:any;
  enrollModes = [];
  enrollFingerCounts = [];
  fingerCountVisible: boolean = true;
  enrollFingerNumberSelected = [ENROLL_FINGER_COUNT[0]];
  enrollSelectedMode = [ENROLL_MODE[2]];
  enrolledUser: any;
  employeeName: string = '';
  deviceUserId: number;
  clientId = '_' + Math.floor(Math.random()*1E16);
  dataSource: Observable<any>;
  userNamenoResult = false;
  selectedEnrollMode;
  selectedEnrollDevice;
  enrollDeviceDropdownSettings = {};
  enrollDeviceSelectedItems = [];
  command : any;
  enrollDeviceDropdownList = [];

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private enrollmentConfigurationService: EnrollmentConfigurationService,
    private alertService: AlertService,
    private authService: LocalAuthService,
    private companyService: CompanyService,
    private officeService: OfficeService,
    private lockService: LockService,
    private localMqttService: LocalMqttService,
    private doorUnlockService: DoorUnlockService,
    private deviceUserService: DeviceUserService,
  ) {
    this.companyDropdownSettings = COMPANY_DROPDOWN_SETINGS;
    this.officeDropdownSettings = OFFICE_DROPDOWN_SETINGS;
    this.zoneDropdownSettings = ZONE_DROPDOWN_SETINGS;
    this.deviceDropdownSettings = DEVICE_DROPDOWN_SETINGS;
    this.enrollModes = ENROLL_MODE;
    this.enrollFingerCounts = ENROLL_FINGER_COUNT;
    this.enrollModeDropdownSettings =  ENROLL_MODE_DROPDOWN_SETINGS;
    this.enrollFingerDropdownSettings = ENROLL_FINGER_DROPDOWN_SETINGS;
    this.enrollDeviceDropdownSettings = ENROLL_DEVICE_DROPDOWN_SETINGS;
    this.dataSource = Observable.create((observer: any) => {
      observer.next(this.employeeName);
    }).pipe(
      mergeMap((token: string) => this.getDeviceNamesAsObservable(token))
    );
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.enrollUserForm = this.formBuilder.group({
      userName: ['',  Validators.required],
      smartCardNumber: ['']
    });
    if (id !== null && id !== undefined){
      this.enrolledUser = id;
      this.getEnrolledUser(id);
    } else {
      this.loadPermittedData()
    };
    if (this.authService.isAdmin()) {
      this.getCompaniesHavingLockes();
    }
    this.subscription = this.localMqttService.observe('device/neosoft').subscribe()
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  loadPermittedData() {
    if (this.authService.currentCompany()) {
      this.selectedCompany = this.authService.currentCompany();
      this.selectedItems.push(this.selectedCompany);
      this.getCompanyOffices(this.selectedCompany);
      this.getEnrollLocks({ company_id:this.selectedCompany.id,type:2,page: -1 });
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.enrollUserForm.controls; }

  onSubmit(formData) {
    // stop here if form is invalid
    if (this.isFormInvalid()) {
      return;
    }
    let message;
    if (formData.smartCardNumber) {
      message = this.getMqttCredentialInput(formData)
    } else {
      message = this.getMqttEnrollInput(formData)
    }
    let companyName = this.selectedCompany.channel_name.toLowerCase();
    console.log(message);
    this.localMqttService.unsafePublish(`web/${companyName}`, message);
    this.subscription.unsubscribe();
    this.subscription = this.subscribeMQTTChannel(companyName);
    // this.sendData(formData);

  }

  getMqttCredentialInput(formData){
    let company = this.selectedCompany.channel_name;
    let office = this.officeSelectedItems[0].name;
    let zone = this.selectedZone.name;
    let device = this.selectedDevice.device_name;
    let ip = this.selectedDevice.ip
    let timestamp = Date.now();
    let command = 'setusercreds';
    this.command = command;
    let _enrollFingerNumberSelected = '';
    let data = [
      this.deviceUserId,
      '2', // hard coding to 2 for smart card
      formData.smartCardNumber
    ];

    let message = [this.clientId, company, office, zone,
                device, command, ip, ...data, timestamp
              ].join('|')

    return message.toLowerCase();
  }

  getMqttEnrollInput(formData){
    let doorInput : string;
    let company = this.selectedCompany.channel_name;
    let office = this.officeSelectedItems[0].name;
    let zone = this.selectedZone.name;
    let device = this.selectedDevice.device_name;
    let ip = this.selectedDevice.ip
    let timestamp = Date.now();
    let command = 'enrolluser';
    this.command = command;
    let _enrollFingerNumberSelected = '';
    let data = [this.deviceUserId, this.enrollSelectedMode[0].id];
    if (this.fingerCountVisible) {
      data[2] = this.enrollFingerNumberSelected[0].id;
    }

    let message = [this.clientId, company, office, zone,
                device, command, ...data, ip, timestamp
              ].join('|')

    return message.toLowerCase();
  }
  getMqttCardInput(){
    let company = this.selectedCompany.channel_name;
    let office = this.officeSelectedItems[0].name;
    let zone = this.selectedZone.name;
    let device = this.selectedEnrollDevice.device_name;
    let ip = this.selectedEnrollDevice.ip
    let timestamp = Date.now();
    let command = 'getcardnumber';
    this.command = command;
    let _enrollFingerNumberSelected = '';
    let data = [
      this.deviceUserId,
    ];

    let message = [this.clientId, company, office, zone,
                device, command, ip, ...data, timestamp
              ].join('|')

    return message.toLowerCase();
  }
  subscribeMQTTChannel(company: string){
    return this.localMqttService.observe(`device/${company}`)
    .subscribe((message: IMqttMessage) => {
      this.message = message.payload.toString();
      let mqttData = JSON.parse(this.message);
      if (this.clientId != mqttData['client-id']){
        return
      }
      if (mqttData["response-code"] != 0) {
        mqttData = false;
        this.alertService.error("Sorry, we encountered an error processing your request. Please try again or contact support if problem persists.");
      }
      console.log('received::', mqttData);
      if(this.command == 'getcardnumber'){
        this.enrollUserForm.patchValue({
          smartCardNumber: mqttData["card1"],
        })
      }else{
        this.sendData(this.enrollUserForm.value);
      }
    })
  }

  sendData(formData){
    formData.companyId = this.selectedItems[0].id;
    formData.deviceId = this.deviceSelectedItems[0].id;
    formData.enrollMode = this.enrollSelectedMode[0].id;
    formData.deviceUserId = this.deviceUserId;
    formData.locksEnroll = formData.deviceId;
    if (this.fingerCountVisible) {
      this.fingerCountVisible = true;
      formData.enrollFingerCount = this.enrollFingerNumberSelected[0].id;
    }
    if (this.enrolledUser == undefined){
      this.enrollmentConfigurationService.create(formData).subscribe(
        response => {
          // let id = response.data.id;
          this.alertService.success(response['message']);
          this.router.navigate(['/lifeguard/enrollment-configurations/new']);
        },
        error => {
          this.alertService.error(error['error']['message']);
        }
      );
    }
  }

  getDeviceNamesAsObservable(token): Observable<any> {
    return this.deviceUserService.searchDeviceUser(this.employeeName)
  }

  userNameNoResults(event: boolean): void {
    this.userNamenoResult = event;
    this.deviceUserId = null;
  }

  onItemSelectCompany(company){
    this.officeSelectedItems = [];
    this.zoneSelectedItems = [];
    this.deviceSelectedItems = [];
    this.officeDropdownList = [];
    this.zoneDropdownList = [];
    this.deviceDropdownList=[];
    this.selectedCompany = company;
    this.companySelected = company;
    this.getCompanyOffices(company);
    this.getEnrollLocks({ company_id:company.id,type:2,page: -1 });
  }

  OnItemDeSelect(item:any){
    this.officeSelectedItems = [];
    this.officeDropdownList = [];
    this.zoneSelectedItems = [];
    this.zoneDropdownList = [];
    this.deviceSelectedItems = [];
    this.deviceDropdownList = [];
  }

  onItemSelectOffice(office){
    this.officeSelectedItems = [office];
    this.zoneDropdownList = [];
    this.zoneSelectedItems = [];
    this.getOfficeZones(office);
  }

  onItemDeSelectOffice(item:any){
    this.officeSelectedItems = [];
    this.zoneDropdownList = [];
    this.zoneSelectedItems = [];
    this.deviceSelectedItems = [];
    this.deviceDropdownList = [];
  }

  onItemSelectZone(zone:any){
    this.selectedZone = zone;
    this.zoneSelectedItems=[zone];
    this.getCompanyDevices(zone);
  }

  onItemDeSelectZone(item:any){
    this.zoneSelectedItems = [];
    this.deviceSelectedItems = [];
    this.deviceDropdownList = [];
  }

  userNameOnSelect(e): void {
    this.deviceUserId = e.item.device_user_id;
  }

  // onSuccessGetCompanies(response){
  //   this.dropdownList = response.data;
  // }

  onErrorGetLock(error){
    this.alertService.error(error['error']['message']);
  }

  getCompaniesHavingLockes(){
    this.doorUnlockService.getCompaniesHavingLockes().subscribe(response => { this.companyDropdownList = response['data']; },
      error => { this.onErrorGetLock(error); }
    );
  }

  getCompanyOffices(company){
    this.deviceUserService.getOfficesHavingLocks(company).subscribe(response => { this.officeDropdownList = response['data']; },
      error => { this.onErrorGetLock(error); }
    );
  }

  getOfficeZones(office){
    this.deviceUserService.getZonesHavingLocks(office).subscribe(
      response => { this.zoneDropdownList = response['data']; },
      error => { this.onErrorGetLock(error); }
    );
  }

  getCompanyDevices(company){
    this.doorUnlockService.getZoneDevicesHavingLocks(company).subscribe(
      response => { this.deviceDropdownList = response['data']; },
      error => { this.onErrorGetLock(error); }
    );
  }

  getEnrolledUser(id){
    this.companyService.getCompanyDevices(id).subscribe(
      response => { this.deviceDropdownList = response['data']; },
      error => { this.onErrorGetLock(error); }
    );
  }

  isFormInvalid(){
    if(this.enrollUserForm.invalid || this.selectedItems.length === 0 || this.deviceSelectedItems.length === 0 || this.enrollFingerNumberSelected.length === 0 || this.enrollSelectedMode.length === 0 || !this.deviceUserId){
      return true;
    } else {
      return false;
    }
  }

  onItemSelectDevice(device){
    this.selectedDevice = device;
  }

  onItemDeSelectDevice(device){
    this.deviceSelectedItems=[]
    this.selectedDevice = undefined;
  }

  onItemSelectEnrollFinger(data){
    console.log(data)
  }

  onItemDeSelectEnrollFinger(data){

  }

  onItemSelectEnrollMode(data:any){
    console.log(data)
    this.selectedEnrollMode = data.id;
    this.enrollUserForm.patchValue({smartCardNumber: null});
    if (data.id == 2 || data.id == 3) {
      this.fingerCountVisible = true;
    } else {
      this.fingerCountVisible = false;
    }
  }

  onItemSelectEnrollDevice(device){
    this.selectedEnrollDevice = device;
  }
  getEnrollLocks(params){
    this.lockService.getLocks(params).subscribe(response => {
      this.onSucessGeEnrolltLocks(response); },
    error => { this.onErrorGetEnrollLocks(error); }
    );
  }
  onSucessGeEnrolltLocks(response){
    this.enrollDeviceDropdownList = response['data'];
    // console.log("enroll device:",this.enrollDeviceDropdownList);
  }

  onErrorGetEnrollLocks(error){
    this.alertService.error(error['error']['message']);
  }
  onItemDeSelectEnrollDevice(device){
    this.enrollDeviceSelectedItems=[]
    this.selectedEnrollDevice = undefined;
  }
  onItemDeSelectEnrollMode(data){
    this.selectedEnrollMode = false;
    this.fingerCountVisible = false;
  }
  getCardNumber(){
    let message;
    message = this.getMqttCardInput();
    let companyName = this.selectedCompany.channel_name.toLowerCase();
    // console.log(message);
    this.localMqttService.unsafePublish(`web/${companyName}`, message);
    this.subscription.unsubscribe();
    this.subscription = this.subscribeMQTTChannel(companyName);
  }
}
