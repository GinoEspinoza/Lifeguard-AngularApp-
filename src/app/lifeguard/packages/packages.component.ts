import { Component, OnInit,  } from '@angular/core';
import { UserService } from '../users/user.service';
import { PackagesService } from './packages.service';
import { AlertService } from '../services';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompanyService } from '../device-creation/companies/company.service';
import { COMPANY_DROPDOWN_SETINGS, ROLES, ROLE_SETTINGS } from '../constants/drop-down.constants';

@Component({
  selector: 'app-packages-list',
  templateUrl: './packages.component.html',
  styleUrls: ['./packages.component.css']
})
export class PackagesComponent implements OnInit {

  searchForm: FormGroup;
  licenseForm: FormGroup;
  users;
  packages;
  totalItems;
  currentPage;
  pageSize = 10;
  typeModel = 1;
  selectedType : any;
  dropdownCompanyList = [];
  selectedCompanyItems = [];
  companyDropdownSettings = {};
  dropdownStatusList = [];
  statusDropdownSettings = {};
  licensePrices : any;
  typeList : any;
  constructor(
    private packagesService: PackagesService,
    private userService: UserService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private companyService: CompanyService
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
    this.typeList = [
			{id:1 , name : 'Monthly'},
			{id:2 , name : 'Yearly'},
		]
    this.getPackages({ page: 1 });
    this.getCompanies();
    this.dropdownStatusList = [
      { id: 1, name: 'Active' },
      { id: 0, name: 'Inactive' }
    ]
    this.licenseForm = this.formBuilder.group({
      office: [0],
      lock: [0],
      camera: [0],
      sub_user: [0]
    });
    this.searchForm = this.formBuilder.group({
      search: [''],
      companyId: [[]],
      status: [[]],
      role: [[]]
    });
    this.getLicensePrices(this.typeModel);
  }
  getLicensePrices(type){
    this.packagesService.getLicensePrices(type).subscribe(
      response => {
        this.licensePrices = response['data'];
        this.licenseForm.patchValue({
          office: this.licensePrices.office,
          lock: this.licensePrices.lock,
          camera: this.licensePrices.camera,
          sub_user: this.licensePrices.sub_user,
        })
        console.log("Prices are" , this.licensePrices);
      },
      error => { this.onErrorGetGroupList(error); }
    );
  }
  getPackages(params) {
    this.packagesService.getPackages(params).subscribe(
      response => {
        this.packages = response['data'];
        this.totalItems = response['total'];
        this.currentPage = response['current_page'];
        this.pageSize = response['per_page'];
        console.log("packages are" , this.packages);
      },
      error => { this.onErrorGetGroupList(error); }
    );
  }

  getStatus(group) {
    if (group.status == 0) {
      return 'In Active'
    } else if (group.status == 1) {
      return 'Active'
    } else if (group.status == 2) {
      return 'Archived'
    }
  }

  getCompanies(){
    this.companyService.getCompanies({ per_page: -1 }).subscribe(
      response => {
        this.dropdownCompanyList = response['data'];
      },
      error => { this.OnErrorDeletePackage(error); }
    );
  }

  onErrorGetGroupList(error){
  }

  deletePackage(package_){
    this.packagesService.delete(package_.id).subscribe(
      response => { this.onSuccessDeletePackage(response); },
      error => { this.OnErrorDeletePackage(error); }
    );
  }

  onSuccessDeletePackage(response){
    this.alertService.success(response['message'])
    this.getPackages({ page: this.currentPage });
  }

  OnErrorDeletePackage(error) {
    this.alertService.error(error['error']['message'])
  }

  
  pageChanged(page) {
    this.getPackages({ page: page, ...this.searchForm.value })
  }
  isInvalidLicenseForm(){
    if(this.licenseForm.value.office == 0 && this.licenseForm.value.lock == 0 && this.licenseForm.value.lock == 0 && this.licenseForm.value.sub_user == 0)return true;
    return false;
  }
  onSearch(formData) {
    if(formData['status'] && formData['status'][0]) {
      formData['status'] = formData['status'][0]['id']
    } else {
      delete formData['status'];
    }
    this.getPackages(formData)
  }
  onLicenseSubmit(){
    if (this.isInvalidLicenseForm()) {
      return;
    }
    let formData = this.licenseForm.value;
    formData.status = formData.status ? '1' : '0';
    this.packagesService.updateLicensePrices(formData,this.typeModel)
    .subscribe(
    response => {
      this.alertService.success("Updated successfully");
    },
    error => {
      this.alertService.error(error['error']['message']);
    });
  }
  onItemSelectType(type) {
    this.selectedType = type
    this.typeModel = type.id
    this.getLicensePrices(this.typeModel);
  }
  onStatusSelect(status){
    
  }
}
