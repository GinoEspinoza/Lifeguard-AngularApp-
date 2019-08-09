import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocalAuthService, AlertService } from './../../services';
import { COMPANIES, COMPANY_DROPDOWN_SETINGS, OFFICE_DROPDOWN_SETINGS, ZONE_DROPDOWN_SETINGS, MANAGE_DEVICE_DROPDOWN_SETINGS } from './../../constants/drop-down.constants';
import { LockService } from '../locks/lock.service';
import { CompanyService } from '../companies/company.service';
import { OfficeService } from '../offices/office.service';
import * as moment from 'moment';
import 'moment-precise-range-plugin';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  // styleUrls: ['./form.component.css']
})
export class CameraFormComponent implements OnInit {

  cameraForm: FormGroup;
  returnUrl: string;
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
  camera:any;
  cameraId:any;
  companySelected:any;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private lockService: LockService,
    private alertService: AlertService,
    private companyService: CompanyService,
    private officeService: OfficeService,
    private authService: LocalAuthService,
  ) {
    this.companyDropdownSettings = COMPANY_DROPDOWN_SETINGS;
    this.officeDropdownSettings = OFFICE_DROPDOWN_SETINGS;
    this.zoneDropdownSettings = ZONE_DROPDOWN_SETINGS;
    this.deviceDropdownSettings = MANAGE_DEVICE_DROPDOWN_SETINGS;
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.cameraForm = this.formBuilder.group({
      deviceName: ['', Validators.required],
      status: [true],
      subscriptionStatus: [true],
      subscriptionDate: [[], Validators.required]
    });
    if (id !== null && id !== undefined){
      this.cameraId = id;
      this.getCamera(id);
    } else {
      this.loadPermittedData();
    }
    if (this.authService.isAdmin()) {
      this.getCompanies();
    }
  }

  ngOnDestroy() {
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
  get f() { return this.cameraForm.controls; }

  onSubmit(formData) {
    // stop here if form is invalid
    if (this.isFormInvalid()) {
      return;
    }

    this.sendData(formData);
  }

  sendData(formData){
    formData.companyId = this.selectedCompany.id;
    formData.officeId = this.selectedOffice.id;
    formData.zoneId = this.selectedZone.id;
    formData.companyDeviceId = this.selectedDevice.id;
    formData.status = formData.status ? 1 : '0';
    formData.ip = '';
    formData.subscription_status = formData.subscriptionStatus ? 1 : '0';
    formData.subscription_start = moment(formData.subscriptionDate[0]).startOf('day').utc().format('YYYY-MM-DD kk:mm:ss');
    formData.subscription_end = moment(formData.subscriptionDate[1]).endOf('day').utc().format('YYYY-MM-DD kk:mm:ss');

    if (this.camera == undefined){
        this.lockService.create(formData)
        .subscribe(
        response => {
          let id = response.data.id
          this.router.navigate(['/lifeguard/cameras/'+ id ]);
          this.alertService.success(response.message);
        }, error => {
          this.alertService.error(error.error.message);
        });
    } else {
        this.lockService.update( this.camera, formData)
    .subscribe(
      response => {
        let id = response.data.id
        this.alertService.success(response['message']);
        this.router.navigate(['/lifeguard/cameras/'+ id ]);
      },
      error => {
        this.alertService.error(error.error.message);
      });
    }
  }

  getCamera(id: any): any {
    this.lockService.getLock(id).subscribe(response => {
      this.onSucessGetCamera(response); },
    error => { this.onErrorGetCamera(error); }
    );
  }

  onSucessGetCamera(response){
    this.camera = response.data;
    this.populatedFormValues(this.camera)
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
    error => { this.onErrorGetCamera(error); }
    );
  }

  getDiff(dates) {
    let endDate = moment(moment(dates[1]).add(1, 'd').format('YYYY-MM-DD'))
    return endDate['preciseDiff'](moment(dates[0]).format('YYYY-MM-DD'))
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
    error => { this.onErrorGetCamera(error); }
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
    error => { this.onErrorGetCamera(error); }
    );
  }

  onSucessGetDevices(response, company_id:number){
    this.deviceDropdownList = response.data;
    if(this.camera && this.camera.company.id == company_id) {
      this.selectedDevice = {
        id: this.camera.company_device.id,
        mac: this.camera.company_device.device.mac
      };
      this.deviceDropdownList.unshift(this.selectedDevice);
      this.deviceSelectedItems = [this.selectedDevice];
    }
  }

  getCompanyDevices(company){
    this.companyService.getLockedCompanyCameras(company).subscribe(response => {
      this.onSucessGetDevices(response, company.id); },
      error => { this.onErrorGetCamera(error); }
    );
  }

  onErrorGetCamera(error){
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
   }

  populatedFormValues(camera){
    // this.getCompanies();
    this.getCompanyOffices(camera.company);
    this.getOfficeZones(camera.office);
    this.getCompanyDevices(camera.company);
    this.selectedCompany = camera.company;
    this.officeSelectedItems = [camera.office];
    this.selectedItems = [camera.company];
    // this.selectedDevice = {
    //   id: camera.company_device.id,
    //   mac: camera.company_device.device.mac
    // };
    // this.deviceDropdownList.push(this.selectedDevice);
    // this.deviceSelectedItems = [this.selectedDevice];
    this.zoneSelectedItems = [camera.zone];
    this.companySelected = camera.company;
    // this.companySelected.push(camera.company);
    this.selectedOffice =camera.office;
    this.selectedZone =camera.zone;
    let dates = [moment.utc(camera.subscription_start).local().toDate(), moment.utc(camera.subscription_end).local().toDate()];
    this.cameraForm.patchValue({
      deviceName: camera.device_name,
      status: camera.status == '1',
      subscriptionStatus: camera.subscription_status == '1',
      subscriptionDate: dates,
    })
  }

  isFormInvalid(){
    if(this.cameraForm.invalid || this.selectedItems.length === 0 ||this.officeSelectedItems.length === 0 || this.zoneSelectedItems.length === 0 || this.deviceSelectedItems.length === 0 ){
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
