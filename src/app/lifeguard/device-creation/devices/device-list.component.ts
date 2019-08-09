import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DeviceService } from './device.service';
import { AlertService } from '../../services';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VENDOR_DROPDOWN_SETINGS, COMPANY_DROPDOWN_SETINGS } from './../../constants/drop-down.constants';
import { VendorService } from '../vendors/vendor.service';
import { CompanyService } from '../companies/company.service';

@Component({
  selector: 'app-device-list',
  templateUrl: './device-list.component.html',
  styleUrls: ['./device-list.component.css'],
})
export class DeviceListComponent implements OnInit {

  searchForm: FormGroup;
  deviceList:any;
  device:any;
  totalItems;
  currentPage;
  pageSize = 10;

  dropdownVendorList = [];
  vendorDropdownSettings = {};
  selectedVendorItems = [];
  dropdownCompanyList = [];
  selectedCompanyItems = [];
  companyDropdownSettings = {};
  dropdownStatusList = [];
  statusDropdownSettings = {};
  dropdownDeviceTypeList = [];
  deviceTypeDropdownSettings = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private deviceService: DeviceService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private vendorService:VendorService,
    private companyService: CompanyService
  ) {
    this.vendorDropdownSettings = VENDOR_DROPDOWN_SETINGS;
    Object.assign(this.companyDropdownSettings, COMPANY_DROPDOWN_SETINGS);
    this.companyDropdownSettings['text'] = 'Assigned To';
    this.statusDropdownSettings = {
      singleSelection: true,
      labelKey:'name',
      text:"Select Status",
      classes:"myclass custom-class",
      noDataLabel: 'No Status Found.'
    };
    this.deviceTypeDropdownSettings = {
      singleSelection: true,
      labelKey:'name',
      text:"Select Device Type",
      classes:"myclass custom-class",
      noDataLabel: 'No Device Type Found.'
    };
  }

  ngOnInit() {
    this.getVendors();
    this.getDevices({page: 1});
    this.getCompanies();
    this.dropdownStatusList = [
      { id: 1, name: 'Active' },
      { id: 0, name: 'Inactive' },
      { id: 2, name: 'Archived' }
    ];
    this.dropdownDeviceTypeList = [
      { id: 'Lock', name: 'Lock' },
      { id: 'Hub', name: 'Hub' },
      { id: 'Camera', name: 'Camera' }
    ];
    this.searchForm = this.formBuilder.group({
      search: [''],
      companyId: [[]],
      status: [[]],
      deviceType: [[]]
    });
  }

  getDevices(params){
    this.deviceService.getDevices(params).subscribe(response => {
      this.onSuccessgetDevices(response); },
    error => { this.onErrorGetDevices(error); }
    );
  }

  getVendors(){
    this.vendorService.getVendors({per_page: -1}).subscribe(response => {
      this.onSucessGetVendors(response); },
    error => { this.OnErrorGetVendors(error); }
    );
  }

  getCompanies(){
    this.companyService.getCompanies({ per_page: -1 }).subscribe(
      response => {
        this.dropdownCompanyList = response['data'];
        this.dropdownCompanyList.unshift({id: 0, name: 'Not Assigned'});
      },
      error => { this.onErrorGetDevices(error); }
    );
  }

  getStatus(device) {
    if (device.status === 0) {
      return 'In Active'
    } else if (device.status === 1) {
      return 'Active'
    } else if (device.status === 2) {
      return 'Archived'
    }
  }

  getAssignedCompany(device) {
    if (device['company_device']) {
      return device['company_device']['company']['name']
    } else {
      return 'Not Assigned'
    }
  }

  deleteDevice(device){
    this.deviceService.delete(device.id).subscribe(response => {
      this.onSuccessDeleteDevice(response); },
    error => { this.onErrorGetDevices(error); }
    );
  }

  onSuccessDeleteDevice(response){
    this.alertService.success(response['message']);
    this.getDevices({ page: this.currentPage })
  }

  onSuccessgetDevices(response){
    this.deviceList = response['data'];
    this.totalItems = response['total'];
    this.currentPage = response['current_page'];
    this.pageSize = response['per_page'];
  }

  onErrorGetDevices(error){
    this.alertService.error(error['error']['message']);
  }

  getDevice(id){
    this.deviceService.getDevice(id).subscribe(response => {
      this.device = response.data
    },
    error => { this.onErrorGetDevices(error); }
    );
  }

  onSuccessGetCompany(response){
    this.device = response.data
  }

  pageChanged(page) {
    this.getDevices({ page: page, ...this.searchForm.value })
  }

  onSearch(formData) {
    if(this.selectedVendorItems[0]) {
      formData['vendor_id'] = this.selectedVendorItems[0]['id']
    } else {
      delete formData['vendor_id'];
    }
    if(formData['companyId'] && formData['companyId'][0]) {
      formData['company_id'] = formData['companyId'][0]['id']
    } else {
      delete formData['company_id'];
    }
    if(formData['status'] && formData['status'][0]) {
      formData['status'] = formData['status'][0]['id']
    } else {
      delete formData['status'];
    }
    if(formData['deviceType'] && formData['deviceType'][0]) {
      formData['type'] = formData['deviceType'][0]['id']
    } else {
      delete formData['type'];
    }
    this.getDevices(formData)
  }

  onSucessGetVendors(response){
    this.dropdownVendorList = response.data
  }

  OnErrorGetVendors(error){
    this.alertService.error(error['error']['message']);
  }

  onVendorSelect(item:any){

  }

  onCompanySelect(item:any){

  }

  onStatusSelect(item:any){

  }

  onDeviceTypeSelect(item:any){

  }

  getDeviceIcon(device) {
    if (device.type == 'Lock') {
      return 'lock';
    } else if (device.type == 'Camera') {
      return 'video-camera';
    } else if (device.type == 'Hub') {
      return 'microchip';
    }
  }

}
