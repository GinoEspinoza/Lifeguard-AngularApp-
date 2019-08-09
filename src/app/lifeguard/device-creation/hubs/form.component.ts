import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalAuthService, AlertService, LocalMqttService } from './../../services';
import { COMPANIES, COMPANY_DROPDOWN_SETINGS, OFFICE_DROPDOWN_SETINGS, MANAGE_DEVICE_DROPDOWN_SETINGS } from './../../constants/drop-down.constants';
import { LockService } from '../locks/lock.service';
import { CompanyService } from '../companies/company.service';
import { OfficeService } from '../offices/office.service';
import { IMqttMessage } from 'ngx-mqtt';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class HubFormComponent implements OnInit {

  hubForm: FormGroup;
  returnUrl: string;
  dropdownList = [];

  companySelectedItems = [];
  officeDropdownList = [];
  officeDropdownSettings = {};
  companyDropdownSettings = {};
  deviceDropdownSettings = {};
  deviceDropdownList = [];
  selectedItems = [];
  selectedCompanies = [];
  selectedOffices = [];
  officeSelectedItems = [];
  deviceSelectedItems = [];
  selectedCompany;
  selectedOffice;
  selectedDevice;
  companyList:any;
  hub:any;
  hubId:any;
  companySelected:any;
  subscription:any;
  interval;
  message:any;
  mqttData:any;
  clientId = '_' + Math.floor(Math.random()*1E16);

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
    this.deviceDropdownSettings = MANAGE_DEVICE_DROPDOWN_SETINGS;
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.hubForm = this.formBuilder.group({
      companyId: [[], Validators.required],
      officeId: [[], Validators.required],
      deviceId: [[], Validators.required],
      ip: ['', Validators.required],
      deviceName: ['', Validators.required],
      status: [true],
    });
    if (id !== null && id !== undefined){
      this.hubId = id;
      this.getLock(id);
    } else {
      this.loadPermittedData();
    }
    if (this.authService.isAdmin()) {
      this.getCompanies();
    }
    this.subscription = this.localMqttService.observe('device/neosoft').subscribe();
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
  get f() { return this.hubForm.controls; }

  onSubmit(formData) {
    // stop here if form is invalid
    if (this.isFormInvalid()) {
       return;
    }

    this.sendData(formData);
  }

  sendData(formData){
    console.log(formData)
    formData.companyId = this.selectedCompany.id;
    formData.officeId = this.selectedOffice.id;
    formData.companyDeviceId = this.selectedDevice.id;
    formData.status = formData.status ? 1 : 0;

    if (this.hub == undefined){
        this.lockService.create(formData)
        .subscribe(
        response => {
          let id = response.data.id
          this.router.navigate(['/lifeguard/hubs/'+ id ]);
          this.alertService.success('Hub created successfully.');
        }, error => {
          this.alertService.error(error.error.message);
        });
    } else {
      this.lockService.update(this.hub, formData).subscribe(
      response => {
        let id = response.data.id
        this.alertService.success('Hub updated successfully.');
        this.router.navigate(['/lifeguard/hubs/'+ id ]);
      },
      error => {
        this.alertService.error(error.error.message);
      });
    }
  }

  getMqttInput(hubForm:any){
    let userInput : string;
    let company = this.selectedCompany.channel_name;
    let office = this.selectedOffice.name;
    let device = hubForm.deviceName;
    let status = hubForm.status;
    let maxFingers = 2;
    let timestamp = Date.now();
    userInput = this.clientId + '|' +company + '|' + office + '|' + '|' + device + '|devicecfg|' + maxFingers + '|' + hubForm.ip + '|' + timestamp;

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
      this.sendData(this.hubForm.value);
    })
  }

  getLock(id: any): any {
    this.lockService.getLock(id).subscribe(response => {
      this.onSucessGetLock(response); },
    error => { this.onErrorGetLock(error); }
    );
  }

  onSucessGetLock(response){
    this.hub = response.data;
    this.populatedFormValues(this.hub)
  }

  onItemSelectOffice(office){
    this.officeSelectedItems = [];
    this.selectedOffice = office;

    // this.officeSelectedItems = office;
    this.officeSelectedItems = [office];
  }

  onItemSelectCompany(company){
    this.selectedOffice = undefined;
    this.deviceSelectedItems = [];
    this.officeSelectedItems = [];
    this.officeDropdownList = [];
    this.deviceDropdownList=[];
    this.selectedCompany = company;
    this.companySelected = company;
    this.getCompanyOffices(company);
    this.getCompanyDevices(company);
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
    this.deviceSelectedItems = [];
    this.officeSelectedItems = [];
    this.officeDropdownList = [];
    this.deviceDropdownList=[];
  }

  onItemDeSelectOffice(item:any){

  }

  getCompanyOffices(company){
    this.officeService.getCompanyOffices(company).subscribe(response => {
      this.onSucessGetOffices(response); },
    error => { this.onErrorGetLock(error); }
    );
  }

  onSucessGetDevices(response, company_id:number){
    this.deviceDropdownList = response.data;
    if(this.hub && this.hub.company.id == company_id) {
      this.selectedDevice = {
        id: this.hub.company_device.id,
        mac: this.hub.company_device.device.mac
      };
      this.deviceDropdownList.unshift(this.selectedDevice);
      this.deviceSelectedItems = [this.selectedDevice];
    }
  }

  getCompanyDevices(company){
    this.companyService.getLockedCompanyHubs(company).subscribe(response => {
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

  populatedFormValues(hub){
    // this.getCompanies();
    this.getCompanyOffices(hub.company);
    this.getCompanyDevices(hub.company);
    this.selectedCompany = hub.company;
    this.officeSelectedItems = [hub.office];
    this.selectedItems = [hub.company];
    // this.selectedDevice = {
    //   id: hub.company_device.id,
    //   mac: hub.company_device.device.mac
    // };
    // this.deviceDropdownList.push(this.selectedDevice);
    // this.deviceSelectedItems = [this.selectedDevice];
    this.companySelected = hub.company;
    // this.companySelected.push(hub.company);
    this.selectedOffice =hub.office;
    this.hubForm.patchValue({
      ip: hub.ip,
      deviceName: hub.device_name,
      status: hub.status == '1',
    })
  }

  isFormInvalid(){
    if(this.hubForm.invalid){
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

}
