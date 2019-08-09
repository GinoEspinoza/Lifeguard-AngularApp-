import { Component, OnInit,  } from '@angular/core';
import { SubUserService } from '../sub-user.service';
import { AlertService } from '../../services';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompanyService } from '../../device-creation/companies/company.service';
import { COMPANY_DROPDOWN_SETINGS, ROLES, ROLE_SETTINGS } from '../../constants/drop-down.constants';

@Component({
  selector: 'app-subuser-list',
  templateUrl: './user-list.component.html'
})
export class SubUserListComponent implements OnInit {

  searchForm: FormGroup;
  users;
  totalItems;
  currentPage;
  pageSize = 10;
  dropdownCompanyList = [];
  selectedCompanyItems = [];
  companyDropdownSettings = {};
  dropdownStatusList = [];
  statusDropdownSettings = {};
  dropdownRoleList = [];
  roleDropdownSettings = {};

  constructor(
    private userService: SubUserService,
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
    this.dropdownRoleList = ROLES;
    this.roleDropdownSettings = ROLE_SETTINGS;
  }

  ngOnInit() {
    this.getUsers({ page: 1 , role_id:4 });
    this.getCompanies();
    this.dropdownStatusList = [
      { id: 1, name: 'Active' },
      { id: 0, name: 'Inactive' }
    ]
    this.searchForm = this.formBuilder.group({
      search: [''],
      companyId: [[]],
      status: [[]],
    });
  }

  getUsers(params) {
    this.userService.getUserList(params).subscribe(
      response => {
        this.users = response['data'];
        this.totalItems = response['total'];
        this.currentPage = response['current_page'];
        this.pageSize = response['per_page'];
      },
      error => { this.onErrorGetUserList(error); }
    );
  }

  getStatus(user) {
    if (user.status == 0) {
      return 'In Active'
    } else if (user.status == 1) {
      return 'Active'
    } else if (user.status == 2) {
      return 'Archived'
    }
  }

  getCompanies(){
    this.companyService.getCompanies({ per_page: -1 }).subscribe(
      response => {
        this.dropdownCompanyList = response['data'];
      },
      error => { this.OnErrorDeleteUser(error); }
    );
  }

  onErrorGetUserList(error){
  }

  deleteUser(user){
    this.userService.delete(user.id).subscribe(
      response => { this.onSuccessDeleteUser(response); },
      error => { this.OnErrorDeleteUser(error); }
    );
  }

  onSuccessDeleteUser(response){
    this.alertService.success(response['message'])
    this.getUsers({ page: this.currentPage });
  }

  OnErrorDeleteUser(error) {
    this.alertService.error(error['error']['message'])
  }


  onCompanySelect(item:any){

  }

  onStatusSelect(item:any){

  }

  onRoleSelect(item:any){

  }
  
  pageChanged(page) {
    this.getUsers({ page: page, ...this.searchForm.value })
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
    console.log(formData)
    this.getUsers(formData)
  }

}
