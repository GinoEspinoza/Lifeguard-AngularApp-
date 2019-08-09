import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalAuthService, AlertService, LocalMqttService } from './../../services';
import { COMPANIES, COMPANY_DROPDOWN_SETINGS, OFFICE_DROPDOWN_SETINGS, ZONE_DROPDOWN_SETINGS, MANAGE_DEVICE_DROPDOWN_SETINGS,LOCK_TYPES , LOCK_TYPE_DROPDOWN_SETINGS } from './../../constants/drop-down.constants';
import { LockService } from './lock.service';
import { CompanyService } from '../companies/company.service';
import { OfficeService } from '../offices/office.service';
import { IMqttMessage } from 'ngx-mqtt';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class LockFormComponent implements OnInit {

  lockForm: FormGroup;
  returnUrl: string;
  dropdownList = [];

  companySelectedItems = [];
  officeDropdownList = [];
  officeDropdownSettings = {};
  companyDropdownSettings = {};
  zoneDropdownSettings = {};
  deviceDropdownSettings = {};
  typeDropdownSettings = {};
  zoneDropdownList = [];
  deviceDropdownList = [];
  selectedItems = [];
  selectedCompanies = [];
  selectedOffices = [];
  selectedZones = [];
  officeSelectedItems = [];
  deviceSelectedItems = [];
  zoneSelectedItems = [];
  typeSelectedItems = [];
  selectedCompany;
  selectedOffice;
  selectedZone;
  selectedDevice;
  selectedType;
  companyList:any;
  lock:any;
  lockId:any;
  companySelected:any;
  subscription:any;
  interval;
  message:any;
  mqttData:any;
  typeList:any;
  clientId = '_' + Math.floor(Math.random()*1E16);
  ipPattern = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/g

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private lockService: LockService,
    private alertService: AlertService,
    private companyService: CompanyService,
    private officeService: OfficeService,
    private localMqttService: LocalMqttService,
    private authService: LocalAuthService,
  ) {
    this.companyDropdownSettings = COMPANY_DROPDOWN_SETINGS;
    this.officeDropdownSettings = OFFICE_DROPDOWN_SETINGS;
    this.zoneDropdownSettings = ZONE_DROPDOWN_SETINGS;
    this.deviceDropdownSettings = MANAGE_DEVICE_DROPDOWN_SETINGS;
    this.typeDropdownSettings = LOCK_TYPE_DROPDOWN_SETINGS;
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.lockForm = this.formBuilder.group({
      ip: ['',  Validators.compose([Validators.required, Validators.pattern(this.ipPattern)])],
      deviceName: ['', Validators.required],
      status: [true],
    });
    if (id !== null && id !== undefined){
      this.lockId = id;
      this.getLock(id);
    } else {
      this.loadPermittedData();
    }
    if (this.authService.isAdmin()) {
      this.getCompanies();
    }
    this.subscription = this.localMqttService.observe('device/neosoft').subscribe();
    this.typeList = LOCK_TYPES;
    this.typeSelectedItems = [{id:1,name:"Enrollment"}];
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    clearInterval(this.interval);
  }

  loadPermittedData() {
    if (this.authService.currentCompany()) {
      this.selectedCompany = this.authService.currentCompany();
      this.selectedItems = [this.selectedCompany];
      this.getCompanyOffices(this.selectedCompany);
      this.getCompanyDevices(this.selectedCompany);
    }
  }

  // convenience getter for easy access to form fields
  get f() { return this.lockForm.controls; }

  onSubmit(formData) {
    // stop here if form is invalid
    if (this.isFormInvalid()) {
       return;
    }
    // this.sendData(this.lockForm.value);
    // return;
    let message = this.getMqttInput(formData)
    console.log(message)
    let companyName = this.selectedCompany.channel_name.toLowerCase();
    this.subscription.unsubscribe();
    this.subscription = this.subscribeMQTTChannel(companyName);
    this.localMqttService.unsafePublish(`web/${companyName}`, message);

    let intervalCounter = 0;
    this.interval = setInterval(()=> {
      intervalCounter = intervalCounter + 1;
      if (this.mqttData) {
        clearInterval(this.interval);
      } else if (intervalCounter == 10) {
        clearInterval(this.interval);
        this.alertService.error('Sorry, we were unable to process your request. Please try again later or contact support.')
      }
    }, 1000);
    // this.sendData(formData);
  }

  sendData(formData){
    formData.companyId = this.selectedCompany.id;
    formData.officeId = this.selectedOffice.id;
    formData.zoneId = this.selectedZone.id;
    formData.companyDeviceId = this.selectedDevice.id;
    formData.status = formData.status ? 1 : 0;
    formData.type = this.selectedType.id;

    if (this.lock == undefined){
        this.lockService.create(formData)
        .subscribe(
        response => {
          let id = response.data.id
          this.router.navigate(['/lifeguard/locks/'+ id ]);
          this.alertService.success(response.message);
        }, error => {
          this.alertService.error(error.error.message);
        });
    } else {
        this.lockService.update( this.lock, formData)
    .subscribe(
      response => {
        let id = response.data.id
        this.alertService.success(response['message']);
        this.router.navigate(['/lifeguard/locks/'+ id ]);
      },
      error => {
        this.alertService.error(error.error.message);
      });
    }
  }

  getMqttInput(lockForm:any){
    let userInput : string;
    let company = this.selectedCompany.channel_name;
    let office = this.selectedOffice.name;
    let zone = this.selectedZone.name;
    let device = lockForm.deviceName;
    let status = lockForm.status;
    let maxFingers = 2;
    let timestamp = Date.now();
    userInput = this.clientId + '|' +company + '|' + office + '|' + zone + '|' + device + '|devicecfg|' + maxFingers + '|' + lockForm.ip + '|' + timestamp;
    if (this.lock && this.lock.ip != lockForm.ip) {
      userInput = userInput + '|' + this.lock.ip;
    }

    return userInput.toLowerCase();
  }

  subscribeMQTTChannel(company: string){
    return this.localMqttService.observe(`device/${company}`)
    .subscribe((message: IMqttMessage) => {
      this.message = message.payload.toString();
      this.mqttData = JSON.parse(this.message);
      if (this.clientId != this.mqttData['client-id']){
        return
      }
      if (this.mqttData["response-code"] != 0) {
        this.mqttData = false;
        clearInterval(this.interval);
        this.alertService.error("Sorry, we were unable to add this lock at the moment. Please contact support.");
      }
      console.log(this.mqttData)
      this.sendData(this.lockForm.value);
    })
  }

  getLock(id: any): any {
    this.lockService.getLock(id).subscribe(response => {
      this.onSucessGetLock(response); },
    error => { this.onErrorGetLock(error); }
    );
  }

  onSucessGetLock(response){
    this.lock = response.data;
    this.populatedFormValues(this.lock)
  }

  onItemSelectOffice(office){
    this.officeSelectedItems = [];
    this.selectedZone = undefined;
    this.selectedOffice = office;
    this.zoneDropdownList = [];
    this.zoneSelectedItems = [];

    // this.officeSelectedItems = office;
    this.officeSelectedItems = [office];
    this.getOfficeZones(office);
  }

  getOfficeZones(office){
    this.officeService.getZones(office).subscribe(response => {
      this.onSucessGetZones(response); },
    error => { this.onErrorGetLock(error); }
    );
  }

  onItemSelectCompany(company){
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
    this.getCompanyOffices(company);
    this.getCompanyDevices(company);
  }

  onZoneSelect(item:any){
    this.selectedZone = item;
  }

  getCompanies(){
    this.companyService.getCompanies({per_page: -1}).subscribe(response => {
      this.onSucessGetCompanies(response); },
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
    this.zoneSelectedItems = [zone]
  }

  onItemDeSelectZone(zone:any){
    this.zoneSelectedItems=[]
  }

  getCompanyOffices(company){
    this.officeService.getCompanyOffices(company).subscribe(response => {
      this.onSucessGetOffices(response); },
    error => { this.onErrorGetLock(error); }
    );
  }

  onSucessGetDevices(response, company_id:number){
    this.deviceDropdownList = response.data;
    if(this.lock && this.lock.company.id == company_id) {
      this.selectedDevice = {
        id: this.lock.company_device.id,
        mac: this.lock.company_device.device.mac
      };
      this.deviceDropdownList.unshift(this.selectedDevice);
      this.deviceSelectedItems = [this.selectedDevice];
    }
  }

  getCompanyDevices(company){
    this.companyService.getLockedCompanyDevices(company).subscribe(response => {
      this.onSucessGetDevices(response, company.id); },
      error => { this.onErrorGetLock(error); }
    );
  }

  onErrorGetLock(error){
    this.alertService.error(error.error.message);
  }


  onSucessGetCompanies(response){
    this.dropdownList = response.data
  }

  onSucessGetOffices(response){
    this.officeDropdownList = response.data
  }

  onSucessGetZones(response){
    this.zoneDropdownList = response.data
    console.log("Zone List:",this.zoneDropdownList);
   }

  populatedFormValues(lock){
    // this.getCompanies();
    this.getCompanyOffices(lock.company);
    this.getOfficeZones(lock.office);
    this.getCompanyDevices(lock.company);
    this.selectedCompany = lock.company;
    this.officeSelectedItems = [lock.office];
    this.selectedItems = [lock.company];
    console.log("office selected items",this.officeSelectedItems);
    // this.selectedDevice = {
    //   id: lock.company_device.id,
    //   mac: lock.company_device.device.mac
    // };
    // this.deviceDropdownList.push(this.selectedDevice);
    // this.deviceSelectedItems = [this.selectedDevice];
    this.zoneSelectedItems = [lock.zone];
    this.typeSelectedItems = [{id:lock.type,name:lock.type==2?"Enrollment":"Normal"}];
    this.selectedType = {id:lock.type,name:lock.type==2?"Enrollment":"Normal"};
    this.companySelected = lock.company;
    // this.companySelected.push(lock.company);
    this.selectedOffice =lock.office;
    this.selectedZone =lock.zone ;
    this.lockForm.patchValue({
      ip: lock.ip,
      deviceName: lock.device_name,
      status: lock.status == '1',
    })
  }

  isFormInvalid(){
    if(this.lockForm.invalid || this.selectedItems.length === 0 ||this.officeSelectedItems.length === 0 || this.zoneSelectedItems.length === 0 || this.deviceSelectedItems.length === 0 || this.typeSelectedItems.length ===0){
      return true;
    } else {
      return false;
    }
  }

  onItemSelectDevice(device){
    this.deviceSelectedItems = [device]
    this.selectedDevice = device;
  }

  onItemDeSelectDevice(device){
    this.deviceSelectedItems=[]
    this.selectedDevice = undefined;
  }
  onItemSelectType(type){
    this.typeSelectedItems=[type];
    this.selectedType = type;
  }
  OnTypeDeSelect(type){
    this.typeSelectedItems=[];
    this.selectedType = undefined;
  }
}
