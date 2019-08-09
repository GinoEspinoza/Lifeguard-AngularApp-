import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AssignDeviceService } from './assign-device.service';
import { AlertService } from '../../services';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompanyService } from '../../device-creation/companies/company.service';
import { COMPANY_DROPDOWN_SETINGS } from '../../constants/drop-down.constants';

@Component({
  selector: 'app-assign-device-list',
  templateUrl: './assign-device-list.component.html',
  styleUrls: ['./assign-device-list.component.css']
})
export class AssignDeviceListComponent implements OnInit {

  assignDevices:any;
  assignDevice:any;
  deviceData = [];
  objectKeys = Object.keys;
  searchForm: FormGroup;
  dropdownCompanyList = [];
  selectedCompanyItems = [];
  companyDropdownSettings = {};
  dropdownStatusList = [];
  statusDropdownSettings = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private assignDeviceService: AssignDeviceService,
    private alertService: AlertService,
    private companyService: CompanyService,
    private formBuilder: FormBuilder,
  ) {
    this.companyDropdownSettings = COMPANY_DROPDOWN_SETINGS;
    this.statusDropdownSettings = {
      singleSelection: true,
      labelKey:'name',
      text:"Select Status",
      classes:"myclass custom-class",
      noDataLabel: 'No Status Found.'
    };
  }

  ngOnInit() {
    this.getAssignedDevices({});
    this.getCompanies();
    this.dropdownStatusList = [
      { id: 1, name: 'Active' },
      { id: 0, name: 'Inactive' }
    ]
    this.searchForm = this.formBuilder.group({
      search: [''],
      companyId: [[]],
      status: [[]]
    });
  }

  getAssignedDevices(params){
    this.assignDeviceService.getAssignDevices(params).subscribe(response => {
      this.onSucessGetAssignDevices(response); },
    error => { this.onErrorGetAssigDevices(error); }
    );
  }

  getAssignedDevice(id){
    this.assignDeviceService.getAssignDevice(id).subscribe(response => {
      this.assignDevice = response.data
    },
    error => { this.onErrorGetAssigDevices(error); }
    );
  }

  getCompanies(){
    this.companyService.getCompanies({ per_page: -1 }).subscribe(
      response => {
        this.dropdownCompanyList = response['data'];
      },
      error => { this.onErrorGetAssigDevices(error); }
    );
  }

  deleteAssignedDevice(assignedDevice){
    this.assignDeviceService.delete(assignedDevice.id).subscribe(response => {
      this.onSuccessDeleteAssignedDevice(response); },
    error => { this.onErrorGetAssigDevices(error); }
    );
  }

  showHideData(item) {
    this.deviceData.forEach((device) => {
      if (device.company && device.company.name == item.heading) {
        device.showData = !device.showData;
      }
    })
    item.collapsed = !item.collapsed;
  }

  onSuccessDeleteAssignedDevice(response){
    this.alertService.success(response['message'])
    this.getAssignedDevices({});
  }

  onSucessGetAssignDevices(response){
    this.assignDevices = response.data;
    let groupData = {};
    this.deviceData = [];
    this.assignDevices.forEach((device) => {
      if(groupData[device.company.name]) {
        groupData[device.company.name].push(device)
      } else {
        groupData[device.company.name] = [device]
      }
    })
    let keys = Object.keys(groupData).sort();
    keys.forEach((key) => {
      this.deviceData.push({heading: key, count: groupData[key].length});
      this.deviceData.push(...groupData[key]);
    })
  }

  onErrorGetAssigDevices(error){
    this.alertService.error(error['error']['message'])
  }

  onCompanySelect(item:any){

  }

  onStatusSelect(item:any){

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

  onSearch(formData) {
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
    this.getAssignedDevices(formData)
  }

}
