import { Component, OnInit,  } from '@angular/core';
import { UserService } from '../users/user.service';
import { GroupService } from './group.service';
import { AlertService } from '../services';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompanyService } from '../device-creation/companies/company.service';
import { COMPANY_DROPDOWN_SETINGS, ROLES, ROLE_SETTINGS } from '../constants/drop-down.constants';

@Component({
  selector: 'app-group-list',
  templateUrl: './group.component.html'
})
export class GroupComponent implements OnInit {

  searchForm: FormGroup;
  users;
  groups;
  totalItems;
  currentPage;
  pageSize = 10;
  dropdownCompanyList = [];
  selectedCompanyItems = [];
  companyDropdownSettings = {};
  dropdownStatusList = [];
  statusDropdownSettings = {};

  constructor(
    private groupService: GroupService,
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
    this.getGroups({ page: 1 });
    this.getCompanies();
    this.dropdownStatusList = [
      { id: 1, name: 'Active' },
      { id: 0, name: 'Inactive' }
    ]
    this.searchForm = this.formBuilder.group({
      search: [''],
      companyId: [[]],
      status: [[]],
      role: [[]]
    });
  }

  getGroups(params) {
    this.groupService.getGroups(params).subscribe(
      response => {
        
        this.groups = response['data'];
        this.totalItems = response['total'];
        this.currentPage = response['current_page'];
        this.pageSize = response['per_page'];
        console.log("groups are" , this.groups);
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
      error => { this.OnErrorDeleteGroup(error); }
    );
  }

  onErrorGetGroupList(error){
  }

  deleteGroup(group){
    this.groupService.delete(group.id).subscribe(
      response => { this.onSuccessDeleteGroup(response); },
      error => { this.OnErrorDeleteGroup(error); }
    );
  }

  onSuccessDeleteGroup(response){
    this.alertService.success(response['message'])
    this.getGroups({ page: this.currentPage });
  }

  OnErrorDeleteGroup(error) {
    this.alertService.error(error['error']['message'])
  }


  onCompanySelect(item:any){

  }

  onStatusSelect(item:any){

  }

  onRoleSelect(item:any){

  }
  
  pageChanged(page) {
    this.getGroups({ page: page, ...this.searchForm.value })
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
    this.getGroups(formData)
  }

}
