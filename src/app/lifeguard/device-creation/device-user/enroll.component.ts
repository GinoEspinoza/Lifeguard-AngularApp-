import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalAuthService, AlertService, LocalMqttService } from '../../services';
import { LockService } from '../locks/lock.service';
import {
  ZONE_DROPDOWN_SETINGS,
  DEVICE_DROPDOWN_SETINGS,
  ENROLL_FINGER_DROPDOWN_SETINGS,
  ENROLL_MODE_DROPDOWN_SETINGS,
  ENROLL_DEVICE_DROPDOWN_SETINGS
} from '../../constants/drop-down.constants';
import { EnrollmentConfigurationService } from '../../enrollment-configuration/enrollment-configuration.service';
import { DeviceUserService } from './device-user.service';
import { ENROLL_FINGER_COUNT, ENROLL_MODE } from '../../enrollment-configuration/enrollment.constants';
import { IMqttMessage } from 'ngx-mqtt';

import {
  API_DOMAIN,
  COMPANY_USER_SEARCH_URL
} from '../../api.constants';
import * as _ from "lodash";

@Component({
  selector: 'app-enroll-device-user',
  templateUrl: './enroll.component.html',
})
export class DeviceUserEnrollComponent implements OnInit {

  enrollUserForm: FormGroup;
  zoneDropdownList = [];
  deviceDropdownList = [];
  enrollDeviceDropdownList = [];
  selectedCompany: any = {};
  selectedOffice: any = {};
  selectedZone: any = {};
  zoneSelectedItems = [];
  deviceSelectedItems = [];
  enrollDeviceSelectedItems = [];
  zoneDropdownSettings = {};
  deviceDropdownSettings = {};
  enrollDeviceDropdownSettings = {};
  enrollModeDropdownSettings = {};
  enrollFingerDropdownSettings = {};
  selectedDevice;
  selectedEnrollDevice;
  subscription:any;
  message:any;
  enrollModes = [];
  enrollFingerCounts = [];
  fingerCountVisible: boolean = true;
  enrollFingerNumberSelected = [ENROLL_FINGER_COUNT[0]];
  enrollSelectedMode = [ENROLL_MODE[2]];
  selectedEnrollMode;
  deviceUser: any = {};
  employeeSearchURL: string = COMPANY_USER_SEARCH_URL;
  clientId = '_' + Math.floor(Math.random()*1E16);
  command : any;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private enrollmentConfigurationService: EnrollmentConfigurationService,
    private alertService: AlertService,
    private lockService:LockService,
    private authService: LocalAuthService,
    private localMqttService: LocalMqttService,
    private deviceUserService: DeviceUserService,
  ) {
    this.zoneDropdownSettings = ZONE_DROPDOWN_SETINGS;
    this.deviceDropdownSettings = DEVICE_DROPDOWN_SETINGS;
    this.enrollDeviceDropdownSettings = ENROLL_DEVICE_DROPDOWN_SETINGS;
    this.enrollModes = ENROLL_MODE;
    this.enrollFingerCounts = ENROLL_FINGER_COUNT;
    this.enrollModeDropdownSettings =  ENROLL_MODE_DROPDOWN_SETINGS;
    this.enrollFingerDropdownSettings = ENROLL_FINGER_DROPDOWN_SETINGS;
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.enrollUserForm = this.formBuilder.group({
      deviceUserId: ['',  Validators.required],
      locksEnroll: ['',  Validators.required],
      enrollMode: [[],  Validators.required],
      enrollFingerCount: [[]],
      enrollLocksEnroll:[''],
      smartcardNumber: []
    });
    if (id !== null && id !== undefined){
      this.getDeviceUser(id);
    }
    this.subscription = this.localMqttService.observe('device/neosoft').subscribe()
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
  // convenience getter for easy access to form fields
  get f() { return this.enrollUserForm.controls; }

  onSubmit(formData) {
    // stop here if form is invalid
    if (this.isFormInvalid()) {
      return;
    }

    let message;
    if (formData.smartcardNumber) {
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

  getMqttEnrollInput(formData){
    let company = this.selectedCompany.channel_name;
    let office = this.selectedOffice.name;
    let zone = this.selectedZone.name;
    let device = this.selectedDevice.device_name;
    let ip = this.selectedDevice.ip
    let timestamp = Date.now();
    let command = 'enrolluser';
    this.command = command;
    let _enrollFingerNumberSelected = '';
    let data = [formData.deviceUserId, formData.enrollMode[0].id];
    if (this.fingerCountVisible) {
      data[2] = this.enrollFingerNumberSelected[0].id;
    }

    let message = [this.clientId, company, office, zone,
                device, command, ...data, ip, timestamp
              ].join('|')

    return message.toLowerCase();
  }

  getMqttCredentialInput(formData){
    let company = this.selectedCompany.channel_name;
    let office = this.selectedOffice.name;
    let zone = this.selectedZone.name;
    let device = this.selectedDevice.device_name;
    let ip = this.selectedDevice.ip
    let timestamp = Date.now();
    let command = 'setusercreds';
    this.command = command;
    let _enrollFingerNumberSelected = '';
    let data = [
      formData.deviceUserId,
      '2', // harding to 2 for smart card
      formData.smartcardNumber
    ];

    let message = [this.clientId, company, office, zone,
                device, command, ip, ...data, timestamp
              ].join('|')

    return message.toLowerCase();
  }
  getMqttCardInput(){
    let company = this.selectedCompany.channel_name;
    let office = this.selectedOffice.name;
    let zone = this.selectedZone.name;
    let device = this.selectedEnrollDevice.device_name;
    let ip = this.selectedEnrollDevice.ip
    let timestamp = Date.now();
    let command = 'getcardnumber';
    this.command = command;
    let _enrollFingerNumberSelected = '';
    let data = [
      this.deviceUser.device_user_id
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
      console.log('received::', this.message);
      let mqttData = JSON.parse(this.message);
      if (this.clientId != mqttData['client-id']){
        return
      }
      if (mqttData["response-code"] != 0) {
        let text = this.localMqttService.parseError(mqttData["response-code"]);
        mqttData = false;
        if (!text) {
          text = "Sorry, we were unable to process your request. Please try again later or contact support."
        }
        this.alertService.error(text);
        return;
      }
      if(this.command == 'getcardnumber'){
        this.enrollUserForm.patchValue({
          smartcardNumber: mqttData["card1"],
        })
      }else{
        this.sendData(this.enrollUserForm.value);
      }
    })
  }

  sendData(formData){
    formData.companyId = this.selectedCompany.id;
    formData.deviceId = this.deviceSelectedItems[0].id;
    formData.enrollMode = formData['enrollMode'][0].id;
    formData.locksEnroll = formData.deviceId;
    if (this.fingerCountVisible) {
      this.fingerCountVisible = true;
      formData.enrollFingerCount = this.enrollFingerNumberSelected[0].id;
    } else {
      formData.enrollFingerCount = null;
    }

    this.enrollmentConfigurationService.create(formData).subscribe(
      response => {
        // let id = response.data.id;
        this.alertService.success(response['message']);
        this.router.navigate(['/lifeguard/device-users/' + this.deviceUser.id]);
      },
      error => {
        this.alertService.error(error['error']['message']);
      }
    );
  }

  onItemSelectZone(zone:any){
    this.selectedZone = zone;
    this.zoneSelectedItems=[zone];
    this.setLocks(zone);
  }

  onItemDeSelectZone(item:any){
    this.zoneSelectedItems = [];
    this.deviceSelectedItems = [];
    this.deviceDropdownList = [];
  }

  onErrorGetLock(error){
    this.alertService.error(error['error']['message']);
  }

  setLocks(zone){
    this.deviceDropdownList = this.deviceUser.locks
    .filter( lock => { return lock.zone.id == zone.id && lock.type == 1 } );
  }

  getDeviceUser(id){
    this.deviceUserService.getDeviceUser(id).subscribe(
      response => {
        this.onSucessGetDeviceUser(response);
      },
      error => { this.onErrorGetLock(error); }
    );
  }

  onSucessGetDeviceUser(response){
    this.deviceUser = response.data
    // console.log(this.deviceUser)
    this.getEnrollLocks({ company_id:this.deviceUser.company.id,type:2,page: -1 });
    this.populatedFormValues(response.data)
  }

  setEmployeeSearchURL(companyId) {
    this.employeeSearchURL = COMPANY_USER_SEARCH_URL.replace(':id', companyId)
  }

  populatedFormValues(deviceUser){
    this.selectedCompany = deviceUser.company;
    this.selectedOffice = deviceUser.locks[0].office;
    this.zoneDropdownList = _.uniqBy(deviceUser.locks.map((lock)=> lock.zone), 'id');
    // this.deviceDropdownList = deviceUser.locks;
    this.enrollSelectedMode = this.enrollModes.filter(lock => deviceUser.enroll_mode == lock.id);
    this.enrollUserForm.patchValue({
      deviceUserId: deviceUser.device_user_id,
      enrollMode: this.enrollSelectedMode,
    })
    this.selectedEnrollMode = deviceUser.enroll_mode
    if (deviceUser.enroll_mode == 2 || deviceUser.enroll_mode == 3) {
      this.fingerCountVisible = true;
      this.enrollFingerNumberSelected = ENROLL_FINGER_COUNT.filter(count => deviceUser.enroll_finger_count == count.id);
    } else {
      this.fingerCountVisible = false;
      this.enrollUserForm.patchValue({
        smartcardNumber: deviceUser.smart_card_number
      })
    }
  }

  isFormInvalid(){
    if(this.enrollUserForm.invalid || (this.fingerCountVisible && this.enrollFingerNumberSelected.length === 0)){
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
    // console.log(data)
  }

  onItemDeSelectEnrollFinger(data){

  }

  onItemSelectEnrollMode(data:any){
    // console.log(data)
    this.selectedEnrollMode = data.id;
    if (data.id == 2 || data.id == 3) {
      this.fingerCountVisible = true;
    } else {
      this.fingerCountVisible = false;
    }
  }
  onItemSelectEnrollDevice(device){
    this.selectedEnrollDevice = device;
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
