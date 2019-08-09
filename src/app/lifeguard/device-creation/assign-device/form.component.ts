import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalAuthService, AlertService, LocalMqttService } from './../../services';
import { COMPANY_DROPDOWN_SETINGS, MANAGE_DEVICE_DROPDOWN_SETINGS } from './../../constants/drop-down.constants';
import { AssignDeviceService } from './assign-device.service';
import { CompanyService } from '../companies/company.service';
import { DeviceService} from '../devices/device.service';
import { MqttService, IMqttMessage } from 'ngx-mqtt';

@Component({
  selector: 'app-assign-device-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class AssignDeviceFormComponent implements OnInit {

  assignDeviceForm: FormGroup;
  returnUrl: string;
  dropdownList = [];
  companySelectedItems = [];
  companyDropdownSettings = {};
  deviceDropdownSettings = {};
  deviceDropdownList = [];
  deviceList =  [];
  selectedItems = [];
  selectedCompanies = [];
  deviceSelectedItems = [];
  selectedCompany;
  selectedDevice;
  companyList:any;
  assignDevice:any;
  ip:any;
  assignDeviceId:any;
  companySelected:any;
  subscription:any;
  message:any;
  mqttData:any;
  clientId = '_' + Math.floor(Math.random()*1E16);
  timestamp = Date.now();
  msg = this.clientId + 'neosoft|rabale|php|lock1|devicecfg|@@@|0|192.168.1.200' + this.timestamp;


    constructor(
      private formBuilder: FormBuilder,
      private route: ActivatedRoute,
      private router: Router,
      private assignDeviceService: AssignDeviceService,
      private alertService: AlertService,
      private companyService: CompanyService,
      private deviceService: DeviceService,
      private _mqttService: MqttService,
      private localMqttService: LocalMqttService
    ) {
      this.getCompanies();
      const mac = this.route.snapshot.queryParams['deviceMac'];
      let params = {};
      if (mac) { params['mac'] = mac }
      this.getDevices(params);
      this.companyDropdownSettings = COMPANY_DROPDOWN_SETINGS;
      this.deviceDropdownSettings = MANAGE_DEVICE_DROPDOWN_SETINGS;
    }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.assignDeviceForm = this.formBuilder.group({
      company: ['',  Validators.required],
      device: ['',  Validators.required]
    });
    if (id !== null && id !== undefined){
      this.assignDeviceId = id;
      this.assignDevice = id;
      this.getAssignDevice(id);
    }
    // this.subscription = this.localMqttService.observe('device/neosoft').subscribe()
  }

  // convenience getter for easy access to form fields
  get f() { return this.assignDeviceForm.controls; }

  onSubmit(formData) {
    // stop here if form is invalid
    if (this.isFormInvalid()) {
        return;
    }
    this.sendData(formData)
    // this.msg = this.msg.replace('@@@', this.selectedDevice.device_name).toLowerCase();
    // let message = this.getMqttInput(formData)
    // let companyName = this.selectedCompany.name.toLowerCase();
    // console.log(message)
    // this.unsafePublish(`web/${companyName}`, message);
    // this.subscription.unsubscribe();
    // this.subscription = this.subscribeMQTTChannel(companyName);
  }


  // public unsafePublish(topic: string, message: string): void {
  //   this._mqttService.unsafePublish(topic, message, {qos: 1, retain: true});
  // }


  sendData(formData){
    formData.companyId = this.selectedItems[0].id;
    formData.deviceId = this.deviceSelectedItems[0].id;

    if (this.assignDevice == undefined){
        this.assignDeviceService.create(formData)
        .subscribe(
        response => {
          let id = response.data.id
          this.alertService.success(response['message']);
          this.router.navigate(['/lifeguard/company_devices/'+ id ]);
        },
        error => {
          this.alertService.error(error['error']['message']);
        });
    } else {
      this.assignDeviceService.update( this.assignDevice, formData)
      .subscribe(
      response => {
        let id = response.data.id
        this.router.navigate(['/lifeguard/company_devices/'+ id ]);
      },
      error => {
        this.alertService.error(error['error']['message']);
      });
    }
  }

  // getMqttInput(user:any){
  //   let userInput : string;
  //   let company = this.selectedCompany.name;
  //   let device = this.selectedDevice.device_name;
  //   let timestamp = Date.now();
  //   // userInput = this.clientId + '|' +company + '|' + office + '|' + zone + '|' + device + '|devicecfg|0|' + user.ip + '|' + timestamp;

  //   return userInput.toLowerCase();
  // }

  // subscribeMQTTChannel(company: string){
  //   return this.localMqttService.observe(`device/${company}`)
  //   .subscribe((message: IMqttMessage) => {
  //     this.message = message.payload.toString();
  //     this.mqttData = JSON.parse(this.message);
  //     if (this.clientId != this.mqttData['client-id']){
  //       return
  //     }
  //     if (this.mqttData["response-code"] != 0) {
  //       this.mqttData = false;
  //       this.alertService.error("error");
  //     }
  //     console.log(this.mqttData)
  //     this.sendData(this.assignDeviceForm.value);
  //   })
  // }

  getAssignDevice(id: any): any {
    this.assignDeviceService.getAssignDevice(id).subscribe(response => {
      this.onSucessGetDevice(response); },
    error => { this.onErrorGetLock(error); }
    );
  }

  getDevices(params){
    this.assignDeviceService.getMacs(params).subscribe(response => {
      this.onSucessGetDevices(response); },
    error => { this.onErrorGetLock(error); }
    );
  }

  onSucessGetDevices(response){
    this.deviceDropdownList = response.data;
    if (this.deviceDropdownList.length == 1) { this.deviceSelectedItems = [this.deviceDropdownList[0]] }
  }

  onSucessGetDevice(response){
    this.assignDevice = response.data
    this.getCompanies();
    this.populatedFormValues(response);
  }



  onItemSelectCompany(company){
    this.selectedCompany = company;
  }

  getCompanies(){
    this.companyService.getCompanies({per_page: -1}).subscribe(response => {
      this.onSuccessGetCompanies(response); },
    error => { this.onErrorGetLock(error); }
    );
  }

  onSuccessGetCompanies(response){
    this.dropdownList = response.data;
  }

  OnItemDeSelect(item:any){
    this.selectedCompany = undefined;
    this.deviceSelectedItems = [];
  }

  onErrorGetLock(error){
    this.alertService.error(error['error']['message']);
  }

  populatedFormValues(deviceData){
    this.deviceDropdownList.unshift(deviceData.data.device)
    this.selectedCompany = deviceData.data.company;
    this.selectedItems.push(deviceData.data.company);
    this.deviceSelectedItems.unshift( deviceData.data.device);
    this.companySelected =  deviceData.data.company;
    this.selectedDevice =  deviceData.data.device;
  }

  isFormInvalid(){
    if(this.assignDeviceForm.invalid || this.selectedItems.length === 0 || this.deviceSelectedItems.length === 0){
      return true;
    } else {
      return false;
    }
  }

  onItemSelectDevice(device){
    this.selectedDevice = device;
    // this.deviceSelectedItems.push( device)
  }

  onItemDeSelectDevice(device){
    this.deviceSelectedItems=[]
    this.selectedDevice = undefined;
  }

  getDeviceIcon(device) {
    if (device.type == 'Lock') {
      // return 'fingerprint';
      return 'lock';
    } else if (device.type == 'Camera') {
      return 'video-camera';
    } else if (device.type == 'Hub') {
      return 'microchip';
    }
  }

}
