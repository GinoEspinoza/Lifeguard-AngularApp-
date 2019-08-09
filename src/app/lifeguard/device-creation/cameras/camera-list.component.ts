import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LockService } from '../locks/lock.service';
import { AlertService } from '../../services';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompanyService } from '../companies/company.service';
import { OfficeService } from '../offices/office.service';
import { COMPANY_DROPDOWN_SETINGS, OFFICE_DROPDOWN_SETINGS, ZONE_DROPDOWN_SETINGS } from '../../constants/drop-down.constants';
import * as moment from 'moment';
import 'moment-precise-range-plugin';

@Component({
  selector: 'app-camera-list',
  templateUrl: './camera-list.component.html',
  // styleUrls: ['./camera-list.component.css']
})
export class CameraListComponent implements OnInit {

  searchForm: FormGroup;
  camerasList:any;
  camera:any;
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
  zoneDropdownSettings = {};
  dropdownZoneList = [];
  selectedZoneItems = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private lockService: LockService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private companyService: CompanyService,
    private officeService: OfficeService,
  ) {
    this.companyDropdownSettings = COMPANY_DROPDOWN_SETINGS;
    this.officeDropdownSettings  = OFFICE_DROPDOWN_SETINGS;
    this.zoneDropdownSettings = ZONE_DROPDOWN_SETINGS;
    this.statusDropdownSettings = {
      singleSelection: true,
      labelKey:'name',
      text:"Select Status",
      classes:"myclass custom-class",
      noDataLabel: 'No Status Found.'
    };
  }

  ngOnInit() {
    this.getCameras({ page: 1 });
    this.getCompanies();
    this.dropdownStatusList = [
      { id: 1, name: 'Active' },
      { id: 0, name: 'Inactive' },
      { id: "subscription_active", name: 'Subscription Active' },
      { id: "subscription_expired", name: 'Subscription Expired' }
    ]
    this.searchForm = this.formBuilder.group({
      search: [''],
      companyId: [[]],
      officeId: [[]],
      zoneId: [[]],
      status: [[]]
    });
  }

  getCompanies(){
    this.companyService.getCompanies({ per_page: -1 }).subscribe(
      response => {
        this.dropdownCompanyList = response['data'];
      },
      error => { this.OnErrorDeleteCamera(error); }
    );
  }

  getCameras(params){
    this.lockService.getLocks({device_type: 'Camera', ...params}).subscribe(response => {
      this.onSucessGetCameras(response); },
    error => { this.onErrorGetCameras(error); }
    );
  }

  getCamera(id){
    this.lockService.getLock(id).subscribe(response => {
      this.camera = response.data
    },
    error => { this.onErrorGetCamera(error); }
    );
  }

  getStatus(camera) {
    if (camera.status == 0) {
      return 'In Active'
    } else if (camera.status == 1) {
      return 'Active'
    } else if (camera.status == 2) {
      return 'Archived'
    }
  }

  expiresIn(camera) {
    if (camera.subscription_status == '0') {
      return 'Expired'
    }
    let endDate = moment(moment(camera.subscription_end).format('YYYY-MM-DD'))
    let expiry = endDate.diff(moment().format('YYYY-MM-DD'), 'days')
    if (expiry < 0) {
      return 'Expired'
    } else if (expiry == 0){
      return 'Today'
    } else {
      return moment(moment().format('YYYY-MM-DD')).preciseDiff(endDate);
    }
  }

  getCompanyOffices(company){
    this.officeService.getCompanyOffices(company).subscribe(
      response => { this.dropdownOfficeList = response.data; },
      error => { this.onErrorGetCameras(error); }
    );
  }

  getOfficeZones(office){
    this.officeService.getZones(office).subscribe(response => {
      this.dropdownZoneList = response.data; },
    error => { this.onErrorGetCamera(error); }
    );
  }

  deleteCamera(camera){
    this.lockService.delete(camera.id).subscribe(response => {
      this.onSuccessDeleteCamera(response); },
    error => { this.OnErrorDeleteCamera(error); }
    );
  }

  onSuccessDeleteCamera(response){
    this.alertService.success(response['message']);
    this.getCameras({ page: this.currentPage, ...this.searchForm.value });
  }

  OnErrorDeleteCamera(error){
    this.alertService.error(error['error']['message']);
  }

  onSucessGetCameras(response){
    this.camerasList = response['data'];
    this.totalItems = response['total'];
    this.currentPage = response['current_page'];
    this.pageSize = response['per_page'];
  }

  onErrorGetCameras(error){
    this.alertService.error(error['error']['message']);
  }

  onErrorGetCamera(error){
    this.alertService.error(error['error']['message']);
  }

  onCompanySelect(company:any){
    this.getCompanyOffices(company);
  }

  onOfficeSelect(office:any){
    this.getOfficeZones(office);
  }

  onZoneSelect(item:any){

  }

  onStatusSelect(item:any){

  }

  pageChanged(page) {
    this.getCameras({ page: page, ...this.searchForm.value })
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
    if(formData['zoneId'] && formData['zoneId'][0]) {
      formData['zone_id'] = formData['zoneId'][0]['id']
    } else {
      delete formData['zone_id'];
    }
    if(formData['status'] && formData['status'][0]) {
      formData['status'] = formData['status'][0]['id']
    } else {
      delete formData['status'];
    }
    delete formData['companyId'];
    delete formData['officeId'];
    delete formData['zoneId'];
    this.getCameras(formData)
  }

}
