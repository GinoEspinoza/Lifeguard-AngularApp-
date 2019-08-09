import { Component, OnInit, Inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { MqttService, IMqttMessage, IMqttServiceOptions } from 'ngx-mqtt';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as CryptoJS from 'crypto-js';
import { COMPANIES, COMPANY_DROPDOWN_SETINGS, OFFICE_DROPDOWN_SETINGS, ZONE_DROPDOWN_SETINGS, DEVICE_DROPDOWN_SETINGS } from './../constants/drop-down.constants';
import { LocalMqttService } from './../services/mqtt.service'
import { ActivatedRoute } from '@angular/router';
// import { LockService } from '..';
import { AlertService } from 'src/app/lifeguard/services';
import { CompanyService, ZoneService, OfficeService, LockService } from 'src/app/lifeguard/device-creation';

@Component({
  selector: 'app-mqtt-communication',
  templateUrl: './mqtt-communication.component.html',
  styleUrls: ['./mqtt-communication.component.css']
})
export class MqttCommunicationComponent implements OnInit {

  mqttForm: FormGroup;
  returnUrl: string;
  mqttData : any;
  hasData: any;
  dropdownList = [];
  
  companySelectedItems = [];
  officeDropdownList = [];
  officeDropdownSettings = {};
  companyDropdownSettings = {};
  zoneDropdownSettings = {};
  deviceDropdownSettings = {};
  zoneDropdownList = [];
  deviceDropdownList = [];
  selectedItems = [];
  selectedCompanies = [];
  selectedOffices = [];
  selectedZones = [];
  officeSelectedItems = [];
  deviceSelectedItems = [];
  zoneSelectedItems = [];
  selectedCompany;
  selectedOffice;
  selectedZone;
  selectedDevice;
  companyList:any;
  companySelected:any;

  clientId = '_' + Math.floor(Math.random()*1E16);
  msg = this.clientId + '|neosoft|rabale|php|lock1|userinfo|@@@'

  private subscription: Subscription;
  public message: string;
  type = 'success';
  alertMessage = "success";
  showAlert :boolean = false;

  constructor(
    private _mqttService: MqttService,
    @Inject(FormBuilder) formBuilder: FormBuilder,
    private localMqttService: LocalMqttService,
    private route: ActivatedRoute,
    private router: Router,
    private alertService: AlertService,
    private companyService: CompanyService,
    private officeService: OfficeService,
    private zoneService: ZoneService,
    private lockService: LockService,
  ){
    this.companyDropdownSettings = COMPANY_DROPDOWN_SETINGS;
    this.officeDropdownSettings = OFFICE_DROPDOWN_SETINGS;
    this.zoneDropdownSettings = ZONE_DROPDOWN_SETINGS;
    this.deviceDropdownSettings = DEVICE_DROPDOWN_SETINGS;
    this.getCompanies();
    this.mqttForm = formBuilder.group({
      userId: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.subscription = this.localMqttService.observe('device/neosoft').subscribe((message: IMqttMessage) => {
      this.message = message.payload.toString();
      this.mqttData = JSON.parse(this.message);
      this.hasData = true
      if (this.mqttData && this.clientId != this.mqttData['client-id']){
        this.mqttData = null;
        this.hasData = false
        return
      }
      if (this.mqttData && this.mqttData["response-code"] == 1) {
        this.mqttData = false;
        this.hasData = false
      }
    });
  }


  public unsafePublish(topic: string, message: string): void {
    this._mqttService.unsafePublish(topic, message, {qos: 0, retain: true});
  }

  public publish(topic: string, message: string): void {
    this._mqttService.publish(topic, message, {qos: 0, retain: true});
  }


  get f() { return this.mqttForm.controls; }

  getMqttInput(user:any){
    let userInput : string;
    let zone = this.selectedZone.name;
    let office = this.selectedOffice.name;
    let company = this.selectedCompany.channel_name;
    let device = this.selectedDevice.device_name;
     
    userInput = this.clientId + '|' +company + '|' + office + '|' + zone + '|' + device + '|userinfo|' + user.userId;

    return userInput.toLowerCase();
  }

  onSubmit(formData:any) {
    if(this.isFormInvalid()){
      return false;
    }
    let mqttData;
    let msg = this.msg

    let userInput : string;

    let zone = this.selectedZone.name;
    let office = this.selectedOffice.name;
    let company = this.selectedCompany.name;
    let device = this.selectedDevice.device_name;
     
    userInput = this.getMqttInput(formData)  

    console.log('userInput', userInput)
    // stop here if form is invalid
    if (this.mqttForm.invalid) {
        return;
    }
    msg = msg.replace('@@@', formData.userId).toLowerCase();
    this.showAlert = false;
    this.mqttData = undefined

        //Encrypt the smg with Base64
        // const key = CryptoJS.enc.Base64.parse("#base64Key#");
        // const iv  = CryptoJS.enc.Base64.parse("#base64IV#");
        // console.log("encrypted Base64 iv ----------------->", iv.toString())
        // console.log("encrypted Base64 key ----------------->", key.toString())

        //     //Impementing the Key and IV and encrypt the smg
        // const encrypted = CryptoJS.AES.encrypt(msg, key, {iv: iv});
        // console.log("encrypted smg ----------------->", encrypted.toString())

    this.unsafePublish('web/neosoft', userInput.toString());
  }


  onItemSelectCompany(company){
    this.selectedItems = [];
    this.selectedItems.push(company);
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

  getCompanyOffices(company){
    this.officeService.getCompanyOffices(company).subscribe(response => {
      this.onSucessGetOffices(response); },
    error => { this.OnErrorGetCompanies(error); }
    );
  }

  onSucessGetOffices(response){
    this.officeDropdownList = response.data
  }

  OnItemDeSelectOffice(item:any){
    this.selectedZone = undefined;
    this.zoneDropdownList = [];
    this.zoneSelectedItems = [];   
  }

  onItemSelectOffice(office){
    this.officeSelectedItems = [];
    this.selectedZone = undefined;
    this.selectedOffice = office;
    this.zoneDropdownList = [];
    this.zoneSelectedItems = [];
   
    // this.officeSelectedItems = office;
    this.officeSelectedItems.push(office);
    this.getOfficeZones(office);
  }

  getOfficeZones(office){
    this.officeService.getZones(office).subscribe(response => {
      this.onSucessGetZones(response); },
    error => { this.OnErrorGetCompanies(error); }
    );
  }

  onSucessGetZones(response){
    this.zoneDropdownList = response.data
   }

   onItemSelectZone(zone:any){
    this.selectedZone = zone;
    this.zoneSelectedItems=[]
    this.zoneSelectedItems.push(zone)
  }

  OnItemDeSelectZone(zone:any){
    this.zoneSelectedItems=[]
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onItemSelectDevice(device){
    this.deviceSelectedItems=[]
    this.selectedDevice = device;
    this.deviceSelectedItems.push(device)
  }


  OnItemDeSelectDevice(device){
    this.deviceSelectedItems=[]
    this.selectedDevice = undefined;
  }

  getCompanyDevices(company){
    this.companyService.getCompanyDevices(company).subscribe(response => {
      this.onSucessGetDevices(response); },
    error => { this.OnErrorGetCompanies(error); }
    );
  }

  onSucessGetDevices(response){
    this.deviceDropdownList= response.data;
  }

  isFormInvalid(){
    if(this.mqttForm.invalid || this.deviceSelectedItems.length == 0 || this.officeSelectedItems.length == 0 || this.selectedItems.length == 0 || this.zoneSelectedItems.length == 0 ){
      return true;
    }else{
      return false;
    }
  }

  getCompanies(){
    this.companyService.getCompanies().subscribe(response => {
      this.onSucessGetCompanies(response); },
    error => { this.OnErrorGetCompanies(error); }
    );
  }

  onSucessGetCompanies(response){
    this.dropdownList = response.data
  }

  OnErrorGetCompanies(error){

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


}

